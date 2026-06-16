import { useMemo, useRef, useCallback } from 'react'
// import ReactDOM from 'react-dom/client'


//3 TanStack Libraries!!!
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
    // type OnChangeFn,
  type Row,
//   type SortingState,
  useReactTable,
} from '@tanstack/react-table'
// import {
//   keepPreviousData,
//   QueryClient,
//   QueryClientProvider,
//   useInfiniteQuery,
// } from '@tanstack/react-query'
import type { House, HouseResponse } from '../utils/constants';
import { useVirtualizer } from '@tanstack/react-virtual'
import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from '@tanstack/react-query';

// const fetchSize = 50

// type Data = {
//     pageParams: number[];
//     pages: ResponsePage[];
// }

type HousesTableProps = {
    isFetching: boolean;
    data: InfiniteData<HouseResponse, unknown> | undefined;
    fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<HouseResponse, unknown>, Error>>;
    isLoading: boolean;
}

function HousesTable({ data, fetchNextPage, isFetching, isLoading }: HousesTableProps) {
  //we need a reference to the scrolling element for logic down below
  const tableContainerRef = useRef<HTMLDivElement>(null)

//   const [sorting, setSorting] = useState<SortingState>([])

    const columns = useMemo<ColumnDef<House, unknown>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                // size: 60,
            },
            {
                accessorKey: 'homeowner',
                header: 'Home Owner',
                // cell: (info) => info.getValue(),
            },
            {
                accessorKey: 'address',
                // header: () => <span>Address</span>,
                header: 'Address',
            },
            {
                accessorKey: 'photoURL',
                header: 'Photo',
                cell: (url) => <img src={url.getValue() as string}></img>,
            },
            {
                accessorKey: 'price',
                header: 'Price',
                // header: () => <span>Visits</span>,
            },
            // {
            //     accessorKey: 'status',
            //     header: 'Status',
            // },
            // {
            //     accessorKey: 'progress',
            //     header: 'Profile Progress',
            //     size: 80,
            // },
            // {
            //     accessorKey: 'createdAt',
            //     header: 'Created At',
            //     cell: (info) => info.getValue<Date>().toLocaleString(),
            //     size: 200,
            // },
        ],
        [],
    )

  //react-query has a useInfiniteQuery hook that is perfect for this use case
//   const { data, fetchNextPage, isFetching, isLoading } =
//     useInfiniteQuery<PersonApiResponse>({
//       queryKey: [
//         'people',
//         sorting, //refetch when sorting changes
//       ],
//       queryFn: async ({ pageParam = 0 }) => {
//         const start = (pageParam as number) * fetchSize
//         const fetchedData = await fetchData(start, fetchSize, sorting) //pretend api call
//         return fetchedData
//       },
//       initialPageParam: 0,
//       getNextPageParam: (_lastGroup, groups) => groups.length,
//       refetchOnWindowFocus: false,
//       placeholderData: keepPreviousData,
//     })

  //flatten the array of arrays from the useInfiniteQuery hook
  const flatData = useMemo(
    () => data?.pages?.flatMap((page) => page.houses) ?? [],
    [data],
  )
//   console.log("flatData: ", flatData)
//   const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0
  const totalFetched = flatData.length    

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement

        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching
        //   !isFetching &&
        //   totalFetched < totalDBRowCount
        ) {
          fetchNextPage()
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched],
  )

  const table = useReactTable({
    data: flatData,
    columns,
    state: {
    //   sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    debugTable: true,
  })

  //scroll to top of table when sorting changes
//   const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
//     setSorting(updater)
//     if (!!table.getRowModel().rows.length) {
//       rowVirtualizer.scrollToIndex?.(0)
//     }
//   }

   //since this table option is derived from table row model state, we're using the table.setOptions utility
  table.setOptions((prev) => ({
    ...prev,
    // onSortingChange: handleSortingChange,
  }))

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  })

  if (isLoading) {
    return <>Loading...</>
  }

  return (
    <div className="app">
      {/* {process.env.NODE_ENV === 'development' ? (
        <p>
          <strong>Notice:</strong> You are currently running React in
          development mode. Virtualized rendering performance will be slightly
          degraded until this application is built for production.
        </p>
      ) : null}
      ({flatData.length} of {totalDBRowCount} rows fetched) */}
      <div
        className="container"
        onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
        ref={tableContainerRef}
        style={{
          overflow: 'auto', //our scrollable table container
          position: 'relative', //needed for sticky header
          height: '600px', //should be a fixed height
        }}
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table style={{ display: 'grid' }}>
          <thead
            style={{
              display: 'grid',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ display: 'flex', width: '100%' }}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      style={{
                        display: 'flex',
                        width: header.getSize(),
                      }}
                    >
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              display: 'grid',
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: 'relative', //needed for absolute positioning of rows
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<House>
              return (
                <tr
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                  key={row.id}
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                    width: '100%',
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        style={{
                          display: 'flex',
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {isFetching && <div>Fetching More...</div>}
    </div>
  )

}

export default HousesTable;
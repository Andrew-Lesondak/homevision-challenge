import { useMemo, useRef, useCallback } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  //   type RowData,
  //   type TData,
  //   type TValue,
  useReactTable,
} from '@tanstack/react-table';
import type { House, HouseResponse } from '../utils/constants';
import { useVirtualizer } from '@tanstack/react-virtual';
import type {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import { formatDollars } from '../utils/helpers';
import { Loader } from './Loader';
import { parseAddress } from 'addresser';

// declare module '@tanstack/react-table' {
//   interface ColumnMeta<House extends RowData, TValue> {
//     alignment: string
//   }
// }

type HousesTableProps = {
  isFetching: boolean;
  data: InfiniteData<HouseResponse, unknown> | undefined;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined,
  ) => Promise<
    InfiniteQueryObserverResult<InfiniteData<HouseResponse, unknown>, Error>
  >;
  isLoading: boolean;
};

function HousesTable({
  data,
  fetchNextPage,
  isFetching,
  isLoading,
}: HousesTableProps) {
  //we need a reference to the scrolling element for logic down below
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<House, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: () => <div className="w-full text-left">ID</div>,
        cell: (id) => (
          <div className="w-full text-left">{id.getValue() as number}</div>
        ),
        // size: 20
      },
      {
        accessorKey: 'homeowner',
        header: 'Home Owner',
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: (a) => {
        //   console.log(parseAddress(a.getValue() as string));
        // console.log('a: ', a)
        try {
          const formatted = parseAddress(a.getValue() as string);
        //   console.log('formatted: ', formatted)
          return (
            <div className="text-left">
              <div>{formatted.addressLine1}</div>
              <div>{`${formatted.placeName}, ${formatted.stateAbbreviation} ${formatted.zipCode}`}</div>
            </div>
          );
        } catch(e) {
            // Just use fallback instead
            console.error(e);
        }

          return a.getValue()
        },
      },
      {
        accessorKey: 'price',
        header: () => <div className="w-full text-right">Price</div>,
        cell: (price) => (
          <div className="w-full text-right">
            {formatDollars(price.getValue() as number)}
          </div>
        ),
        // meta: 'right'
      },
      {
        accessorKey: 'photoURL',
        header: '',
        cell: (url) => (
          <img className="w-auto max-h-19" src={url.getValue() as string}></img>
        ),
      },
    ],
    [],
  );

  //flatten the array of arrays from the useInfiniteQuery hook
  const flatData = useMemo(
    () => data?.pages?.flatMap((page) => page.houses) ?? [],
    [data],
  );

  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;

        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching
          //   !isFetching &&
          //   totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched],
  );

  // TODO: add separate columns for address values
  const formatHousingData = (data: House[]) => {
    // TODO: Handle empty addresses
    return data.map((h) => {
      const { addressLine1, placeName, stateAbbreviation, zipCode } =
        parseAddress(data[0].address);

      return {
        ...h,
        addressLine1,
        placeName,
        stateAbbreviation,
        zipCode,
      };
    });
  };

  const table = useReactTable({
    // data: formatHousingData(flatData),
    data: flatData,
    columns,
    state: {
      //   sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    debugTable: true,
  });

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
  }));

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 100, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  // using isFetching here will hide the table
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {/* {process.env.NODE_ENV === 'development' ? (
        <p>
          <strong>Notice:</strong> You are currently running React in
          development mode. Virtualized rendering performance will be slightly
          degraded until this application is built for production.
        </p>
      ) : null}
      ({flatData.length} of {totalDBRowCount} rows fetched) */}
      <div
        className="relative w-full overflow-auto border rounded-lg border-slate-200 h-150"
        onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
        ref={tableContainerRef}
        // style={{
        //   overflow: 'auto', //our scrollable table container
        //   position: 'relative', //needed for sticky header
        //   height: '600px', //should be a fixed height
        // }}
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table className="grid w-full">
          <thead
            //   className='sticky top-0 z-10 grid text-sm font-medium border-b border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-900'
            className="sticky top-0 z-10 grid text-sm font-medium bg-white border-b border-slate-200 text-slate-600"
            // style={{
            //   display: 'grid',
            //   position: 'sticky',
            //   top: 0,
            //   zIndex: 1,
            // }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                // style={{ display: 'flex', width: '100%' }}
                className="flex w-full"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="px-2.5 py-2 font-medium flex text-left w-full"
                      style={
                        {
                          // textAlign: header.column.columnDef?.meta as string,
                          // width: header.getSize(),
                        }
                      }
                    >
                      {/* Sorting click handling */}
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none w-full'
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
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody
            className="relative grid text-sm group text-slate-600 border-slate-200"
            style={{
              //   display: 'grid',
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              //   position: 'relative', //needed for absolute positioning of rows
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<House>;
              return (
                <tr
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                  key={row.id}
                  className="absolute flex w-full border-b border-slate-200 last:border-0"
                  style={{
                    // display: 'flex',
                    // position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                    // width: '100%',
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className="flex w-full p-3 text-left justify-left"
                        style={
                          {
                            //   display: 'flex',
                            //   width: cell.column.getSize(),
                          }
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {isFetching && (
          <div className="flex justify-center w-full">
            Fetching More <Loader />
          </div>
        )}
      </div>
    </div>
  );
}

export default HousesTable;

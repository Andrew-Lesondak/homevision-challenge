import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table';
import type {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { House, HouseResponse } from '../utils/constants';
import { formatAddress, formatDollars } from '../utils/helpers';
import { Loader } from './Loader';
import { HousePhoto } from './HousePhoto';

type HousesTableProps = {
  data: InfiniteData<HouseResponse, unknown> | undefined;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined,
  ) => Promise<InfiniteQueryObserverResult<InfiniteData<HouseResponse, unknown>, Error>>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
};

function HousesTable({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
}: HousesTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<House, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: () => <span className="block w-full text-left">ID</span>,
        cell: (info) => (
          <div className="w-full font-medium text-left text-slate-700">#{info.getValue() as number}</div>
        ),
      },
      {
        accessorKey: 'homeowner',
        header: 'Homeowner',
        cell: (info) => (
          <div className="w-full font-medium text-left text-slate-950">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: (info) => {
          const display = formatAddress(info.getValue() as string);

          return (
            <a
              className="block w-full text-left transition text-slate-700 hover:text-sky-700 hover:underline"
              href={display.mapsUrl}
              rel="noreferrer"
              target="_blank"
              title="Open address in Google Maps"
            >
              <div className="font-medium text-slate-950">{display.line1}</div>
              {display.line2 ? (
                <div className="text-xs text-slate-500">{display.line2}</div>
              ) : null}
            </a>
          );
        },
      },
      {
        accessorKey: 'price',
        header: () => <span className="block w-full text-right">Price</span>,
        cell: (info) => (
          <div className="w-full font-semibold text-right text-slate-950">
            {formatDollars(info.getValue() as number)}
          </div>
        ),
      },
      {
        accessorKey: 'photoURL',
        header: () => <span className="block w-full text-left">Photo</span>,
        cell: (info) => <HousePhoto house={info.row.original} />,
      },
    ],
    [],
  );

  const flatData = useMemo(
    () => data?.pages?.flatMap((page) => page.houses) ?? [],
    [data],
  );

  // TanStack Table currently triggers the React Compiler compatibility warning here.
  // The hook is still safe to use in this app, so we intentionally keep it.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.id),
    manualSorting: true,
  });

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 112,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 8,
  });

  const footerMessage = isFetchingNextPage
    ? 'Loading more houses'
    : !hasNextPage && rows.length > 0
      ? 'All available houses loaded'
      : null;

  const footerRowHeight = footerMessage ? 72 : 0;

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (!containerRefElement || isFetchingNextPage || !hasNextPage) {
        return;
      }

      const { scrollHeight, scrollTop, clientHeight } = containerRefElement;

      if (scrollHeight - scrollTop - clientHeight < 500) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached, flatData.length, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center rounded-3xl border border-slate-200 bg-white/95 px-6 py-12 shadow-sm">
        <Loader label="Loading houses" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/95 px-6 py-12 text-center text-slate-600 shadow-sm">
        <div className="max-w-md space-y-2">
          <p className="text-lg font-semibold text-slate-900">No houses loaded yet</p>
          <p className="text-sm leading-6">
            The API may be returning an empty page, or the current request range has not loaded
            any houses yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border shadow-sm rounded-3xl border-slate-200 bg-white/95">
      <div
        ref={tableContainerRef}
        className="relative max-h-[63vh] overflow-auto"
        onScroll={(event) => fetchMoreOnBottomReached(event.currentTarget)}
      >
        <table className="grid w-full">
          <thead className="sticky top-0 z-10 grid text-sm font-semibold border-b border-slate-200 bg-white/95 text-slate-700 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="flex items-center w-full px-4 py-3 text-left"
                    scope="col"
                  >
                    <div
                      className={
                        header.column.getCanSort() ? 'w-full cursor-pointer select-none' : 'w-full'
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            className="relative grid text-sm text-slate-700"
            style={{ height: `${rowVirtualizer.getTotalSize() + footerRowHeight}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<House>;

              return (
                <tr
                  key={row.id}
                  ref={(node) => rowVirtualizer.measureElement(node)}
                  className="absolute flex w-full border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  data-index={virtualRow.index}
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="flex items-center w-full px-4 py-3 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}

            {footerMessage ? (
              <tr
                aria-live="polite"
                className="absolute flex w-full text-slate-600"
                style={{ transform: `translateY(${rowVirtualizer.getTotalSize()}px)` }}
              >
                <td
                  colSpan={columns.length}
                  className="flex items-center justify-center w-full px-4 py-3 text-center"
                >
                  {isFetchingNextPage ? <Loader label={footerMessage} compact /> : (
                    <span className="text-sm font-medium text-slate-500">{footerMessage}</span>
                  )}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HousesTable;

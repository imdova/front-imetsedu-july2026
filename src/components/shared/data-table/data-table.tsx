"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Inbox } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Optional toolbar rendered above the table (search, filters, actions). */
  toolbar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
  /** Bulk action bar, shown only when one or more rows are selected. */
  bulkBar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
  /** Custom footer; falls back to the standard pagination control. */
  footer?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  pageSize?: number;
  className?: string;
}

/**
 * Generic, headless DataTable wrapper. Consumers supply typed columns + data;
 * sorting, filtering, pagination and row-selection state are owned here so each
 * table screen stays declarative. Renders a skeleton while loading and a
 * friendly empty state when there are no rows.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  bulkBar,
  footer,
  isLoading = false,
  emptyState,
  pageSize = 8,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    enableRowSelection: true,
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {toolbar?.(table)}

      {bulkBar && table.getSelectedRowModel().rows.length > 0 && bulkBar(table)}

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-border/70 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 whitespace-nowrap text-xs font-semibold tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {columns.map((_col, j) => (
                    <TableCell key={`sk-${i}-${j}`}>
                      <Skeleton className="h-5 w-full max-w-[160px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-border/60 transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-48">
                  {emptyState ?? (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Inbox className="size-8 opacity-50" />
                      <p className="text-sm font-medium">No results found</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading &&
        table.getRowModel().rows.length > 0 &&
        (footer ? footer(table) : <DataTablePagination table={table} />)}
    </div>
  );
}

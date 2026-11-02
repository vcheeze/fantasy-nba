'use client'

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ITeam, IElement as Player } from '@/hooks/api/metadata'
import { cn } from '@/lib/utils'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  teams: ITeam[]
}

export function PlayerTable({
  columns,
  data,
  teams,
}: DataTableProps<Player, any>) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'form',
      desc: true,
    },
  ])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    total_points: false,
    value_season: false,
    value_form: false,
    minutes: false,
    points_scored: false,
    rebounds: false,
    assists: false,
    blocks: false,
    steals: false,
    status: false,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    filterFns: {
      inArray: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue)) {
          return true
        }
        const rowVal = Number(row.getValue(columnId))
        return filterValue.map(Number).includes(rowVal)
      },
      range: (row, columnId, filterValue) => {
        if (!Array.isArray(filterValue) || filterValue.length !== 2) {
          return true
        }
        const [min, max] = filterValue
        const rowValue = Number(row.getValue(columnId))
        return rowValue >= min && rowValue <= max
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <div className="min-w-0 space-y-4 rounded-lg border p-4 shadow-sm sm:p-6">
      <DataTableToolbar table={table} teams={teams} />

      <div className="@container min-w-0 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    className={cn(
                      'px-2.5 md:px-4',
                      index === 0 && 'sticky left-0 z-20 border-r bg-background'
                    )}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      className={cn(
                        'px-2.5 py-3 md:px-4',
                        index === 0 &&
                          'sticky left-0 z-10 border-r bg-background group-hover:bg-muted'
                      )}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 p-0" colSpan={columns.length}>
                  <div className="sticky left-0 flex h-24 w-[100cqw] items-center justify-center text-center">
                    No players found.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

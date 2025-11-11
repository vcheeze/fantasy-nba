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
    <div className="space-y-4 rounded-lg border p-6 shadow-sm">
      <DataTableToolbar table={table} teams={teams} />

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No players found.
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

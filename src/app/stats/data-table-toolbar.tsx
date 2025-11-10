'use client'

import { InfoIcon, XIcon } from '@phosphor-icons/react'
import type { Table } from '@tanstack/react-table'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  teams: ITeam[]
}

export function DataTableToolbar<TData>({
  table,
  teams,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const sortByOptions = [
    {
      label: 'Form',
      value: 'form',
      description:
        "A player's average fantasy points per game, calculated from all games played in the last 30 days.",
    },
    {
      label: 'Point per Game',
      value: 'points_per_game',
      description:
        "Player's total points divided by player's number of games played.",
    },
    {
      label: 'Total Points',
      value: 'total_points',
      description: 'Total points scored in the season',
    },
    {
      label: 'Value (Season)',
      value: 'value_season',
      description: "Player's total fantasy points divided by player's salary.",
    },
    {
      label: 'Value (Last 30)',
      value: 'value_form',
      description:
        "A player's average points per game in the last 30 days divided by the player's salary.",
    },
    {
      label: 'Salary',
      value: 'now_cost',
      description: 'Cost of signing salary in transactions.',
    },
  ]
  const [sortBy, setSortBy] = useState(
    table.getState().sorting[0]?.id || 'form'
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            className="h-8 w-[150px] lg:w-[250px]"
            onChange={(event) =>
              table.getColumn('web_name')?.setFilterValue(event.target.value)
            }
            placeholder="Search players..."
            value={
              (table.getColumn('web_name')?.getFilterValue() as string) ?? ''
            }
          />
          {table.getColumn('team') && (
            <DataTableFacetedFilter
              column={table.getColumn('team')}
              options={teams.map((team) => ({
                value: team.id,
                label: team.name,
              }))}
              title="Teams"
            />
          )}
          {table.getColumn('element_type') && (
            <DataTableFacetedFilter
              column={table.getColumn('element_type')}
              options={[
                { label: 'Back Court', value: '1' },
                { label: 'Front Court', value: '2' },
              ]}
              title="Position"
            />
          )}
          {isFiltered && (
            <Button
              onClick={() => table.resetColumnFilters()}
              size="sm"
              variant="ghost"
            >
              Reset
              <XIcon />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="flex items-center gap-2">
        <Select
          onValueChange={(value) => {
            setSortBy(value)
            table.setSorting([
              {
                id: value,
                desc: true,
              },
            ])
          }}
          value={sortBy}
        >
          <SelectTrigger className="h-8 w-[150px] lg:w-[250px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortByOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sortByOptions.find((sbo) => sbo.value === sortBy) && (
          <p className="flex items-center gap-1 text-muted-foreground text-sm">
            <InfoIcon />
            {sortByOptions.find((sbo) => sbo.value === sortBy)?.description}
          </p>
        )}
      </div>
    </div>
  )
}

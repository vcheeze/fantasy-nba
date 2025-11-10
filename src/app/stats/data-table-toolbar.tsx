'use client'

import { InfoIcon, XIcon } from '@phosphor-icons/react'
import type { Table } from '@tanstack/react-table'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Field, FieldTitle } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableRangeFilter } from './data-table-range-filter'
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
      label: 'Value (Form)',
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
    <div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm uppercase">Filters</h4>
          <DataTableViewOptions table={table} />
        </div>
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
        <Collapsible>
          <CollapsibleTrigger className="text-primary text-sm underline hover:text-foreground">
            Advanced Filters
            <span className="sr-only">Toggle filters</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 flex items-center gap-8 rounded border border-dashed p-4">
            {table.getColumn('now_cost') && (
              <Field>
                <FieldTitle>Salary</FieldTitle>
                <DataTableRangeFilter
                  column={table.getColumn('now_cost')}
                  description="Filter by player's cost"
                  title="Player Cost"
                />
              </Field>
            )}
            {table.getColumn('points_per_game') && (
              <Field>
                <FieldTitle>Points per Game</FieldTitle>
                <DataTableRangeFilter
                  column={table.getColumn('points_per_game')}
                  description="Filter by player's average points per game"
                  title="Points per Game"
                />
              </Field>
            )}
            {table.getColumn('form') && (
              <Field>
                <FieldTitle>Form</FieldTitle>
                <DataTableRangeFilter
                  column={table.getColumn('form')}
                  description="Filter by player's form (last 30 days)"
                  title="Form"
                />
              </Field>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <h4 className="font-semibold text-sm uppercase">Sort By</h4>
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
    </div>
  )
}

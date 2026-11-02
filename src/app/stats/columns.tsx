'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import type { ITeam, IElement as Player } from '@/hooks/api/metadata'
import { DataTableColumnHeader } from './data-table-column-header'

const getPositionBadge = (type: number) => {
  const variants: Record<
    number,
    {
      label: string
      className: string
    }
  > = {
    1: {
      label: 'BC',
      className: 'bg-primary/15 hover:bg-primary/25 text-primary',
    },
    2: {
      label: 'FC',
      className: 'bg-signal/15 hover:bg-signal/25 text-signal',
    },
  }
  const config = variants[type] || {
    label: 'N/A',
    className: 'bg-muted text-muted-foreground',
  }
  return <Badge className={config.className}>{config.label}</Badge>
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { label: string; className: string }> = {
    a: {
      label: 'Available',
      className: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    i: {
      label: 'Injured',
      className: 'bg-signal text-signal-foreground hover:bg-signal/90',
    },
    d: {
      label: 'Doubtful',
      className: 'border-signal/50 bg-signal/10 text-signal hover:bg-signal/15',
    },
  }
  const config = variants[status] || {
    label: 'Unknown',
    className: 'bg-muted text-muted-foreground hover:bg-muted',
  }
  return <Badge className={config.className}>{config.label}</Badge>
}

export const createColumns = (teams: ITeam[]): ColumnDef<Player>[] => [
  {
    accessorKey: 'web_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Player" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[8.5rem] font-medium leading-snug md:max-w-none">
        {row.getValue('web_name')}
      </div>
    ),
  },
  {
    accessorKey: 'team',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Team" />
    ),
    cell: ({ row }) => {
      const team = teams.find((t) => t.id === row.getValue('team'))
      return team?.short_name || row.getValue('team')
    },
    filterFn: 'inArray' as ColumnDef<Player>['filterFn'],
  },
  {
    accessorKey: 'element_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => getPositionBadge(row.getValue('element_type')),
    filterFn: 'inArray' as ColumnDef<Player>['filterFn'],
  },
  {
    accessorKey: 'now_cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost" />
    ),
    cell: ({ row }) =>
      `$${((row.getValue('now_cost') as number) / 10).toFixed(1)}`,
    filterFn: 'inNumberRange',
  },
  {
    accessorKey: 'points_per_game',
    accessorFn: (row) => Number.parseFloat(row.points_per_game), // convert to number
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PPG" />
    ),
    cell: ({ row }) =>
      (Number.parseFloat(row.getValue('points_per_game')) / 10).toFixed(1),
    filterFn: 'inNumberRange',
  },
  {
    accessorKey: 'form',
    accessorFn: (row) => Number.parseFloat(row.form), // convert to number
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Form" />
    ),
    cell: ({ row }) =>
      (Number.parseFloat(row.getValue('form')) / 10).toFixed(1),
    filterFn: 'inNumberRange',
  },
  {
    accessorKey: 'selected_by_percent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Selected %" />
    ),
    cell: ({ row }) => `${row.getValue('selected_by_percent')}%`,
  },
  {
    accessorKey: 'total_points',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Points" />
    ),
    cell: ({ row }) => Number.parseFloat(row.getValue('total_points')) / 10,
  },
  {
    accessorKey: 'value_season',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Value (Season)" />
    ),
    cell: ({ row }) =>
      (Number.parseFloat(row.getValue('value_season')) / 10).toFixed(2),
  },
  {
    accessorKey: 'value_form',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Value (Form)" />
    ),
    cell: ({ row }) =>
      (Number.parseFloat(row.getValue('value_form')) / 10).toFixed(2),
  },
  {
    accessorKey: 'minutes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Minutes" />
    ),
  },
  {
    accessorKey: 'points_scored',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Points" />
    ),
  },
  {
    accessorKey: 'rebounds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rebounds" />
    ),
  },
  {
    accessorKey: 'assists',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assists" />
    ),
  },
  {
    accessorKey: 'blocks',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Blocks" />
    ),
  },
  {
    accessorKey: 'steals',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Steals" />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
  },
]

'use client'

import { PageHeader } from '@/components/PageHeader'
import PriceChangeLadder from '@/components/PriceChangeLadder'
import { useMetadata } from '@/hooks/api'

import { createColumns } from './columns'
import { PlayerTable } from './data-table'

export default function Stats() {
  const { data } = useMetadata()
  const players = data?.elements || []
  const activePlayers = players.filter((p) => p.status !== 'u')
  const teams = data?.teams || []

  const tableColumns = createColumns(teams)
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        description="Analyze player stats through search, filters, and sorting. Select players to visually compare their stats."
        title="Player Stats"
      />
      <PlayerTable columns={tableColumns} data={activePlayers} teams={teams} />
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <PriceChangeLadder data={activePlayers} />
      </div>
    </div>
  )
}

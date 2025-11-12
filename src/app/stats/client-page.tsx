'use client'

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
      <div className="space-y-2">
        <h2 className="scroll-m-20 font-semibold text-3xl tracking-tight transition-colors first:mt-0">
          Player Stats
        </h2>
        <p className="text-muted-foreground text-xl">
          Analyze player stats through search, filters, and sorting. Select
          players to visually compare their stats.
        </p>
      </div>
      <PlayerTable columns={tableColumns} data={activePlayers} teams={teams} />
      <div className="grid gap-4 lg:grid-cols-2">
        <PriceChangeLadder data={activePlayers} />
      </div>
    </div>
  )
}

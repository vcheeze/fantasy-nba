'use client'

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

import { type IDailyStarters, type IEvent, Position } from '@/hooks/api'
import { useMediaQuery } from '@/hooks/use-media-query'
import { type ChartConfig, ChartContainer } from './ui/chart'

function shortGameday(value: unknown) {
  if (typeof value !== 'string') {
    return ''
  }
  return value
    .replace('Gameweek ', 'GW')
    .replace(' - ', '.')
    .replace('Day ', '')
}

function compactAxisTick(value: number) {
  if (!Number.isFinite(value)) {
    return ''
  }
  const absolute = Math.abs(value)
  if (absolute >= 1000) {
    return `${(value / 1000).toFixed(absolute >= 10_000 ? 0 : 1)}k`
  }
  return `${value}`
}

interface DailyScorersChartProps {
  data: IDailyStarters
  events: IEvent[]
}

export function DailyScorersChart({ data, events }: DailyScorersChartProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const chartData = Object.entries(data).map(([gameday, details]) => ({
    gameday: events.find((event) => event.id.toString() === gameday)?.name,
    points: details.starters.reduce((acc, scorer) => acc + scorer.points, 0),
    players: details.starters,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const players = payload[0].payload.players
      return (
        <div className="max-w-[min(18rem,calc(100vw-2.5rem))] rounded-lg border bg-background p-3 shadow-lg">
          <p className="mb-1 font-medium">{shortGameday(label) || label}</p>
          <p className="mb-2 text-muted-foreground text-sm tabular-nums">
            Total {(payload[0].value / 10).toFixed(1)} pts
          </p>
          <div className="space-y-1">
            {players.map((player: any) => (
              <div
                className="flex items-baseline justify-between gap-3 text-sm"
                key={player.name}
              >
                <span className="min-w-0 font-medium">{player.name}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {(player.points / 10).toFixed(1)}{' '}
                  {player.position === Position.BACK_COURT ? 'BC' : 'FC'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer
      className="aspect-auto h-[260px] w-full animate-fade-in md:h-[400px]"
      config={{} satisfies ChartConfig}
    >
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          className="stroke-muted-foreground/30!"
          strokeDasharray="5 5"
        />
        <XAxis
          axisLine={false}
          dataKey="gameday"
          interval="equidistantPreserveStart"
          minTickGap={isMobile ? 24 : 8}
          tick={{ fontSize: isMobile ? 11 : 12 }}
          tickFormatter={shortGameday}
          tickLine={false}
        />
        <YAxis
          axisLine={false}
          tick={{ fontSize: isMobile ? 11 : 12 }}
          tickFormatter={isMobile ? compactAxisTick : (value) => `${value}`}
          tickLine={false}
          width={isMobile ? 32 : 40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar className="fill-chart-1" dataKey="points" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

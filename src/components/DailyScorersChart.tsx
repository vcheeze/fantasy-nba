'use client'

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

import { type IDailyStarters, type IEvent, Position } from '@/hooks/api'
import { type ChartConfig, ChartContainer } from './ui/chart'

interface DailyScorersChartProps {
  data: IDailyStarters
  events: IEvent[]
}

export function DailyScorersChart({ data, events }: DailyScorersChartProps) {
  const chartData = Object.entries(data).map(([gameday, details]) => ({
    gameday: events.find((event) => event.id.toString() === gameday)?.name,
    points: details.starters.reduce((acc, scorer) => acc + scorer.points, 0),
    players: details.starters,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const players = payload[0].payload.players
      return (
        <div className="rounded-lg border bg-background p-4 shadow-lg">
          <p className="mb-2 font-medium">{label}</p>
          <p className="mb-2 text-muted-foreground text-sm">
            Total Points: {(payload[0].value / 10).toFixed(1)}
          </p>
          <div className="space-y-1">
            {players.map((player: any) => (
              <div
                className="flex justify-between gap-4 text-sm"
                key={player.name}
              >
                <span className="font-medium">{player.name}</span>
                <span className="text-muted-foreground">
                  {(player.points / 10).toFixed(1)} pts (
                  {player.position === Position.BACK_COURT ? 'BC' : 'FC'})
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
      className="h-[400px] w-full animate-fade-in"
      config={{} satisfies ChartConfig}
    >
      <BarChart data={chartData}>
        <CartesianGrid
          className="stroke-muted-foreground/30!"
          strokeDasharray="5 5"
        />
        <XAxis axisLine={false} dataKey="gameday" tickLine={false} />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar className="fill-chart-2" dataKey="points" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

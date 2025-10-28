'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { type IDailyStarters, type IEvent, Position } from '@/hooks/api'

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
    <div className="h-[400px] w-full animate-fade-in">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={chartData}>
          <XAxis
            axisLine={false}
            dataKey="gameday"
            fontSize={12}
            stroke="#888888"
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            fontSize={12}
            stroke="#888888"
            tickFormatter={(value) => `${value}`}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            className="fill-primary"
            dataKey="points"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

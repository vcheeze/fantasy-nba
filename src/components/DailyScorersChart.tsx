'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { IDailyScorers, IEvent } from '@/hooks/api'

interface DailyScorersChartProps {
  data: IDailyScorers
  events: IEvent[]
}

export function DailyScorersChart({ data, events }: DailyScorersChartProps) {
  const chartData = Object.entries(data).map(([gameday, scorers]) => ({
    gameday: events.find((event) => event.id.toString() === gameday)?.name,
    points: scorers.reduce((acc, scorer) => acc + scorer.points, 0),
    players: scorers,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const players = payload[0].payload.players
      return (
        <div className="rounded-lg border bg-background p-4 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <p className="text-sm text-muted-foreground mb-2">
            Total Points: {payload[0].value.toFixed(1)}
          </p>
          <div className="space-y-1">
            {players.map((player: any) => (
              <div
                key={player.name}
                className="text-sm flex justify-between gap-4"
              >
                <span className="font-medium">{player.name}</span>
                <span className="text-muted-foreground">
                  {player.points.toFixed(1)} pts ({player.position})
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
    <div className="h-[300px] w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="gameday"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="points"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

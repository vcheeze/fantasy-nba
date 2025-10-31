'use client'

import { meanBy } from 'lodash'
import { useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './ui/chart'

type GamedayHistoryProps = {
  data: any
}

export default function GamedayHistory({ data }: GamedayHistoryProps) {
  const [dataKey, setDataKey] = useState('rank')

  return (
    <div className="my-4">
      <Card>
        <CardHeader>
          <CardTitle>Season Overview</CardTitle>
          <Select onValueChange={(value) => setDataKey(value)} value={dataKey}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Overall Rank</SelectItem>
              <SelectItem value="gamedayRank">Gameday Rank</SelectItem>
              <SelectItem value="totalPoints">Total Points</SelectItem>
              <SelectItem value="gamedayPoints">Gameday Points</SelectItem>
              <SelectItem value="benchPoints">Bench Points</SelectItem>
            </SelectContent>
          </Select>
          <CardDescription>
            {dataKey === 'gamedayRank' &&
              `Average Gameday rank: ${meanBy(data, 'gamedayRank').toFixed(2)}`}
            {dataKey === 'gamedayPoints' &&
              `Average Gameday points: ${meanBy(data, 'gamedayPoints').toFixed(2)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[400px] w-full"
            config={
              {
                rank: { label: 'Overall Rank', color: 'var(--color-chart-1)' },
                gamedayRank: {
                  label: 'Gameday Rank',
                  color: 'var(--color-chart-1)',
                },
                totalPoints: {
                  label: 'Total Points',
                  color: 'var(--color-chart-1)',
                },
                gamedayPoints: {
                  label: 'Gameday Points',
                  color: 'var(--color-chart-1)',
                },
                benchPoints: {
                  label: 'Bench Points',
                  color: 'var(--color-chart-1)',
                },
              } satisfies ChartConfig
            }
          >
            <LineChart data={data}>
              <CartesianGrid
                className="stroke-muted-foreground/30!"
                strokeDasharray="5 5"
              />
              <XAxis dataKey="name" />
              <YAxis
                domain={['auto', 'auto']}
                scale={dataKey === 'rank' ? 'log' : 'auto'}
              />
              {/* <ReferenceLine
              y={meanBy(data, dataKey)}
              label={{
                value: `Average: ${meanBy(data, dataKey).toFixed(2)}`,
                position: "left",
              }}
              stroke="yellow"
              strokeDasharray="4 4"
            /> */}
              <Line
                dataKey={dataKey}
                stroke="var(--color-chart-1)"
                type="monotone"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {/* <Tooltip /> */}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

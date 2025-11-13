'use client'

import { meanBy } from 'lodash'
import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'

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
import type { IChip } from '@/hooks/api'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './ui/chart'

type GamedayHistoryProps = {
  data: any
  chips?: IChip[]
}

const TagLabel = (props) => {
  const {
    value,
    viewBox: { x, y },
  } = props
  const text = value
  const tagWidth = 120
  const tagHeight = 20
  // make the triangle's vertical span equal to the rect height
  // arrowSize here is half of tagHeight so the triangle's apex is centered vertically
  const arrowSize = tagHeight / 2
  // removed border radius so rect and triangle appear as a single sharp-cornered shape

  // Position label on the left edge of the chart
  const posX = x + 1
  const posY = y - tagHeight / 2

  return (
    // apply Tailwind drop-shadow to the whole group so rect + triangle cast a single shadow
    <g className="drop-shadow-md" transform={`translate(${posX}, ${posY})`}>
      {/* Tag body */}
      <rect className="fill-muted" height={tagHeight} width={tagWidth} />

      {/* Arrow / pointer */}
      <polygon
        className="fill-muted"
        /* triangle spans full rect height: top (y=0), apex (y=tagHeight/2), bottom (y=tagHeight) */
        points={`${tagWidth},0 ${tagWidth + arrowSize},${tagHeight / 2} ${tagWidth},${tagHeight}`}
      />

      {/* Text */}
      <text
        className="fill-muted-foreground font-medium text-[12px]"
        x={12}
        y={tagHeight / 2 + 4}
      >
        {text}
      </text>
    </g>
  )
}

export default function GamedayHistory({ data, chips }: GamedayHistoryProps) {
  const [dataKey, setDataKey] = useState('rank')

  return (
    <div className="my-4">
      <Card>
        <CardHeader>
          <CardTitle>Season Overview</CardTitle>
          <CardDescription>
            Track your season performance over time
          </CardDescription>
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
          {/* <CardDescription>
            {dataKey === 'gamedayRank' &&
              `Average Gameday rank: ${meanBy(data, 'gamedayRank').toFixed(2)}`}
            {dataKey === 'gamedayPoints' &&
              `Average Gameday points: ${meanBy(data, 'gamedayPoints').toFixed(2)}`}
          </CardDescription> */}
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
              {dataKey !== 'totalPoints' && (
                <ReferenceLine
                  label={
                    <TagLabel
                      value={`Average: ${meanBy(data, dataKey).toFixed(2)}`}
                    />
                  }
                  // label={{
                  //   value: `Average: ${meanBy(data, dataKey).toFixed(2)}`,
                  //   position: 'insideBottomLeft',
                  // }}
                  stroke="var(--color-chart-2)"
                  strokeDasharray="4 4"
                  y={meanBy(data, dataKey)}
                />
              )}
              {chips?.map((chip) => (
                <ReferenceLine
                  key={chip.event}
                  label={{
                    value: chip.name,
                    position: 'insideTopLeft',
                  }}
                  stroke="var(--color-chart-4)"
                  strokeDasharray="4 4"
                  x={data.find((d: any) => d.event === chip.event)?.name}
                />
              ))}
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

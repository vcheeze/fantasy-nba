'use client'

import { meanBy } from 'lodash'
import { useReducedMotion } from 'motion/react'
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
import { useMediaQuery } from '@/hooks/use-media-query'
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

const TagLabel = (props: any) => {
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

function compactAxisTick(value: number) {
  if (!Number.isFinite(value)) {
    return ''
  }
  const absolute = Math.abs(value)
  if (absolute >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`
  }
  if (absolute >= 10_000) {
    return `${Math.round(value / 1000)}k`
  }
  if (absolute >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  if (Number.isInteger(value)) {
    return `${value}`
  }
  return value.toFixed(1)
}

export default function GamedayHistory({ data, chips }: GamedayHistoryProps) {
  const [dataKey, setDataKey] = useState('rank')
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const average = data?.length ? meanBy(data, dataKey) : null

  return (
    <section className="mt-6 animate-fade-in">
      <Card>
        <CardHeader className="gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <CardTitle className="font-bold font-display text-2xl leading-none tracking-tight md:text-3xl">
              <h2>Season Overview</h2>
            </CardTitle>
            <CardDescription>
              Track your season performance over time
            </CardDescription>
            {isMobile &&
            dataKey !== 'totalPoints' &&
            typeof average === 'number' &&
            Number.isFinite(average) ? (
              <p className="font-medium text-foreground text-sm tabular-nums">
                Average {average.toFixed(2)}
              </p>
            ) : null}
          </div>
          <Select onValueChange={(value) => setDataKey(value)} value={dataKey}>
            <SelectTrigger
              aria-label="Chart metric"
              className="w-full md:w-[180px]"
            >
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
            className="aspect-auto h-[280px] w-full md:h-[400px]"
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
            <LineChart
              data={data}
              margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                className="stroke-muted-foreground/30!"
                strokeDasharray="5 5"
              />
              <XAxis
                dataKey="name"
                interval="equidistantPreserveStart"
                minTickGap={isMobile ? 28 : 8}
                tick={{ fontSize: isMobile ? 11 : 12 }}
              />
              <YAxis
                domain={['auto', 'auto']}
                scale={dataKey === 'rank' ? 'log' : 'auto'}
                tick={{ fontSize: isMobile ? 11 : 12 }}
                tickFormatter={isMobile ? compactAxisTick : undefined}
                width={isMobile ? 36 : 48}
              />
              {dataKey !== 'totalPoints' && (
                <ReferenceLine
                  label={
                    isMobile ||
                    typeof average !== 'number' ||
                    !Number.isFinite(average) ? undefined : (
                      <TagLabel value={`Average: ${average.toFixed(2)}`} />
                    )
                  }
                  // label={{
                  //   value: `Average: ${meanBy(data, dataKey).toFixed(2)}`,
                  //   position: 'insideBottomLeft',
                  // }}
                  stroke="var(--color-chart-2)"
                  strokeDasharray="4 4"
                  y={average ?? undefined}
                />
              )}
              {chips?.map((chip) => (
                <ReferenceLine
                  key={chip.event}
                  label={{
                    value: chip.name,
                    position: 'insideTopLeft',
                    fontSize: isMobile ? 10 : 12,
                  }}
                  stroke="var(--color-chart-4)"
                  strokeDasharray="4 4"
                  x={data.find((d: any) => d.event === chip.event)?.name}
                />
              ))}
              <Line
                activeDot={{ r: 5, strokeWidth: 0 }}
                animationDuration={600}
                animationEasing="ease-in-out"
                dataKey={dataKey}
                dot={false}
                isAnimationActive={!shouldReduceMotion}
                stroke="var(--color-chart-1)"
                strokeWidth={2.25}
                type="monotone"
              />
              <ChartTooltip
                animationDuration={120}
                content={<ChartTooltipContent />}
                isAnimationActive={!shouldReduceMotion}
              />
              {/* <Tooltip /> */}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  )
}

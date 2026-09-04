'use client'

import { useMemo, useState } from 'react'
import { Pie, PieChart } from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { IOptimizedTeam } from '@/hooks/api'
import { Position } from '@/hooks/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

type Props = {
  data?: IOptimizedTeam
}

export function BudgetDistribution({ data }: Props) {
  const [mode, setMode] = useState<'players' | 'positions'>('positions')

  const playersData = useMemo(() => {
    if (!data) {
      return []
    }

    return data.squad.map((p, i) => ({
      name: p.name,
      value: p.cost / 10,
      fill: COLORS[i % COLORS.length],
    }))
  }, [data])

  const positionData = useMemo(() => {
    if (!data) {
      return []
    }

    const grouped = data.squad.reduce(
      (res, player) => {
        const key =
          player.position === Position.BACK_COURT ? 'Back Court' : 'Front Court'
        if (!res[key]) {
          res[key] = { position: key, value: 0 }
        }
        res[key].value += player.cost / 10
        return res
      },
      {} as Record<string, { position: string; value: number }>
    )

    return Object.values(grouped).map((d, i) => ({
      ...d,
      fill: COLORS[i % COLORS.length],
    }))
  }, [data])

  const config: ChartConfig = useMemo(() => {
    if (mode === 'positions') {
      return positionData.reduce(
        (acc, p) => {
          acc[p.position] = { label: p.position, color: p.fill }
          return acc
        },
        {} as Record<string, { label: string; color: string }>
      )
    }

    // For players we don't predefine a config (too many players)
    return {}
  }, [mode, positionData])

  const chartData = mode === 'positions' ? positionData : playersData

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Budget Distribution</CardTitle>
          <Select
            onValueChange={(v) => setMode(v as 'players' | 'positions')}
            value={mode}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="players" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="players">Players</SelectItem>
              <SelectItem value="positions">Positions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[384px] w-full">
          <ChartContainer className="min-h-[384px] w-full" config={config}>
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                label={({ value }) => `$${(value as number).toFixed(1)}`}
                nameKey={mode === 'positions' ? 'position' : 'name'}
              />
              <ChartLegend
                content={
                  <ChartLegendContent
                    nameKey={mode === 'positions' ? 'position' : 'name'}
                  />
                }
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default BudgetDistribution

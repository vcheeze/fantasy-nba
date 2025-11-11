/** biome-ignore-all lint/style/noNestedTernary: <explanation> */
'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { IElement } from '@/hooks/api'
import { cn } from '@/lib/utils'

type Props = {
  data: IElement[]
  // optional: force the visible range to at least this many steps (both sides)
  minRange?: number
  // optional: show labels (player name / count) above or hide them
  showLabels?: boolean
}

export default function PriceChangeLadder({
  data,
  minRange = 1,
  showLabels = true,
}: Props) {
  // group players by step
  const grouped = useMemo(() => {
    const m = new Map<number, IElement[]>()
    for (const p of data) {
      const s = Math.trunc(p.cost_change_start) // ensure integer steps
      if (!m.has(s)) {
        m.set(s, [])
      }
      m.get(s)!.push(p)
    }
    return m
  }, [data])

  // find min and max steps present
  const { minStep, maxStep } = useMemo(() => {
    if (grouped.size === 0) {
      return { minStep: -minRange, maxStep: minRange }
    }
    const steps = Array.from(grouped.keys())
    const min = Math.min(...steps)
    const max = Math.max(...steps)
    return { minStep: min, maxStep: max }
  }, [grouped, minRange])

  const stepsArray = useMemo(() => {
    const arr: number[] = []
    for (let s = minStep; s <= maxStep; s++) {
      arr.push(s)
    }
    return arr
  }, [minStep, maxStep])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Price Change Ladder</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative z-10 flex items-center justify-between gap-0.5">
            {stepsArray.map((step) => {
              const players = grouped.get(step) ?? []
              const label =
                players.length === 0
                  ? null
                  : players.length === 1
                    ? players[0].web_name
                    : `${players.length} players`

              const isZero = step === 0
              const isPositive = step > 0
              const isNegative = step < 0

              // tooltip content (simple)
              const tooltipText =
                players.length === 0
                  ? `${step > 0 ? `+${step}` : step}`
                  : players.map((p) => p.web_name).join(', ')

              return (
                <div
                  className="flex w-0 grow-0 flex-col items-center gap-2"
                  key={step}
                  style={{ width: `${100 / stepsArray.length}%` }}
                >
                  {/* label (above the bar) */}
                  {showLabels && label && (
                    <div
                      className={cn(
                        'max-w-26 overflow-hidden text-ellipsis whitespace-nowrap text-center font-medium text-xs',
                        isZero
                          ? 'text-muted-foreground'
                          : isPositive
                            ? 'text-emerald-700 dark:text-emerald-500'
                            : 'text-rose-700 dark:text-rose-500',
                        'bg-background/80 backdrop-blur'
                      )}
                      title={tooltipText}
                    >
                      {label}
                    </div>
                  )}

                  {/* the vertical block representing the step */}
                  <div
                    aria-label={tooltipText}
                    aria-roledescription={
                      isZero
                        ? 'neutral step'
                        : isPositive
                          ? 'positive step'
                          : 'negative step'
                    }
                    className={cn(
                      'relative flex items-end justify-center transition-all',
                      // spacing so the bars visually separate a bit
                      'py-2'
                    )}
                    role="img"
                    title={tooltipText}
                  >
                    {/* the vertical bar */}
                    <div
                      className={cn(
                        'h-6 w-20 rounded-md',
                        isZero ? 'bg-gray-300' : '',
                        isPositive ? 'bg-emerald-400/95' : '',
                        isNegative ? 'bg-rose-400/95' : ''
                      )}
                    />

                    {/* step text under the block for quick reference */}
                  </div>

                  {/* step indicator (below) */}
                  <div
                    className={cn(
                      'mt-1 text-[11px]',
                      isZero
                        ? 'text-muted-foreground'
                        : isPositive
                          ? 'text-emerald-700 dark:text-emerald-500'
                          : 'text-rose-700 dark:text-rose-500'
                    )}
                  >
                    {isZero ? '0' : step > 0 ? `+${step}` : step}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

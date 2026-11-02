'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

function playerList(players: IElement[]) {
  if (players.length === 0) {
    return 'No players at this step.'
  }
  const preview = players.slice(0, 18).map((player) => player.web_name)
  const remaining = players.length - preview.length
  if (remaining > 0) {
    return `${preview.join(', ')}, and ${remaining} more`
  }
  return preview.join(', ')
}

function formatStep(step: number) {
  if (step > 0) {
    return `+${step}`
  }
  return `${step}`
}

export default function PriceChangeLadder({
  data,
  minRange = 1,
  showLabels = true,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const grouped = useMemo(() => {
    const playersByStep = new Map<number, IElement[]>()
    for (const player of data) {
      const step = Math.trunc(player.cost_change_start)
      const players = playersByStep.get(step)
      if (players) {
        players.push(player)
      } else {
        playersByStep.set(step, [player])
      }
    }
    return playersByStep
  }, [data])

  const { minStep, maxStep } = useMemo(() => {
    if (grouped.size === 0) {
      return { minStep: -minRange, maxStep: minRange }
    }
    const steps = Array.from(grouped.keys())
    return { minStep: Math.min(...steps), maxStep: Math.max(...steps) }
  }, [grouped, minRange])

  const stepsArray = useMemo(() => {
    const steps: number[] = []
    for (let step = minStep; step <= maxStep; step++) {
      steps.push(step)
    }
    return steps
  }, [minStep, maxStep])

  const busiestStep = useMemo(() => {
    let step = 0
    let count = -1
    for (const candidate of stepsArray) {
      const players = grouped.get(candidate)?.length ?? 0
      if (players > count) {
        step = candidate
        count = players
      }
    }
    return step
  }, [grouped, stepsArray])

  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const activeStep = selectedStep ?? busiestStep
  const activePlayers = grouped.get(activeStep) ?? []

  useEffect(() => {
    const root = scrollerRef.current
    const target = root?.querySelector<HTMLElement>('[data-step="0"]')
    if (!(root && target)) {
      return
    }
    const frame = requestAnimationFrame(() => {
      root.scrollLeft =
        target.offsetLeft - root.clientWidth / 2 + target.offsetWidth / 2
    })
    return () => cancelAnimationFrame(frame)
  }, [minStep, maxStep])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold font-display text-2xl leading-none tracking-tight">
          <h2>Price Change Ladder</h2>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          className="relative min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          ref={scrollerRef}
        >
          <div
            aria-label="Price change steps"
            className="flex w-max min-w-full justify-center gap-1 px-1"
          >
            {stepsArray.map((step) => {
              const players = grouped.get(step) ?? []
              const label =
                players.length === 0
                  ? null
                  : players.length === 1
                    ? players[0].web_name
                    : `${players.length}`
              const names = players.map((player) => player.web_name).join(', ')
              const isActive = step === activeStep
              const tone =
                step === 0
                  ? 'text-muted-foreground'
                  : step > 0
                    ? 'text-primary'
                    : 'text-signal'
              const bar =
                step === 0
                  ? 'bg-muted-foreground/30'
                  : step > 0
                    ? 'bg-primary'
                    : 'bg-signal'

              return (
                <button
                  aria-pressed={isActive}
                  className="flex w-14 shrink-0 snap-center flex-col items-center gap-2 rounded-md px-0.5 py-1 md:w-20"
                  data-step={step}
                  key={step}
                  onClick={() => setSelectedStep(step)}
                  title={names || formatStep(step)}
                  type="button"
                >
                  {showLabels ? (
                    <span
                      className={cn(
                        'h-4 w-full truncate text-center font-medium text-[11px]',
                        tone
                      )}
                    >
                      {label}
                    </span>
                  ) : (
                    <span className="h-4" />
                  )}
                  <span
                    className={cn(
                      'h-6 w-10 rounded-md md:w-16',
                      bar,
                      isActive &&
                        'ring-2 ring-foreground ring-offset-2 ring-offset-card'
                    )}
                  />
                  <span className={cn('text-[11px] tabular-nums', tone)}>
                    {formatStep(step)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div aria-live="polite" className="mt-4 border-t pt-3">
          <p className="font-medium text-sm">
            {formatStep(activeStep)}
            <span className="font-normal text-muted-foreground">
              {' '}
              · {activePlayers.length}{' '}
              {activePlayers.length === 1 ? 'player' : 'players'}
            </span>
          </p>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            {playerList(activePlayers)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

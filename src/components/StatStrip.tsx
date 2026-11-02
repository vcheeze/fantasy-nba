import type { CSSProperties, ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type Stat = {
  label: string
  value: ReactNode
  detail?: ReactNode
}

const cellBorders = (index: number) =>
  cn(
    index % 2 === 1 && 'border-l',
    index >= 2 && 'border-t lg:border-t-0',
    index === 2 && 'lg:border-l'
  )

export function StatStrip({
  stats,
  isLoading,
  variant = 'surface',
  startIndex = 0,
  className,
}: {
  stats: Stat[]
  isLoading?: boolean
  variant?: 'surface' | 'scoreboard'
  /** Position in the page's entrance stagger. */
  startIndex?: number
  className?: string
}) {
  const scoreboard = variant === 'scoreboard'
  const subtle = scoreboard
    ? 'text-scoreboard-foreground/75'
    : 'text-muted-foreground'

  return (
    <dl
      className={cn(
        'relative grid animate-rise grid-cols-2 overflow-hidden rounded-md border lg:grid-cols-4',
        scoreboard
          ? 'border-transparent bg-scoreboard text-scoreboard-foreground'
          : 'bg-card text-card-foreground',
        className
      )}
      style={{ '--i': startIndex } as CSSProperties}
    >
      {scoreboard ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-signal"
        />
      ) : null}
      {stats.map((stat, index) => (
        <div
          className={cn(
            'flex min-w-0 flex-col gap-2 px-5 py-5 md:px-6 md:py-6',
            cellBorders(index),
            scoreboard && 'border-scoreboard-foreground/15'
          )}
          key={stat.label}
        >
          <dt className={cn('font-medium text-sm', subtle)}>{stat.label}</dt>
          <dd className="min-w-0">
            {isLoading ? (
              <Skeleton
                className={cn(
                  'h-10 w-28',
                  scoreboard && 'bg-scoreboard-foreground/15'
                )}
              />
            ) : (
              <div
                className="animate-value-in"
                style={{ '--i': index } as CSSProperties}
              >
                <span className="block truncate font-display font-extrabold text-4xl tabular-nums leading-none md:text-5xl">
                  {stat.value}
                </span>
                {stat.detail ? (
                  <span className={cn('mt-2 block truncate text-sm', subtle)}>
                    {stat.detail}
                  </span>
                ) : null}
              </div>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

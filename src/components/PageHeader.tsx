import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'mb-8 flex min-w-0 flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className="max-w-3xl">
        <span
          aria-hidden="true"
          className="mb-4 block h-1 w-12 animate-rise bg-signal"
        />
        <h1 className="animate-rise text-balance font-display font-extrabold text-[2.35rem] leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description ? (
          <p
            className="mt-4 max-w-[65ch] animate-rise text-base text-muted-foreground leading-relaxed md:text-lg"
            style={{ '--i': 1 } as CSSProperties}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div
          className="flex w-full min-w-0 shrink-0 animate-rise flex-wrap gap-3 sm:w-auto"
          style={{ '--i': 2 } as CSSProperties}
        >
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        'font-bold font-display text-2xl leading-none tracking-tight md:text-3xl',
        className
      )}
    >
      {children}
    </h2>
  )
}

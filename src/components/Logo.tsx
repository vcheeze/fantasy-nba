import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-scoreboard font-display font-extrabold text-[15px] text-scoreboard-foreground leading-none',
        className
      )}
    >
      <span className="-translate-y-px">FNP</span>
      <span className="absolute inset-x-0 bottom-0 h-1 bg-signal" />
    </span>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-display font-extrabold text-2xl leading-none tracking-tight">
        Fantasy NBA Planner
      </span>
    </span>
  )
}

'use client'

import {
  CalendarDotsIcon,
  ChartLineIcon,
  HouseIcon,
  MapTrifoldIcon,
  MoonIcon,
  SunIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'

import { Wordmark } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ROUTES = [
  {
    name: 'Home',
    link: '/',
    icon: HouseIcon,
  },
  // {
  //   name: 'Planner',
  //   link: '/planner',
  // },
  {
    name: 'Fixtures',
    link: '/fixtures',
    icon: CalendarDotsIcon,
  },
  {
    name: 'Optimal Team',
    link: '/optimize',
    icon: UsersIcon,
  },
  {
    name: 'Stats',
    link: '/stats',
    icon: ChartLineIcon,
  },
  {
    name: 'Roadmap',
    link: '/features',
    icon: MapTrifoldIcon,
  },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      aria-label="Toggle color theme"
      className="shrink-0"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      size="icon"
      variant="ghost"
    >
      <SunIcon className="hidden animate-icon-in dark:block" weight="bold" />
      <MoonIcon className="animate-icon-in dark:hidden" weight="bold" />
    </Button>
  )
}

export default function Nav() {
  const pathname = usePathname()
  const isActive = (link: string) =>
    link === '/' ? pathname === '/' : pathname.startsWith(link)

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 md:gap-6 md:px-8">
          <Link
            aria-label="Fantasy NBA Planner home"
            className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
          >
            <Wordmark />
          </Link>
          <nav aria-label="Primary" className="hidden h-full md:block">
            <ul className="flex h-full items-stretch gap-1">
              {ROUTES.map((route) => (
                <li className="flex" key={route.name}>
                  <Link
                    aria-current={isActive(route.link) ? 'page' : undefined}
                    className={cn(
                      'relative flex items-center whitespace-nowrap px-3 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none',
                      'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-200 after:ease-out',
                      'hover:after:scale-x-50 aria-[current=page]:text-foreground aria-[current=page]:after:scale-x-100'
                    )}
                    href={route.link}
                  >
                    {route.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-5">
          {ROUTES.map((route) => {
            const Icon = route.icon
            const active = isActive(route.link)
            return (
              <li key={route.name}>
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-14 w-full min-w-0 flex-col items-center justify-center gap-1 px-0.5 pt-2 pb-1.5 font-medium text-[11px] text-muted-foreground leading-tight transition-[color,transform] duration-150 ease-out active:scale-[0.97]',
                    'before:absolute before:inset-x-2 before:top-0 before:h-0.5 before:bg-signal before:opacity-0 before:transition-opacity',
                    'aria-[current=page]:text-foreground aria-[current=page]:before:opacity-100'
                  )}
                  href={route.link}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-5 shrink-0"
                    weight={active ? 'fill' : 'regular'}
                  />
                  <span className="max-w-full text-balance text-center leading-tight">
                    {route.name}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

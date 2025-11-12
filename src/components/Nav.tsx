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
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/use-media-query'

export default function Nav() {
  const { theme, setTheme } = useTheme()

  const ROUTES = [
    {
      name: 'Home',
      link: '/',
      icon: <HouseIcon />,
    },
    // {
    //   name: 'Planner',
    //   link: '/planner',
    // },
    {
      name: 'Fixtures',
      link: '/fixtures',
      icon: <CalendarDotsIcon />,
    },
    {
      name: 'Optimal Team',
      link: '/optimize',
      icon: <UsersIcon />,
    },
    {
      name: 'Stats',
      link: '/stats',
      icon: <ChartLineIcon />,
    },
    {
      name: 'Roadmap',
      link: '/features',
      icon: <MapTrifoldIcon />,
    },
  ]

  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <div className="container mx-auto flex w-full items-center justify-between p-8">
        <h1>Fantasy NBA Planner</h1>
        <div className="flex md:gap-2">
          {ROUTES.map((route) => (
            <Button asChild key={route.name} variant="link">
              <Link href={route.link}>{route.name}</Link>
            </Button>
          ))}
        </div>
        <div>
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            size="icon"
            variant="outline"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="fixed bottom-0 z-50 flex w-full items-center justify-between bg-muted p-4">
      {ROUTES.map((route) => (
        <Button key={route.name} variant="link">
          <Link href={route.link}>{route.icon}</Link>
        </Button>
      ))}
      <div>
        <Button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          size="icon"
          variant="outline"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
    </div>
  )
}

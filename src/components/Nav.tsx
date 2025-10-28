'use client'

import { ChartLine, Home, Map, Moon, Sun, Users } from 'lucide-react'
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
      icon: <Home />,
    },
    // {
    //   name: 'Planner',
    //   link: '/planner',
    // },
    {
      name: 'Fixtures Analyzer',
      link: '/fixtures',
      icon: <ChartLine />,
    },
    {
      name: 'Optimal Team',
      link: '/optimize',
      icon: <Users />,
    },
    {
      name: 'Roadmap',
      link: '/features',
      icon: <Map />,
    },
  ]

  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <div className="flex w-full items-center justify-between p-4">
        <h1>Fantasy NBA Planner</h1>
        <div className="flex md:gap-2">
          {ROUTES.map((route) => (
            <Button key={route.name} variant="link">
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
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="fixed bottom-0 z-50 flex w-full items-center justify-between bg-muted p-4">
      {ROUTES.map((route) => (
        <Button key={route.name} variant="link">
          <NextLink href={route.link}>{route.icon}</NextLink>
        </Button>
      ))}
      <div>
        <Button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          size="icon"
          variant="outline"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </div>
    </div>
  )
}

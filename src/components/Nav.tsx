'use client'

import { ChartLine, Home, Map, Moon, Sun, Users } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Link as NextLink } from '@/lib/i18n'

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
      <div className="w-full flex p-4 justify-between items-center">
        <h1>Fantasy NBA Planner</h1>
        <div className="flex md:gap-2">
          {ROUTES.map((route) => (
            <Button key={route.name} variant="link">
              <NextLink href={route.link}>{route.name}</NextLink>
            </Button>
          ))}
        </div>
        <div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full flex p-4 justify-between items-center fixed bottom-0 bg-muted z-50">
      {ROUTES.map((route) => (
        <Button key={route.name} variant="link">
          <NextLink href={route.link}>{route.icon}</NextLink>
        </Button>
      ))}
      <div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </div>
    </div>
  )
}

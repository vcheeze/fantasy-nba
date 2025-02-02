'use client'

import NextLink from 'next/link'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export default function Nav() {
  const { theme, setTheme } = useTheme()

  const ROUTES = [
    {
      name: 'Home',
      link: '/',
    },
    // {
    //   name: 'Planner',
    //   link: '/planner',
    // },
    {
      name: 'Fixtures',
      link: '/fixtures',
    },
    {
      name: 'Optimal Team',
      link: '/optimize',
    },
  ]

  return (
    <div className="flex p-4 justify-between items-center">
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

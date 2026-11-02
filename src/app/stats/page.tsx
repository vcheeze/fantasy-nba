import type { Metadata } from 'next'

import { pageMetadata } from '@/lib/site'

import ClientPage from './client-page'

export const metadata: Metadata = pageMetadata({
  path: '/stats',
  title: 'Player Stats and Price Changes',
  socialTitle: 'Player Stats | Fantasy NBA Planner',
  description:
    'Search, filter, and sort Fantasy NBA Salary Cap Edition player stats, compare players visually, and track player price changes across the season.',
  keywords: [
    'Fantasy NBA player stats',
    'Fantasy NBA price changes',
    'Fantasy NBA Salary Cap Edition',
    'Fantasy Basketball Analytics',
    'Player Stats',
  ],
})

export default function StatsPage() {
  return <ClientPage />
}

import type { Metadata } from 'next'

import { pageMetadata } from '@/lib/site'

import ClientPage from './client-page'

export const metadata: Metadata = pageMetadata({
  path: '/fixtures',
  title: 'Fixtures Analyzer: Games per Gameweek by Team',
  socialTitle: 'Fixtures Analyzer | Fantasy NBA Planner',
  description:
    'See which NBA teams play the most games each Gameweek, with home and away splits, so you can structure your Fantasy NBA Salary Cap Edition team for maximum games.',
  keywords: [
    'Fantasy NBA fixtures',
    'NBA Gameweek schedule',
    'Fantasy NBA games per week',
    'Fantasy NBA Salary Cap Edition',
    'NBA Fantasy Planner',
  ],
})

export default function Fixtures() {
  return <ClientPage />
}

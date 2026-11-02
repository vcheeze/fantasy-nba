import type { Metadata } from 'next'

import { pageMetadata } from '@/lib/site'

import ClientPage from './client-page'

export const metadata: Metadata = pageMetadata({
  path: '/',
  title: {
    absolute:
      'Fantasy NBA Planner | Optimize Your Team & Transfers for Maximum Points',
  },
  socialTitle:
    'Fantasy NBA Planner | Optimize Your Team & Transfers for Maximum Points',
  description:
    'Take your Fantasy NBA team to the next level with our advanced planner. Optimize transfers, analyze player stats, and visualize team performance to maximize your weekly points.',
  keywords: [
    'Fantasy NBA',
    'Fantasy NBA Salary Cap Edition',
    'NBA Fantasy Planner',
    'Fantasy Basketball Optimizer',
    'NBA Lineup Tool',
    'Fantasy NBA Transfers',
    'Player Stats',
    'Fantasy Basketball Analytics',
    'Team Performance Visualization',
    'NBA Fantasy Strategy',
    'Optimize Fantasy NBA Team',
  ],
})

export default function Home() {
  return <ClientPage />
}

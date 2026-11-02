import type { Metadata } from 'next'

import { pageMetadata } from '@/lib/site'

import ClientPage from './client-page'

export const metadata: Metadata = pageMetadata({
  path: '/optimize',
  title: 'Optimal Team: Fantasy NBA Wildcard Optimizer',
  socialTitle: 'Optimal Team | Fantasy NBA Planner',
  description:
    'See the optimal Fantasy NBA Salary Cap Edition team calculated from player form or points per game, including transfers, to help you plan your Wildcard.',
  keywords: [
    'Fantasy NBA',
    'Fantasy NBA Salary Cap Edition',
    'NBA Fantasy Planner',
    'Fantasy Basketball Optimizer',
    'NBA Lineup Tool',
    'Fantasy NBA Transfers',
    'Optimize Fantasy NBA Team',
    'Fantasy NBA Team Wildcard',
    'Wildcard Chip',
  ],
})

export default function Optimize() {
  return <ClientPage />
}

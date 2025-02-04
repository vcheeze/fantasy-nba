import { Metadata } from 'next'

import ClientPage from './client-page'

export const metadata: Metadata = {
  title:
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
    'Fantasy NBA Team Wildcard',
    'Wildcard Chip',
  ],
  openGraph: {
    title: 'Optimal Team | Fantasy NBA Planner',
    description:
      'Take your Fantasy NBA team to the next level with our advanced planner. See the optimal team calculated based on form or points per game to help you plan your Wildcard.',
    url: 'https://fantasy-nba.vercel.app/optimize',
    type: 'website',
    images: [
      {
        url: 'https://fantasy-nba.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Fantasy NBA Planner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Optimal Team | Fantasy NBA Planner',
    description:
      'Get the edge in Fantasy NBA with our planner. Optimize transfers, track player performance, and dominate your league.',
    images: ['https://fantasy-nba.vercel.app/twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function Optimize() {
  return <ClientPage />
}

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
  ],
  openGraph: {
    title:
      'Fantasy NBA Planner | Optimize Your Team & Transfers for Maximum Points',
    description:
      'Take your Fantasy NBA team to the next level with our advanced planner. Optimize transfers, analyze player stats, and visualize team performance to maximize your weekly points.',
    url: 'https://fantasy-nba.vercel.app',
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
    title: 'Fantasy NBA Planner | Optimize Your Team & Transfers',
    description:
      'Get the edge in Fantasy NBA with our planner. Optimize transfers, track player performance, and dominate your league.',
    images: ['https://fantasy-nba.vercel.app/twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function Home() {
  return <ClientPage />
}

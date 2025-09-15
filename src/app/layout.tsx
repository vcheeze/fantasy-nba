import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { LanguageProvider } from '@inlang/paraglide-next'
import { GoogleAnalytics } from '@next/third-parties/google'

import Nav from '@/components/Nav'
import { Toaster } from '@/components/ui/sonner'
import { languageTag } from '@/paraglide/runtime.js'

import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Fantasy NBA Planner | Optimize Your Fantasy Basketball Team',
    template: '%s | Fantasy NBA Planner'
  },
  description:
    'Advanced tools and visualizations for your NBA Fantasy Salary Cap Edition team. Optimize transfers, analyze player stats, and maximize your weekly points.',
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
  authors: [{ name: 'Fantasy NBA Planner Team' }],
  creator: 'Fantasy NBA Planner',
  publisher: 'Fantasy NBA Planner',
  category: 'Sports',
  applicationName: 'Fantasy NBA Planner',
  verification: {
    google: 'iTDbvkxf0Uls4YGnfxEKt_Sq6Vjti6_GHCTFg0Iv3xg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fantasy-nba.vercel.app',
    siteName: 'Fantasy NBA Planner',
    title: 'Fantasy NBA Planner | Optimize Your Fantasy Basketball Team',
    description: 'Advanced tools and visualizations for your NBA Fantasy Salary Cap Edition team. Optimize transfers, analyze player stats, and maximize your weekly points.',
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
    title: 'Fantasy NBA Planner | Optimize Your Fantasy Basketball Team',
    description: 'Advanced tools and visualizations for your NBA Fantasy Salary Cap Edition team.',
    images: ['https://fantasy-nba.vercel.app/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://fantasy-nba.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <html lang={languageTag()} suppressHydrationWarning>
        <body className={inter.className}>
          <Providers
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Nav />
            <div className="container mx-auto p-8 max-sm:mb-12">{children}</div>
            <Toaster />
          </Providers>
        </body>
        <GoogleAnalytics gaId="G-0187RMBX59" />
      </html>
    </LanguageProvider>
  )
}

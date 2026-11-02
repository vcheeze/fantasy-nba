import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'

import Nav from '@/components/Nav'
import { Toaster } from '@/components/ui/sonner'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

import './globals.css'
import Providers from './providers'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f7fa' },
    { media: '(prefers-color-scheme: dark)', color: '#07101a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Fantasy NBA Planner | Optimize Your Fantasy Basketball Team',
    template: '%s | Fantasy NBA Planner',
  },
  description: SITE_DESCRIPTION,
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
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'Sports',
  applicationName: SITE_NAME,
  verification: {
    google: 'iTDbvkxf0Uls4YGnfxEKt_Sq6Vjti6_GHCTFg0Iv3xg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Fantasy NBA Planner | Optimize Your Fantasy Basketball Team',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fantasy NBA Planner | Optimize Your Fantasy Basketball Team',
    description:
      'Advanced tools and visualizations for your NBA Fantasy Salary Cap Edition team.',
    images: [`${SITE_URL}/twitter-image.jpg`],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: 'en-US',
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: 'SportsApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description: SITE_DESCRIPTION,
      featureList: [
        'Team rank and season history tracking',
        'Fixture analysis by Gameweek',
        'Optimal team calculation by form or points per game',
        'Player stats with filters and price change ladder',
      ],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
        <Providers
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <Nav />
          <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-28 md:px-8 md:pt-12 md:pb-20">
            {children}
          </main>
          <Toaster />
        </Providers>
        <GoogleAnalytics gaId="G-0187RMBX59" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

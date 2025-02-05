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
  title: 'Fantasy NBA Planner',
  description:
    'Useful tools and visualizations for your NBA Fantasy Salary Cap Edition team.',
  verification: {
    google: 'iTDbvkxf0Uls4YGnfxEKt_Sq6Vjti6_GHCTFg0Iv3xg',
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

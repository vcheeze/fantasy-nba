import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import Nav from '@/components/Nav'

import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fantasy NBA Planner',
  description:
    'Useful tools and visualizations for your NBA Fantasy Salary Cap Edition team.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Nav />
          <div className="container mx-auto p-8">{children}</div>
        </Providers>
      </body>
    </html>
  )
}

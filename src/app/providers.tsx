'use client'

import { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'jotai'
import { ThemeProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

import { getQueryClient } from '@/lib/get-query-client'

export default function Providers({ children, ...props }: ThemeProviderProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <ThemeProvider {...props}>{children}</ThemeProvider>
      </Provider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

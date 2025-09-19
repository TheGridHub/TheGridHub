'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState, type ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  // Create a new QueryClient instance per app mount to avoid state leaking
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors except 408, 409, 429
            if (error?.status >= 400 && error?.status < 500) {
              return [408, 409, 429].includes(error.status) && failureCount < 2
            }
            // Retry up to 3 times for other errors
            return failureCount < 3
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
          retry: (failureCount, error: any) => {
            // Don't retry mutations on 4xx errors
            if (error?.status >= 400 && error?.status < 500) {
              return false
            }
            return failureCount < 2
          },
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: '#873bff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#873bff',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}

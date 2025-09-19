import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import Script from 'next/script'
import SupabaseProvider from '@/components/providers/SupabaseProvider'
import { Providers } from '@/lib/providers'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Analytics } from '@vercel/analytics/react'

// Make this layout dynamic to avoid static generation issues with SupabaseProvider
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TheGridHub - The Modern Task Management Platform',
  description: 'Enterprise task management with powerful integrations - Office 365, Google Workspace, Slack, and Jira at startup pricing',
  icons: {
    icon: '/icons/Favicon.svg',
    shortcut: '/icons/Favicon.svg',
    apple: '/icons/Favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Removed Puter.js - causing authentication conflicts */}
      </head>
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            <SupabaseProvider>
              {children}
            </SupabaseProvider>
          </ErrorBoundary>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}


import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Metadata } from 'next'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TaskWork - The Modern Task Management Platform',
  description: 'Enterprise task management with powerful integrations - Office 365, Google Workspace, Slack, and Jira at startup pricing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Load Puter.js for free AI capabilities */}
          <Script 
            src="https://js.puter.com/v2/" 
            strategy="beforeInteractive"
          />
        </head>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
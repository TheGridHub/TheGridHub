import './globals.css'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Metadata } from 'next'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TaskGrid - AI-Powered Task Management',
  description: 'Comprehensive task management platform with free AI capabilities for optimized productivity and team collaboration',
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
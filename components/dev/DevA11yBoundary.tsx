"use client"

import dynamic from 'next/dynamic'

// Load DevA11y only on the client and only in development
const DevA11y = dynamic(() => import('./DevA11y'), { ssr: false })

export default function DevA11yBoundary() {
  if (process.env.NODE_ENV === 'production') return null
  return <DevA11y />
}


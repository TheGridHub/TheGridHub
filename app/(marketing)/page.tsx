import React from 'react'
import { Homepage } from '@/app/homepage/Homepage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // If an OAuth provider returns here with ?code=..., forward to our auth callback
  if (searchParams && (searchParams.code || searchParams.access_token || searchParams.refresh_token)) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (typeof v === 'string') params.set(k, v)
      else if (Array.isArray(v)) v.forEach((item) => params.append(k, item))
    }
    redirect(`/auth/callback?${params.toString()}`)
  }
  return <Homepage />
}

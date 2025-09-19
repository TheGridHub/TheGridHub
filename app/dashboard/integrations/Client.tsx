"use client"

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

const IntegrationSettings = dynamic(() => import('@/components/IntegrationSettings'), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="h-20 w-full bg-gray-100 rounded animate-pulse" />
      <div className="h-20 w-full bg-gray-100 rounded animate-pulse" />
    </div>
  )
})

import { getProfileClient } from '@/lib/profile.client'

export default function IntegrationsClient() {
  const [plan, setPlan] = React.useState<'free'|'pro'|'unknown'>('unknown')
  React.useEffect(() => { (async()=>{ const { profile } = await getProfileClient(); setPlan((profile?.plan as any) || 'free') })() }, [])
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Integrations</h1>
      {plan !== 'pro' && (
        <div className="mb-4 p-3 rounded border border-amber-300 bg-amber-50 text-amber-800 text-sm flex items-center justify-between">
          <span>Some integrations are Pro-only. Upgrade to unlock everything.</span>
          <button
            onClick={async()=>{ const r=await fetch('/api/stripe/create-checkout-session',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ interval:'monthly' })}); const j=await r.json(); if (j.url) window.location.href=j.url; }}
            className="px-3 py-1.5 rounded bg-black text-white hover:bg-black/90"
          >Upgrade to Pro</button>
        </div>
      )}
      <Suspense fallback={<div>Loading integrations…</div>}>
        <IntegrationSettings />
      </Suspense>
    </div>
  )
}


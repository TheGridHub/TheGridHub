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

export default function IntegrationsClient() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Integrations</h1>
      <Suspense fallback={<div>Loading integrations…</div>}>
        <IntegrationSettings />
      </Suspense>
    </div>
  )
}


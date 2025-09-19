"use client"

import React, { useState } from 'react'

export default function BillingPage() {
  const [loading, setLoading] = useState(false)

  const openPortal = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Billing</h1>
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={openPortal}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? 'Opening…' : 'Open Billing Portal'}
          </button>
          <button
            onClick={async () => {
const res = await fetch('/api/stripe/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interval: 'monthly', currency: (window as any).__selectedCurrency }) })
              const data = await res.json()
              if (data.url) window.location.href = data.url
            }}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Upgrade to Pro (Monthly)
          </button>
          <button
            onClick={async () => {
const res = await fetch('/api/stripe/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interval: 'yearly', currency: (window as any).__selectedCurrency }) })
              const data = await res.json()
              if (data.url) window.location.href = data.url
            }}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Upgrade to Pro (Yearly)
          </button>
        </div>
      </div>
    </div>
  )
}

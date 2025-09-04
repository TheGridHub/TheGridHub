"use client"

import useSWR from 'swr'

export default function BillingSettingsPage() {
  const { data } = useSWR('/api/profile', (url)=>fetch(url).then(r=>r.json()))

  const openPortal = async () => {
    const res = await fetch('/api/billing/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerId: data?.stripeCustomerId }) })
    const json = await res.json()
    if (json.url) window.location.href = json.url
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-purple-900/30 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Billing</h1>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
          <p className="text-purple-200">Manage your subscription and payment methods.</p>
          <button onClick={openPortal} disabled={!data?.stripeCustomerId} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg disabled:opacity-50">
            Open Billing Portal
          </button>
          {!data?.stripeCustomerId && (
            <p className="text-sm text-purple-300">No Stripe customer linked yet. You will get access after first checkout.</p>
          )}
        </div>
      </div>
    </div>
  )
}


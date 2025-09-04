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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <header className="bg-white shadow-sm border-b mb-6">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
          </div>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <p className="text-gray-600">Manage your subscription and payment methods.</p>
          <button onClick={openPortal} disabled={!data?.stripeCustomerId} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50">
            Open Billing Portal
          </button>
          {!data?.stripeCustomerId && (
            <p className="text-sm text-gray-600">No Stripe customer linked yet. You will get access after first checkout.</p>
          )}
        </div>
      </div>
    </div>
  )
}


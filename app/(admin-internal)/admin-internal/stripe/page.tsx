"use client"

import { useEffect, useState } from 'react'

export default function AdminStripePage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ events: any[], subscriptions: any[] }>({ events: [], subscriptions: [] })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin-internal/stripe', { cache: 'no-store' })
      const json = await res.json()
      setData({ events: json.events || [], subscriptions: json.subscriptions || [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Stripe Admin</h1>
          <p className="text-slate-600 text-sm">Subscriptions overview and recent webhook events</p>
        </div>
        <button onClick={load} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Refresh</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Subscriptions (latest)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Plan</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td className="px-3 py-3" colSpan={4}>Loading...</td></tr>
                ) : data.subscriptions.length === 0 ? (
                  <tr><td className="px-3 py-3" colSpan={4}>No subscriptions found</td></tr>
                ) : data.subscriptions.map((s, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-mono text-xs">{s.userId}</td>
                    <td className="px-3 py-2">{s.plan}</td>
                    <td className="px-3 py-2">{s.status}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{s.currentPeriodStart ? new Date(s.currentPeriodStart).toLocaleDateString() : '—'} → {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Webhook Events (recent)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Event</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td className="px-3 py-3" colSpan={3}>Loading...</td></tr>
                ) : data.events.length === 0 ? (
                  <tr><td className="px-3 py-3" colSpan={3}>No events found</td></tr>
                ) : data.events.map((e, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-mono text-xs">{e.type} ({e.event_id})</td>
                    <td className="px-3 py-2">{e.status}{e.error ? `: ${e.error}` : ''}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{e.created_at ? new Date(e.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="mt-3 text-right">
            <form onSubmit={async (ev)=>{ ev.preventDefault(); const id = (ev.currentTarget.elements.namedItem('event_id') as HTMLInputElement).value; if(!id) return; await fetch('/api/admin-internal/stripe/retry', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event_id: id })}); await load(); }} className="inline-flex items-center gap-2">
              <input name="event_id" placeholder="event_id" className="border rounded px-2 py-1 text-xs" />
              <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Retry Event</button>
            </form>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function StripeClient() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ events: any[], subscriptions: any[] }>({ events: [], subscriptions: [] })
  const [search, setSearch] = useState('')
  const [invoices, setInvoices] = useState<any[]>([])
  const [userPayments, setUserPayments] = useState<any[]>([])
  const [busy, setBusy] = useState(false)

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

  async function loadUserBilling() {
    if (!search.trim()) return
    setBusy(true)
    try {
      let userId = search.trim()
      if (userId.includes('@')) {
        const res = await fetch(`/api/admin-internal/users?q=${encodeURIComponent(userId)}`)
        const j = await res.json()
        userId = (j.users || [])[0]?.id || userId
      }
      const [invRes, userRes] = await Promise.all([
        fetch(`/api/admin-internal/stripe/invoices?userId=${encodeURIComponent(userId)}`),
        fetch(`/api/admin-internal/users/${encodeURIComponent(userId)}`)
      ])
      const invJ = await invRes.json()
      const userJ = await userRes.json()
      setInvoices(invJ.invoices || [])
      setUserPayments(userJ.payments || [])
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Admin / Billing</div>
          <h1 className="text-2xl font-semibold text-slate-900">Stripe Admin</h1>
          <p className="text-slate-600 text-sm">Subscriptions, invoices, and webhook events</p>
        </div>
        <button onClick={load} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Refresh</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by email or userId" className="border rounded px-3 py-2 text-sm w-64" />
          <button onClick={loadUserBilling} disabled={busy || !search.trim()} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm disabled:opacity-50">Load User Billing</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <div className="font-medium text-slate-900 mb-2">Invoices</div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50"><tr><th className="px-2 py-1 text-left">Invoice</th><th className="px-2 py-1 text-left">Due</th><th className="px-2 py-1 text-left">Paid</th><th className="px-2 py-1 text-left">Status</th><th className="px-2 py-1"></th></tr></thead>
                <tbody className="divide-y">
                  {invoices.length === 0 ? (
                    <tr><td className="px-2 py-2" colSpan={5}>No invoices loaded</td></tr>
                  ) : invoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="px-2 py-1"><a className="text-blue-600 underline" href={inv.hosted_invoice_url || '#'} target="_blank" rel="noreferrer">{inv.id}</a></td>
                      <td className="px-2 py-1">{inv.amount_due/100}</td>
                      <td className="px-2 py-1">{inv.amount_paid/100}</td>
                      <td className="px-2 py-1"><span className={`px-2 py-0.5 rounded-full text-[10px] ${inv.status==='paid'?'bg-green-100 text-green-700':'bg-slate-100 text-slate-600'}`}>{inv.status}</span></td>
                      <td className="px-2 py-1 text-right">
                        <button className="px-2 py-1 rounded border border-amber-300 text-amber-700" onClick={async()=>{
                          const amt = window.prompt('Refund amount in cents (leave empty for full refund)')
                          const res = await fetch('/api/admin-internal/stripe/refunds', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ invoice_id: inv.id, amount_cents: amt? parseInt(amt,10): undefined }) })
                          const j = await res.json()
                          if (!res.ok) alert(j?.error || 'Refund failed'); else alert('Refund created: ' + j.refund?.id)
                        }}>Refund</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="font-medium text-slate-900 mb-2">Payments (DB)</div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50"><tr><th className="px-2 py-1 text-left">Invoice</th><th className="px-2 py-1 text-left">Amount</th><th className="px-2 py-1 text-left">Status</th><th className="px-2 py-1 text-left">Paid</th></tr></thead>
                <tbody className="divide-y">
                  {userPayments.length === 0 ? (
                    <tr><td className="px-2 py-2" colSpan={4}>No payments loaded</td></tr>
                  ) : userPayments.map((p:any)=> (
                    <tr key={p.id}><td className="px-2 py-1">{p.stripeInvoiceId}</td><td className="px-2 py-1">{p.amount/100} {p.currency}</td><td className="px-2 py-1">{p.status}</td><td className="px-2 py-1">{p.paidAt ? new Date(p.paidAt).toLocaleString() : '—'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
                    <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[10px] ${s.status==='active'?'bg-green-100 text-green-700':'bg-slate-100 text-slate-600'}`}>{s.status}</span></td>
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


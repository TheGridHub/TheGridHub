"use client"

import { useEffect, useState } from 'react'

type UserRow = { id: string, email?: string | null, name?: string | null, createdAt?: string | null }

export default function AdminUsersPage() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserRow[]>([])
  const [busy, setBusy] = useState<string|null>(null)
  const [drawerUser, setDrawerUser] = useState<any|null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function toast(text: string, type: 'info'|'success'|'error'='info') {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { text, type } }))
    }
  }

  async function fetchUsers(query = '') {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin-internal/users${query ? `?q=${encodeURIComponent(query)}` : ''}`, { cache: 'no-store' })
      const json = await res.json()
      setUsers(json.users || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  async function onDelete(id: string) {
    const sure = window.confirm('Delete this user and all associated data? This cannot be undone.')
    if (!sure) return
    setBusy(id)
    try {
      const res = await fetch('/api/admin-internal/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id })
      })
      if (!res.ok) {
        const j = await res.json().catch(()=>({}))
        throw new Error(j?.error || 'Delete failed')
      }
      await fetchUsers(q)
      toast('User deleted', 'success')
    } catch (e:any) {
      toast(e?.message || 'Delete failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="text-slate-600 text-sm">Search and manage users. Deletion cascades app data.</p>
        </div>
        <form onSubmit={(e)=>{ e.preventDefault(); fetchUsers(q) }} className="flex items-center gap-2">
          <input
            placeholder="Search by email"
            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={q}
            onChange={e=>setQ(e.target.value)}
          />
          <button className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Search</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td className="px-4 py-4" colSpan={5}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td className="px-4 py-4" colSpan={5}>No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-2 font-mono text-xs">
                  <button className="underline decoration-dotted" onClick={async()=>{
                    setBusy(u.id)
                    try {
                      const res = await fetch(`/api/admin-internal/users/${u.id}`)
                      const j = await res.json()
                      if (!res.ok) throw new Error(j?.error || 'Failed to load user')
                      setDrawerUser(j)
                      setDrawerOpen(true)
                    } catch (e:any) { alert(e?.message || 'Load failed') } finally { setBusy(null) }
                  }}>{u.id}</button>
                </td>
                <td className="px-4 py-2">{u.email || '—'}</td>
                <td className="px-4 py-2">{u.name || '—'}</td>
                <td className="px-4 py-2 text-xs text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={async()=>{
                      setBusy(u.id)
                      try {
                        const res = await fetch(`/api/admin-internal/users/${u.id}/reset-password`, { method: 'POST' })
                        const j = await res.json()
                        if (!res.ok) throw new Error(j?.error || 'Failed')
                        const link = j.action_link
                        window.prompt('Password reset link (copy and send to user):', link)
                        toast('Reset link generated', 'success')
                      } catch (e:any) {
                        toast(e?.message || 'Reset failed', 'error')
                      } finally {
                        setBusy(null)
                      }
                    }}
                    disabled={busy === u.id}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    title="Generate password reset link"
                  >
                    Reset PW
                  </button>
                  <button
                    onClick={async()=>{
                      setBusy(u.id)
                      try {
                        const res = await fetch(`/api/admin-internal/users/${u.id}/billing-portal`, { method: 'POST' })
                        const j = await res.json()
                        if (!res.ok) throw new Error(j?.error || 'Failed')
                        window.open(j.url, '_blank')
                        toast('Opened billing portal', 'success')
                      } catch (e:any) { toast(e?.message || 'Portal failed', 'error') } finally { setBusy(null) }
                    }}
                    disabled={busy === u.id}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    title="Open Stripe billing portal"
                  >
                    Billing
                  </button>
                  <button
                    onClick={async()=>{
                      setBusy(u.id)
                      try {
                        const res = await fetch(`/api/admin-internal/users/${u.id}/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'PRO' }) })
                        const j = await res.json()
                        if (!res.ok) throw new Error(j?.error || 'Failed')
                        window.open(j.url, '_blank')
                        toast('Checkout created', 'success')
                      } catch (e:any) { toast(e?.message || 'Checkout failed', 'error') } finally { setBusy(null) }
                    }}
                    disabled={busy === u.id}
                    className="px-3 py-1.5 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                    title="Create checkout for PRO"
                  >
                    Checkout (Pro)
                  </button>
                  <button
                    onClick={async()=>{
                      if (!confirm('Cancel subscription at period end?')) return
                      setBusy(u.id)
                      try {
                        const res = await fetch(`/api/admin-internal/users/${u.id}/subscription`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) })
                        const j = await res.json()
                        if (!res.ok) throw new Error(j?.error || 'Failed')
                        toast('Subscription set to cancel at period end', 'success')
                      } catch (e:any) { toast(e?.message || 'Cancel failed', 'error') } finally { setBusy(null) }
                    }}
                    disabled={busy === u.id}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                    title="Cancel subscription"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async()=>{
                      setBusy(u.id)
                      try {
                        const res = await fetch(`/api/admin-internal/users/${u.id}/subscription`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'resume' }) })
                        const j = await res.json()
                        if (!res.ok) throw new Error(j?.error || 'Failed')
                        toast('Subscription resumed', 'success')
                      } catch (e:any) { toast(e?.message || 'Resume failed', 'error') } finally { setBusy(null) }
                    }}
                    disabled={busy === u.id}
                    className="px-3 py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50"
                    title="Resume subscription"
                  >
                    Resume
                  </button>
                  <button
                    onClick={()=>onDelete(u.id)}
                    disabled={busy === u.id}
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {busy === u.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {drawerOpen && drawerUser && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={()=>setDrawerOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl border-l p-6 overflow-auto" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">User Details</h2>
              <button className="px-2 py-1 rounded border border-slate-300" onClick={()=>setDrawerOpen(false)}>Close</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-600">ID</span><div className="font-mono text-xs">{drawerUser.user.id}</div></div>
                <div><span className="text-slate-600">Email</span><div>{drawerUser.user.email || '—'}</div></div>
                <div><span className="text-slate-600">Name</span><div>{drawerUser.user.name || '—'}</div></div>
                <div><span className="text-slate-600">Created</span><div className="text-xs">{drawerUser.user.createdAt ? new Date(drawerUser.user.createdAt).toLocaleString() : '—'}</div></div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <div className="font-medium mb-2">Profile</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-600">Plan</span><div>{drawerUser.profile?.plan || '—'}</div></div>
                  <div><span className="text-slate-600">Onboarding</span><div>{drawerUser.profile?.onboarding_complete ? 'Complete' : 'Pending'}</div></div>
                  <div><span className="text-slate-600">Subscription</span><div>{drawerUser.profile?.subscription_status || '—'}</div></div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <div className="font-medium mb-2">Usage</div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><span className="text-slate-600">Projects</span><div>{drawerUser.usage.projects}</div></div>
                  <div><span className="text-slate-600">Tasks</span><div>{drawerUser.usage.tasks}</div></div>
                  <div><span className="text-slate-600">Team</span><div>{drawerUser.usage.team}</div></div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <div className="font-medium mb-2">Integrations</div>
                <div className="text-sm space-y-1">
                  {(drawerUser.integrations || []).length === 0 ? (
                    <div className="text-slate-600">None</div>
                  ) : drawerUser.integrations.map((i:any)=> (
                    <div key={i.id} className="flex items-center justify-between">
                      <div>{i.type}</div>
                      <div className="text-xs text-slate-500">{i.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Payments & Invoices</div>
                  <button
                    className="text-sm px-2 py-1 rounded border border-slate-300"
                    onClick={async()=>{
                      try {
                        const res = await fetch(`/api/admin-internal/stripe/invoices?userId=${drawerUser.user.id}`)
                        const j = await res.json()
                        setDrawerUser((d:any)=> ({...d, invoices: j.invoices || []}))
                      } catch {}
                    }}
                  >Load invoices</button>
                </div>
                <div className="overflow-x-auto mb-3">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-100"><tr><th className="px-2 py-1 text-left">Invoice</th><th className="px-2 py-1 text-left">Due</th><th className="px-2 py-1 text-left">Paid</th><th className="px-2 py-1 text-left">Status</th><th className="px-2 py-1 text-left"></th></tr></thead>
                    <tbody className="divide-y">
                      {Array.isArray(drawerUser?.invoices) && drawerUser.invoices.length > 0 ? (
                        drawerUser.invoices.map((inv:any)=> (
                          <tr key={inv.id}>
                            <td className="px-2 py-1"><a className="text-blue-600 underline" href={inv.hosted_invoice_url || '#'} target="_blank" rel="noreferrer">{inv.id}</a></td>
                            <td className="px-2 py-1">{inv.amount_due/100}</td>
                            <td className="px-2 py-1">{inv.amount_paid/100}</td>
                            <td className="px-2 py-1">{inv.status}</td>
                            <td className="px-2 py-1 text-right">
                              <button
                                className="px-2 py-1 rounded border border-amber-300 text-amber-700"
                                onClick={async()=>{
                                  const amt = window.prompt('Refund amount in cents (leave empty for full refund)')
                                  try {
                                    const res = await fetch('/api/admin-internal/stripe/refunds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoice_id: inv.id, amount_cents: amt ? parseInt(amt,10) : undefined }) })
                                    const j = await res.json()
                                    if (!res.ok) throw new Error(j?.error || 'Refund failed')
                                    alert('Refund created: ' + j.refund?.id)
                                  } catch (e:any) {
                                    alert(e?.message || 'Refund failed')
                                  }
                                }}
                              >Refund</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td className="px-2 py-2" colSpan={5}>Load invoices to view</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-100"><tr><th className="px-2 py-1 text-left">Payment</th><th className="px-2 py-1 text-left">Amount</th><th className="px-2 py-1 text-left">Status</th><th className="px-2 py-1 text-left">Paid</th></tr></thead>
                    <tbody className="divide-y">
                      {(drawerUser.payments || []).length === 0 ? (
                        <tr><td className="px-2 py-2" colSpan={4}>No payments</td></tr>
                      ) : drawerUser.payments.map((p:any)=> (
                        <tr key={p.id}><td className="px-2 py-1">{p.stripeInvoiceId}</td><td className="px-2 py-1">{p.amount/100} {p.currency}</td><td className="px-2 py-1">{p.status}</td><td className="px-2 py-1">{p.paidAt ? new Date(p.paidAt).toLocaleString() : '—'}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <div className="font-medium mb-2">Security</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100" onClick={async()=>{
                    try {
                      const res = await fetch(`/api/admin-internal/users/${drawerUser.user.id}/invalidate-sessions`, { method: 'POST' })
                      const j = await res.json()
                      if (!res.ok) throw new Error(j?.error || 'Failed')
                      alert('All sessions invalidated')
                    } catch (e:any) { alert(e?.message || 'Failed') }
                  }}>Invalidate Sessions</button>
                  <button className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100" onClick={async()=>{
                    try {
                      const res = await fetch(`/api/admin-internal/users/${drawerUser.user.id}/impersonate`, { method: 'POST' })
                      const j = await res.json()
                      if (!res.ok) throw new Error(j?.error || 'Failed')
                      window.open(j.action_link, '_blank')
                    } catch (e:any) { alert(e?.message || 'Failed') }
                  }}>Impersonate (dev)</button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Feature Flags</div>
                  <button className="text-sm px-2 py-1 rounded border border-slate-300" onClick={async()=>{
                    try {
                      const res = await fetch(`/api/admin-internal/users/${drawerUser.user.id}/flags`)
                      const j = await res.json()
                      setDrawerUser((d:any)=> ({...d, flags: j.flags || []}))
                    } catch {}
                  }}>Load flags</button>
                </div>
                <div className="space-y-2 text-sm">
                  {Array.isArray(drawerUser.flags) && drawerUser.flags.length > 0 ? (
                    drawerUser.flags.map((f:any)=> (
                      <div key={f.key} className="flex items-center justify-between border rounded p-2">
                        <div>
                          <div className="font-medium">{f.key}</div>
                          <div className="text-xs text-slate-500">{f.description || ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Base: {String(f.enabled)}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={f.override ?? f.enabled} onChange={async(e)=>{
                              const ok = await fetch(`/api/admin-internal/users/${drawerUser.user.id}/flags`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ key: f.key, enabled: e.target.checked }) })
                              if (ok) {
                                setDrawerUser((d:any)=> ({...d, flags: d.flags.map((x:any)=> x.key===f.key? {...x, override: e.target.checked }: x)}))
                              }
                            }} className="sr-only peer" />
                            <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600">Load flags to view</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


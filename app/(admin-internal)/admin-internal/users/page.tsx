"use client"

import { useEffect, useState } from 'react'

type UserRow = { id: string, email?: string | null, name?: string | null, createdAt?: string | null }

export default function AdminUsersPage() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserRow[]>([])
  const [busy, setBusy] = useState<string|null>(null)

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
    } catch (e:any) {
      alert(e?.message || 'Delete failed')
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
                <td className="px-4 py-2 font-mono text-xs">{u.id}</td>
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
                      } catch (e:any) {
                        alert(e?.message || 'Reset failed')
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
                      } catch (e:any) { alert(e?.message || 'Portal failed') } finally { setBusy(null) }
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
                      } catch (e:any) { alert(e?.message || 'Checkout failed') } finally { setBusy(null) }
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
                        alert('Subscription set to cancel at period end')
                      } catch (e:any) { alert(e?.message || 'Cancel failed') } finally { setBusy(null) }
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
                        alert('Subscription resumed')
                      } catch (e:any) { alert(e?.message || 'Resume failed') } finally { setBusy(null) }
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
    </div>
  )
}


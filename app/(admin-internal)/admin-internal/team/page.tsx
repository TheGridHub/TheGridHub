"use client"

import { useEffect, useState } from 'react'

type MembershipRow = { id: string, userId: string, role: string, createdAt?: string|null }

export default function AdminTeamPage() {
  const [loading, setLoading] = useState(true)
  const [memberships, setMemberships] = useState<MembershipRow[]>([])
  const [busy, setBusy] = useState<string|null>(null)

  async function fetchMemberships() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin-internal/team', { cache: 'no-store' })
      const json = await res.json()
      setMemberships(json.memberships || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMemberships() }, [])

  async function onDelete(id: string) {
    const sure = window.confirm('Remove this team membership?')
    if (!sure) return
    setBusy(id)
    try {
      const res = await fetch('/api/admin-internal/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId: id })
      })
      if (!res.ok) {
        const j = await res.json().catch(()=>({}))
        throw new Error(j?.error || 'Delete failed')
      }
      await fetchMemberships()
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
          <h1 className="text-2xl font-semibold text-slate-900">Team Memberships</h1>
          <p className="text-slate-600 text-sm">Manage team membership rows directly.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4">
        <form className="flex items-center gap-2" onSubmit={async(ev)=>{ev.preventDefault(); const userId=(ev.currentTarget.elements.namedItem('uid') as HTMLInputElement).value.trim(); const role=(ev.currentTarget.elements.namedItem('role') as HTMLSelectElement).value; if(!userId||!role) return; const res=await fetch('/api/admin-internal/team',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,role})}); const j=await res.json(); if(!res.ok) alert(j?.error||'Create failed'); else { (ev.currentTarget as any).reset(); fetchMemberships() }}}>
          <input name="uid" placeholder="userId" className="border rounded px-3 py-2 text-sm" />
          <select name="role" className="border rounded px-2 py-2 text-sm">
            <option value="owner">owner</option>
            <option value="admin">admin</option>
            <option value="member" selected>member</option>
          </select>
          <button className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Add Membership</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">User ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td className="px-4 py-4" colSpan={5}>Loading...</td></tr>
            ) : memberships.length === 0 ? (
              <tr><td className="px-4 py-4" colSpan={5}>No memberships found</td></tr>
            ) : memberships.map(m => (
              <tr key={m.id}>
                <td className="px-4 py-2 font-mono text-xs">{m.id}</td>
                <td className="px-4 py-2 font-mono text-xs">{m.userId}</td>
                <td className="px-4 py-2">
                  <select className="border rounded px-2 py-1 text-sm" defaultValue={m.role} onChange={async(e)=>{
                    const res = await fetch('/api/admin-internal/team',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({membershipId: m.id, role: e.target.value})}); const j = await res.json(); if(!res.ok) alert(j?.error||'Update failed')
                  }}>
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                    <option value="member">member</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-xs text-slate-500">{m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={()=>onDelete(m.id)}
                    disabled={busy === m.id}
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {busy === m.id ? 'Deleting...' : 'Delete'}
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


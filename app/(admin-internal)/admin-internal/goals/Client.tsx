"use client"

import { useEffect, useState } from 'react'

export default function GoalsClient() {
  type GoalRow = { id: string, title: string, status?: string|null, userId: string, projectId?: string|null, createdAt?: string|null }
  const [q, setQ] = useState('')
  const [userId, setUserId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<GoalRow[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)

  async function fetchGoals() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (userId) params.set('userId', userId)
      if (projectId) params.set('projectId', projectId)
      if (status) params.set('status', status)
      const res = await fetch(`/api/admin-internal/goals?${params.toString()}`)
      const json = await res.json()
      setGoals(json.goals || [])
      setSelected({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGoals() }, [])

  async function onBulkDelete() {
    const ids = Object.keys(selected).filter(k => selected[k])
    if (!ids.length) return
    const sure = window.confirm(`Delete ${ids.length} goals? This cannot be undone.`)
    if (!sure) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin-internal/goals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      if (!res.ok) throw new Error('Delete failed')
      await fetchGoals()
    } catch (e:any) {
      alert(e?.message || 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Goals</h1>
          <p className="text-slate-600 text-sm">Filter and bulk delete goals.</p>
        </div>
        <div className="flex items-center gap-2">
          <input placeholder="Search title" className="rounded-lg border border-slate-300 px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} />
          <input placeholder="User ID" className="rounded-lg border border-slate-300 px-3 py-2" value={userId} onChange={e=>setUserId(e.target.value)} />
          <input placeholder="Project ID" className="rounded-lg border border-slate-300 px-3 py-2" value={projectId} onChange={e=>setProjectId(e.target.value)} />
          <input placeholder="Status" className="rounded-lg border border-slate-300 px-3 py-2" value={status} onChange={e=>setStatus(e.target.value)} />
          <button onClick={fetchGoals} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Apply</button>
          <button onClick={onBulkDelete} disabled={busy} className="px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50">Delete selected</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2"><input type="checkbox" onChange={e=>{
                const checked = e.target.checked
                const map: Record<string, boolean> = {}
                for (const g of goals) map[g.id] = checked
                setSelected(map)
              }} /></th>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Project</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={7}>Loading...</td></tr>
            ) : goals.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={7}>No goals found</td></tr>
            ) : goals.map(g => (
              <tr key={g.id}>
                <td className="px-3 py-2"><input type="checkbox" checked={!!selected[g.id]} onChange={e=>setSelected(s=>({...s, [g.id]: e.target.checked}))} /></td>
                <td className="px-3 py-2 font-mono text-xs">{g.id}</td>
                <td className="px-3 py-2">{g.title}</td>
                <td className="px-3 py-2 font-mono text-xs">{g.userId}</td>
                <td className="px-3 py-2 font-mono text-xs">{g.projectId || '—'}</td>
                <td className="px-3 py-2">{g.status || '—'}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{g.createdAt ? new Date(g.createdAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


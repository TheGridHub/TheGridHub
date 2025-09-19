"use client"

import { useEffect, useState } from 'react'

export default function ProjectsClient() {
  type ProjectRow = { id: string, name: string, description?: string|null, color?: string|null, userId: string, createdAt?: string|null }

  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [busy, setBusy] = useState<string|null>(null)

  async function fetchProjects(query = '') {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin-internal/projects${query ? `?q=${encodeURIComponent(query)}` : ''}`, { cache: 'no-store' })
      const json = await res.json()
      setProjects(json.projects || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  async function onDelete(id: string) {
    const sure = window.confirm('Delete this project and its tasks/goals? This cannot be undone.')
    if (!sure) return
    setBusy(id)
    try {
      const res = await fetch('/api/admin-internal/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id })
      })
      if (!res.ok) {
        const j = await res.json().catch(()=>({}))
        throw new Error(j?.error || 'Delete failed')
      }
      await fetchProjects(q)
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
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-slate-600 text-sm">Search and manage projects. Delete cascades tasks/goals.</p>
        </div>
        <form onSubmit={(e)=>{ e.preventDefault(); fetchProjects(q) }} className="flex items-center gap-2">
          <input
            placeholder="Search by name"
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
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Owner (userId)</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td className="px-4 py-4" colSpan={5}>Loading...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td className="px-4 py-4" colSpan={5}>No projects found</td></tr>
            ) : projects.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-2 font-mono text-xs">{p.id}</td>
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 font-mono text-xs">{p.userId}</td>
                <td className="px-4 py-2 text-xs text-slate-500">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={()=>onDelete(p.id)}
                    disabled={busy === p.id}
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {busy === p.id ? 'Deleting...' : 'Delete'}
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


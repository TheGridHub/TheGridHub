"use client"

import { useEffect, useState } from 'react'

export default function NotificationsClient() {
  type NotiRow = { id: string, userId: string, title: string, body?: string|null, read?: boolean, createdAt?: string|null }
  const [userId, setUserId] = useState('')
  const [unread, setUnread] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<NotiRow[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)

  async function fetchRows() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (userId) params.set('userId', userId)
      if (unread) params.set('unread', '1')
      const res = await fetch(`/api/admin-internal/notifications?${params.toString()}`)
      const json = await res.json()
      setRows(json.notifications || [])
      setSelected({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRows() }, [])

  async function onBulkDelete() {
    const ids = Object.keys(selected).filter(k => selected[k])
    if (!ids.length) return
    const sure = window.confirm(`Delete ${ids.length} notifications? This cannot be undone.`)
    if (!sure) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin-internal/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      if (!res.ok) throw new Error('Delete failed')
      await fetchRows()
    } catch (e:any) {
      alert(e?.message || 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  async function onMark(read: boolean) {
    const ids = Object.keys(selected).filter(k => selected[k])
    if (!ids.length) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin-internal/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, read })
      })
      if (!res.ok) throw new Error('Update failed')
      await fetchRows()
    } catch (e:any) {
      alert(e?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-slate-600 text-sm">Filter and bulk actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <input placeholder="User ID" className="rounded-lg border border-slate-300 px-3 py-2" value={userId} onChange={e=>setUserId(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={unread} onChange={e=>setUnread(e.target.checked)} />
            Unread only
          </label>
          <button onClick={fetchRows} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Apply</button>
          <button onClick={()=>onMark(true)} disabled={busy} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50">Mark read</button>
          <button onClick={()=>onMark(false)} disabled={busy} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50">Mark unread</button>
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
                for (const r of rows) map[r.id] = checked
                setSelected(map)
              }} /></th>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Read</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={6}>Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={6}>No notifications found</td></tr>
            ) : rows.map(r => (
              <tr key={r.id}>
                <td className="px-3 py-2"><input type="checkbox" checked={!!selected[r.id]} onChange={e=>setSelected(s=>({...s, [r.id]: e.target.checked}))} /></td>
                <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.userId}</td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">{r.read ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


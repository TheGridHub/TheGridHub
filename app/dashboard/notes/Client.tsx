"use client"

import React, { useEffect, useMemo, useState } from 'react'

interface Note {
  id: string
  entityType: string
  entityId: string
  content: string
  pinned: boolean
  createdAt: string
}

export default function NotesClient() {
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [data, setData] = useState<Note[]>([])
  const [count, setCount] = useState(0)
  const [limit] = useState(50)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create form state
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ entityType: 'contact', entityId: '', content: '' })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / limit)), [count, limit])
  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('offset', String(offset))
      if (entityType) params.set('entityType', entityType)
      if (entityId) params.set('entityId', entityId)
      const res = await fetch(`/api/notes?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load notes')
      setData(json.notes || [])
      setCount(json.count || 0)
    } catch (e: any) {
      setError(e?.message || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [entityType, entityId, limit, offset])

  async function createNote() {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const json = await res.json()
      if (json && json.allowed === false) {
        throw new Error(json.reason || 'Upgrade to continue')
      }
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to create note')
      if (!json.note) throw new Error('Unexpected response')
      setData(d => [json.note, ...d])
      setCount(c => c + 1)
      setShowCreate(false)
      setForm({ entityType: 'contact', entityId: '', content: '' })
    } catch (e: any) {
      setError(e?.message || 'Failed to create note')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <div className="flex items-center gap-2">
          <select value={entityType} onChange={e => { setOffset(0); setEntityType(e.target.value) }} className="border rounded px-3 py-2">
            <option value="">All entities</option>
            <option value="contact">Contact</option>
            <option value="company">Company</option>
            <option value="project">Project</option>
            <option value="task">Task</option>
          </select>
          <input value={entityId} onChange={e => { setOffset(0); setEntityId(e.target.value) }} placeholder="Entity ID (optional)" className="border rounded px-3 py-2 w-64" />
          <button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">New note</button>
        </div>
      </div>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Entity</th>
              <th className="text-left px-3 py-2">Content</th>
              <th className="text-left px-3 py-2">Pinned</th>
              <th className="text-right px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-500">No notes</td></tr>
            ) : (
              data.map(n => (
                <tr key={n.id} className="border-t">
                  <td className="px-3 py-2">{n.entityType} · {n.entityId.slice(0, 6)}…</td>
                  <td className="px-3 py-2 whitespace-pre-wrap">{n.content}</td>
                  <td className="px-3 py-2">{n.pinned ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 text-right text-gray-500">{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-600">{count} total</div>
        <div className="flex gap-2 items-center">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="border rounded px-3 py-1 disabled:opacity-50">Prev</button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <button disabled={offset + limit >= count} onClick={() => setOffset(offset + limit)} className="border rounded px-3 py-1 disabled:opacity-50">Next</button>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-xl p-4">
            <h2 className="text-lg font-semibold mb-3">New note</h2>
            <div className="grid grid-cols-2 gap-3">
              <select className="border rounded px-3 py-2" value={form.entityType} onChange={e => setForm(f => ({ ...f, entityType: e.target.value }))}>
                <option value="contact">Contact</option>
                <option value="company">Company</option>
                <option value="project">Project</option>
                <option value="task">Task</option>
              </select>
              <input className="border rounded px-3 py-2" placeholder="Entity ID" value={form.entityId} onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))} />
              <textarea className="border rounded px-3 py-2 col-span-2 min-h-[120px]" placeholder="Write your note…" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={createNote} disabled={creating || !form.entityId || !form.content.trim()} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{creating ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


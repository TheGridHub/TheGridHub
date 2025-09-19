"use client"

import React, { useEffect, useState } from 'react'

interface Project { id: string; name: string; description?: string }
interface Attachment { id: string; key: string; url?: string | null; size_bytes: number; created_at: string }

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [files, setFiles] = useState<Record<string, Attachment[]>>({})
  const [filesLoading, setFilesLoading] = useState<Record<string, boolean>>({})

  const load = async () => {
    setLoading(true)
    setMessage(null)
    const res = await fetch('/api/projects')
    const data = await res.json()
    setItems(data.projects || [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const create = async () => {
    if (!name.trim()) return
    setCreating(true)
    setMessage(null)
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    const data = await res.json()
    if (res.ok && data.project) {
      setItems([data.project, ...items])
      setName('')
      setUpgradeRequired(false)
    } else if (data.upgradeRequired) {
      setUpgradeRequired(true)
      setMessage(data.reason || 'Upgrade required to create more projects.')
    } else if (data.error) {
      setMessage(data.error)
    } else {
      setMessage('Failed to create project')
    }
    setCreating(false)
  }

  const loadFiles = async (projectId: string) => {
    setFilesLoading(x => ({ ...x, [projectId]: true }))
    try {
      const res = await fetch(`/api/projects/${projectId}/files`)
      const data = await res.json()
      setFiles(x => ({ ...x, [projectId]: data || [] }))
    } finally {
      setFilesLoading(x => ({ ...x, [projectId]: false }))
    }
  }

  const remove = async (id: string) => {
    const prev = items
    setItems(items.filter(i => i.id !== id))
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (!res.ok) setItems(prev)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Projects</h1>

      <div className="flex gap-2 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" className="flex-1 border border-gray-300 rounded-md px-3 py-2" />
        <button onClick={create} disabled={creating || !name.trim()} className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50">{creating ? 'Adding…' : 'Add'}</button>
      </div>
      {message && (
        <div className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 flex items-center justify-between">
          <span>{message}</span>
          {upgradeRequired && (
            <button
onClick={async()=>{ const r=await fetch('/api/stripe/create-checkout-session',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ interval:'monthly', currency: (window as any).__selectedCurrency })}); const j=await r.json(); if (j.url) window.location.href=j.url; }}
              className="px-3 py-1.5 rounded bg-black text-white hover:bg-black/90"
            >Upgrade to Pro</button>
          )}
        </div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-2">
          {items.length === 0 && <div className="text-gray-600">No projects yet.</div>}
          {items.map(p => (
            <div key={p.id} className="flex items-center justify-between border rounded-md px-3 py-2">
              <div>
                <div className="font-medium">{p.name}</div>
                {p.description && <div className="text-sm text-gray-600">{p.description}</div>}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-blue-600 hover:underline cursor-pointer">
                  <input type="file" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    // presign with plan check
                    const pres = await fetch(`/api/projects/${p.id}/files/presign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ size: file.size, contentType: file.type, ext: file.name.split('.').pop() }) })
                    const pre = await pres.json()
                    if (!pres.ok || pre.error) { alert(pre.reason || pre.error || 'Upload not allowed'); return }
                    await fetch(pre.url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
                    await fetch(`/api/projects/${p.id}/files/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: pre.key, url: pre.publicUrl, size: file.size }) })
                    await loadFiles(p.id)
                    alert('Uploaded')
                  }} />
                  Attach File
                </label>
                <button onClick={async () => {
                  setExpanded(x => ({ ...x, [p.id]: !x[p.id] }))
                  if (!expanded[p.id]) await loadFiles(p.id)
                }} className="text-sm text-gray-600 hover:underline">{expanded[p.id] ? 'Hide' : 'View'} Attachments</button>
                <button onClick={() => remove(p.id)} className="text-sm text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attachments panels */}
      {items.map(p => (
        expanded[p.id] && (
          <div key={`files-${p.id}`} className="mt-2 mb-4 ml-2 border rounded-md p-3 bg-gray-50">
            <div className="text-sm font-medium mb-2">Attachments</div>
            {filesLoading[p.id] ? (
              <div className="text-sm text-gray-600">Loading…</div>
            ) : (files[p.id]?.length || 0) === 0 ? (
              <div className="text-sm text-gray-600">No files yet.</div>
            ) : (
              <ul className="space-y-1">
                {files[p.id].map(f => (
                  <li key={f.id} className="flex items-center justify-between">
                    <a href={f.url || '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {f.key.split('/').pop()}
                    </a>
                    <span className="text-xs text-gray-500">{formatSize(f.size_bytes)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      ))}
    </div>
  )
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

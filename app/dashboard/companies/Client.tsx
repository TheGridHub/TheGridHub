"use client"

import React, { useEffect, useMemo, useState } from 'react'

interface Company {
  id: string
  name: string
  domain: string | null
  website: string | null
  industry: string | null
  size: string | null
  tags: string[]
  description: string | null
  createdAt: string
}

export default function CompaniesClient() {
  const [q, setQ] = useState('')
  const [data, setData] = useState<Company[]>([])
  const [count, setCount] = useState(0)
  const [limit] = useState(25)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create form state
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', domain: '', website: '', industry: '', size: '' })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / limit)), [count, limit])
  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('offset', String(offset))
      if (q) params.set('q', q)
      const res = await fetch(`/api/companies?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load companies')
      setData(json.companies || [])
      setCount(json.count || 0)
    } catch (e: any) {
      setError(e?.message || 'Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [q, limit, offset])

  async function createCompany() {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/companies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          domain: form.domain || undefined,
          website: form.website || undefined,
          industry: form.industry || undefined,
          size: form.size || undefined,
        })
      })
      const json = await res.json()
      if (json && json.allowed === false) {
        throw new Error(json.reason || 'Upgrade to continue')
      }
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to create company')
      if (!json.company) throw new Error('Unexpected response')
      setData(d => [json.company, ...d])
      setCount(c => c + 1)
      setShowCreate(false)
      setForm({ name: '', domain: '', website: '', industry: '', size: '' })
    } catch (e: any) {
      setError(e?.message || 'Failed to create company')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={e => { setOffset(0); setQ(e.target.value) }}
            placeholder="Search by name, domain, or website"
            className="border rounded px-3 py-2 w-64"
          />
          <button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">New company</button>
        </div>
      </div>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Domain</th>
              <th className="text-left px-3 py-2">Website</th>
              <th className="text-left px-3 py-2">Industry</th>
              <th className="text-left px-3 py-2">Size</th>
              <th className="text-right px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">No companies</td></tr>
            ) : (
              data.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2">{c.domain || '—'}</td>
                  <td className="px-3 py-2">{c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{c.website}</a> : '—'}</td>
                  <td className="px-3 py-2">{c.industry || '—'}</td>
                  <td className="px-3 py-2">{c.size || '—'}</td>
                  <td className="px-3 py-2 text-right text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
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
          <div className="bg-white rounded shadow-lg w-full max-w-lg p-4">
            <h2 className="text-lg font-semibold mb-3">New company</h2>
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded px-3 py-2 col-span-2" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className="border rounded px-3 py-2" placeholder="Domain (example.com)" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} />
              <input className="border rounded px-3 py-2" placeholder="Website (https://...)" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              <input className="border rounded px-3 py-2" placeholder="Industry" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
              <input className="border rounded px-3 py-2" placeholder="Size (e.g. 11-50)" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={createCompany} disabled={creating || !form.name.trim()} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{creating ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


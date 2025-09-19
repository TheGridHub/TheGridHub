"use client"

import React, { useEffect, useMemo, useState } from 'react'

interface Contact {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  title: string | null
  status: string
  tags: string[]
  companyId: string | null
  avatarUrl: string | null
  createdAt: string
}

export default function ContactsClient() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<string>('')
  const [data, setData] = useState<Contact[]>([])
  const [count, setCount] = useState(0)
  const [limit] = useState(25)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create form state
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', title: '', phone: '' })

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
      if (status) params.set('status', status)
      const res = await fetch(`/api/contacts?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load contacts')
      setData(json.contacts || [])
      setCount(json.count || 0)
    } catch (e: any) {
      setError(e?.message || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [q, status, limit, offset])

  async function createContact() {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          email: form.email || undefined,
          title: form.title || undefined,
          phone: form.phone || undefined,
        })
      })
      const json = await res.json()
      if (json && json.allowed === false) {
        throw new Error(json.reason || 'Upgrade to continue')
      }
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to create contact')
      if (!json.contact) throw new Error('Unexpected response')
      // Prepend new contact
      setData(d => [json.contact, ...d])
      setCount(c => c + 1)
      setShowCreate(false)
      setForm({ firstName: '', lastName: '', email: '', title: '', phone: '' })
    } catch (e: any) {
      setError(e?.message || 'Failed to create contact')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={e => { setOffset(0); setQ(e.target.value) }}
            placeholder="Search by name or email"
            className="border rounded px-3 py-2 w-64"
          />
          <select value={status} onChange={e => { setOffset(0); setStatus(e.target.value) }} className="border rounded px-3 py-2">
            <option value="">All statuses</option>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="customer">Customer</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">New contact</button>
        </div>
      </div>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Title</th>
              <th className="text-left px-3 py-2">Phone</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">No contacts</td></tr>
            ) : (
              data.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2">{[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td className="px-3 py-2">{c.email || '—'}</td>
                  <td className="px-3 py-2">{c.title || '—'}</td>
                  <td className="px-3 py-2">{c.phone || '—'}</td>
                  <td className="px-3 py-2 capitalize">{c.status}</td>
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
            <h2 className="text-lg font-semibold mb-3">New contact</h2>
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded px-3 py-2" placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
              <input className="border rounded px-3 py-2" placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
              <input className="border rounded px-3 py-2 col-span-2" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input className="border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <input className="border rounded px-3 py-2" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={createContact} disabled={creating} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{creating ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


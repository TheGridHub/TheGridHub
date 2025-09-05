"use client"

import { useEffect, useState } from 'react'

type Flag = {
  key: string
  enabled: boolean
  description?: string | null
  is_public: boolean
  updated_at?: string | null
}

export default function FeatureFlagsAdmin({ initialFlags }: { initialFlags: Flag[] }) {
  const [flags, setFlags] = useState<Flag[]>(initialFlags || [])
  const [busy, setBusy] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newFlag, setNewFlag] = useState<Flag>({ key: '', enabled: false, description: '', is_public: true, updated_at: null })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setFlags(initialFlags || []) }, [initialFlags])

  async function upsertFlag(payload: Partial<Flag> & { key: string }) {
    setError(null)
    setBusy(payload.key)
    try {
      const res = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: payload.key,
          enabled: payload.enabled,
          description: payload.description,
          isPublic: payload.is_public,
        }),
      })
      if (!res.ok) throw new Error(`Failed to update flag: ${res.status}`)
      const json = await res.json()
      const saved: Flag = json.flag
      setFlags(prev => {
        const map = new Map(prev.map(f => [f.key, f]))
        map.set(saved.key, saved)
        return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key))
      })
    } catch (e: any) {
      setError(e?.message || 'Failed to update flag')
    } finally {
      setBusy(null)
    }
  }

  async function handleToggle(key: string, enabled: boolean) {
    await upsertFlag({ key, enabled })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newFlag.key.trim()) {
      setError('Flag key is required')
      return
    }
    setCreating(true)
    await upsertFlag({
      key: newFlag.key.trim(),
      enabled: newFlag.enabled,
      description: newFlag.description || '',
      is_public: newFlag.is_public,
    })
    setNewFlag({ key: '', enabled: false, description: '', is_public: true, updated_at: null })
    setCreating(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Feature Flags</h1>
      </div>
      {error && (
        <div className="mt-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Public</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enabled</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flags.map((f) => (
              <tr key={f.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm text-gray-900">{f.key}</td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-xl">{f.description || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${f.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                    {f.is_public ? 'Public' : 'Private'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!f.enabled}
                      onChange={(e) => handleToggle(f.key, e.target.checked)}
                      disabled={busy === f.key}
                      aria-label={`Toggle ${f.key}`}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                      <div className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow" />
                    </div>
                  </label>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{f.updated_at ? new Date(f.updated_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleCreate} className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-white p-4 border border-gray-200 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">Key</label>
          <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="e.g. new-dashboard"
            value={newFlag.key}
            onChange={(e) => setNewFlag(v => ({ ...v, key: e.target.value }))}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="Optional description"
            value={newFlag.description || ''}
            onChange={(e) => setNewFlag(v => ({ ...v, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Public</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            value={newFlag.is_public ? 'true' : 'false'}
            onChange={(e) => setNewFlag(v => ({ ...v, is_public: e.target.value === 'true' }))}
          >
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700">Enabled</label>
          <input
            type="checkbox"
            checked={newFlag.enabled}
            onChange={(e) => setNewFlag(v => ({ ...v, enabled: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Saving...' : 'Create/Update'}
          </button>
        </div>
      </form>
    </div>
  )
}


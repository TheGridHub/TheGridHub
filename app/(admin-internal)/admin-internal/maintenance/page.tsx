"use client"

import Link from 'next/link'
import { useState } from 'react'

export default function AdminMaintenancePage() {
  const [busy, setBusy] = useState<string>('')
  const [msg, setMsg] = useState<string>('')

  async function run(action: string) {
    setBusy(action)
    setMsg('')
    try {
      const res = await fetch('/api/admin-internal/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const j = await res.json().catch(()=>({}))
      if (!res.ok) throw new Error(j?.error || 'Failed')
      setMsg('Done')
    } catch (e:any) {
      setMsg(e?.message || 'Failed')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Maintenance</h1>
          <p className="text-slate-600 text-sm">Owner-only safe operations</p>
        </div>
        <Link href="/admin-internal" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Back</Link>
      </div>

      {msg && <div className="text-sm text-slate-600">{msg}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Purge old logs</h2>
          <p className="text-sm text-slate-600 mb-3">Remove app_logs older than 30 days.</p>
          <button disabled={!!busy} onClick={()=>run('purge_logs')} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm disabled:opacity-50">{busy==='purge_logs' ? 'Running...' : 'Run'}</button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Purge old notifications</h2>
          <p className="text-sm text-slate-600 mb-3">Delete notifications older than 90 days.</p>
          <button disabled={!!busy} onClick={()=>run('purge_notifications')} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm disabled:opacity-50">{busy==='purge_notifications' ? 'Running...' : 'Run'}</button>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DbExplorerPage() {
  const [tables, setTables] = useState<string[]>([])
  const [selected, setSelected] = useState<string>('')
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sql, setSql] = useState('SELECT * FROM users LIMIT 20')
  const [sqlRows, setSqlRows] = useState<any[]|null>(null)
  const [error, setError] = useState<string|null>(null)

  async function loadTables() {
    try {
      const res = await fetch('/api/admin-internal/db/tables')
      const j = await res.json()
      setTables(j.tables || [])
    } catch {}
  }

  async function loadRows(table: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin-internal/db/query?table=${encodeURIComponent(table)}&limit=100`)
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Failed to load rows')
      setRows(j.rows || [])
    } catch (e:any) {
      setError(e?.message || 'Failed to load rows')
    } finally {
      setLoading(false)
    }
  }

  async function runSql() {
    setLoading(true)
    setError(null)
    setSqlRows(null)
    try {
      const res = await fetch('/api/admin-internal/db/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'SQL failed')
      setSqlRows(j.rows)
    } catch (e:any) {
      setError(e?.message || 'SQL failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTables() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">DB Explorer</h1>
          <p className="text-slate-600 text-sm">Browse tables and run read-only SQL</p>
        </div>
        <Link href="/admin-internal" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Back</Link>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Tables</h2>
          <ul className="space-y-2 text-sm max-h-[420px] overflow-auto">
            {tables.map(t => (
              <li key={t}>
                <button
                  className={`px-2 py-1 rounded hover:bg-slate-50 ${selected===t ? 'text-purple-700 font-medium' : 'text-slate-700'}`}
                  onClick={() => { setSelected(t); loadRows(t) }}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-3">{selected ? `Rows in ${selected}` : 'Rows'}</h2>
          {loading ? (
            <div className="text-sm text-slate-600">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-slate-600">{selected ? 'No rows' : 'Select a table'}</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    {Object.keys(rows[0] || {}).map((k) => (
                      <th key={k} className="px-2 py-2 text-left font-medium text-slate-500 uppercase">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r, i) => (
                    <tr key={i}>
                      {Object.keys(rows[0] || {}).map((k) => (
                        <td key={k} className="px-2 py-1 whitespace-nowrap text-slate-700">{String(r[k])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-900 mb-3">Read-only SQL</h2>
        <div className="flex items-start gap-3">
          <textarea
            className="w-full h-32 rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
            value={sql}
            onChange={e=>setSql(e.target.value)}
          />
          <button onClick={runSql} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Run</button>
        </div>
        {sqlRows && (
          <div className="mt-3 overflow-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  {Object.keys(sqlRows[0] || {}).map((k) => (
                    <th key={k} className="px-2 py-2 text-left font-medium text-slate-500 uppercase">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sqlRows.map((r, i) => (
                  <tr key={i}>
                    {Object.keys(sqlRows[0] || {}).map((k) => (
                      <td key={k} className="px-2 py-1 whitespace-nowrap text-slate-700">{String(r[k])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


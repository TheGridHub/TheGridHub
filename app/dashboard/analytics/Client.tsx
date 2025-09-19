"use client"

import React, { useEffect, useState } from 'react'

interface TimeseriesPoint { date: string; count: number }
interface Summary {
  projects: number
  tasks: { total: number; completed: number }
  companies: number
  contacts: number
  notes: number
}

export default function AnalyticsClient() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [created, setCreated] = useState<TimeseriesPoint[]>([])
  const [completed, setCompleted] = useState<TimeseriesPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analytics?days=14')
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to load analytics')
      setSummary(json.summary)
      setCreated(json.timeseries.tasksCreated || [])
      setCompleted(json.timeseries.tasksCompleted || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function MiniBars({ data }: { data: TimeseriesPoint[] }) {
    const max = Math.max(1, ...data.map(d => d.count))
    return (
      <div className="flex items-end gap-1 h-16">
        {data.map((d, i) => (
          <div key={i} title={`${d.date}: ${d.count}`} className="bg-blue-500" style={{ width: 12, height: Math.max(2, Math.round(60 * d.count / max)) }} />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <button onClick={load} className="border rounded px-3 py-2">Refresh</button>
      </div>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      {loading && <div className="mb-3 text-gray-600">Loading…</div>}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Projects</div>
            <div className="text-2xl font-semibold">{summary.projects}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Tasks (total)</div>
            <div className="text-2xl font-semibold">{summary.tasks.total}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Tasks (completed)</div>
            <div className="text-2xl font-semibold">{summary.tasks.completed}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Companies</div>
            <div className="text-2xl font-semibold">{summary.companies}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Contacts</div>
            <div className="text-2xl font-semibold">{summary.contacts}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Tasks created (last 14 days)</div>
            <div className="text-sm text-gray-500">Total {created.reduce((a, b) => a + b.count, 0)}</div>
          </div>
          <MiniBars data={created} />
        </div>
        <div className="border rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Tasks completed (last 14 days)</div>
            <div className="text-sm text-gray-500">Total {completed.reduce((a, b) => a + b.count, 0)}</div>
          </div>
          <MiniBars data={completed} />
        </div>
      </div>
    </div>
  )
}


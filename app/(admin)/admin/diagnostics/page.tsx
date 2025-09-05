"use client"

import { useState } from "react"

export default function DiagnosticsPage() {
  const [log, setLog] = useState<string>(() => '')
  const [running, setRunning] = useState(false)

  const append = (msg: string) => setLog(prev => `${prev}${prev ? '\n' : ''}${msg}`)

  const checks: Array<{label: string, run: () => Promise<void>}> = [
    // Health
    { label: 'Health: App', run: async () => {
        const r = await fetch('/api/health/app')
        append(`Health App: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Health: DB', run: async () => {
        const r = await fetch('/api/health/db')
        append(`Health DB: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Health: Stripe (last webhook)', run: async () => {
        const r = await fetch('/api/health/stripe')
        append(`Health Stripe: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    // Integrations - Slack
    { label: 'Slack: Status', run: async () => {
        const r = await fetch('/api/integrations/slack/status')
        append(`Slack Status: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    // Integrations - Google
    { label: 'Google: Test Email', run: async () => {
        const r = await fetch('/api/integrations/google/test-email', { method: 'POST' })
        append(`Google Test Email: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Google: Test Calendar', run: async () => {
        const r = await fetch('/api/integrations/google/test-calendar', { method: 'POST' })
        append(`Google Test Calendar: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Google: Test Sheets', run: async () => {
        const r = await fetch('/api/integrations/google/test-sheets', { method: 'POST' })
        append(`Google Test Sheets: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    // Integrations - Microsoft
    { label: 'Microsoft: Status', run: async () => {
        const r = await fetch('/api/integrations/office365/status')
        append(`Microsoft Status: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Microsoft: Test Email', run: async () => {
        const r = await fetch('/api/integrations/office365/test-email', { method: 'POST' })
        append(`Microsoft Test Email: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Microsoft: Test Calendar', run: async () => {
        const r = await fetch('/api/integrations/office365/test-calendar', { method: 'POST' })
        append(`Microsoft Test Calendar: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    // Jira (requires task and project setup)
    // NOTE: Provide your own IDs below before clicking.
    { label: 'Jira: Create Issue (requires IDs)', run: async () => {
        const taskId = prompt('Task ID?') || ''
        const projectId = prompt('Project ID?') || ''
        if (!taskId || !projectId) { append('Jira skipped (missing IDs)'); return }
        const r = await fetch('/api/integrations/jira/create-issue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, projectId }) })
        append(`Jira Create Issue: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    // Core APIs
    { label: 'Projects: List', run: async () => {
        const r = await fetch('/api/projects')
        append(`Projects List: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Tasks: List', run: async () => {
        const r = await fetch('/api/tasks')
        append(`Tasks List: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Goals: List', run: async () => {
        const r = await fetch('/api/goals')
        append(`Goals List: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Notifications: List', run: async () => {
        const r = await fetch('/api/notifications')
        append(`Notifications List: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    },
    { label: 'Team: List', run: async () => {
        const r = await fetch('/api/team')
        append(`Team List: ${r.status} ${r.statusText}`)
        append(await r.text())
      }
    }
  ]

  const runAll = async () => {
    setLog('')
    setRunning(true)
    try {
      for (const c of checks) {
        append(`▶ ${c.label}`)
        try { await c.run() } catch (e: any) { append(`Error: ${e?.message || String(e)}`) }
        append('')
      }
      append('✅ Done')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">Diagnostics</h1>
          <button onClick={runAll} disabled={running} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50">{running ? 'Running…' : 'Run All'}</button>
        </div>
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          {checks.map((c, idx) => (
            <button key={idx} onClick={async()=>{ setRunning(true); try{ setLog(''); append(`▶ ${c.label}`); await c.run(); append(''); } finally { setRunning(false) } }} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-left">
              {c.label}
            </button>
          ))}
        </div>
        <pre className="bg-slate-950 text-slate-100 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-[50vh] overflow-auto">{log || 'Output will appear here.'}</pre>
      </div>
    </div>
  )
}


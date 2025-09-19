"use client"

import { useEffect, useState } from 'react'

export default function IntegrationsClient() {
  const [status, setStatus] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [hasUserSession, setHasUserSession] = useState<boolean>(false)
  const [impersonateEmail, setImpersonateEmail] = useState<string>('')

  async function checkUser() {
    try {
      const r = await fetch('/api/profile', { cache: 'no-store' })
      if (r.ok) {
        const j = await r.json().catch(()=>null)
        setHasUserSession(true)
        setUserEmail(j?.email || '')
        setStatus('User session detected.')
      } else {
        setHasUserSession(false)
        setStatus('No user session detected. Open /login in this browser and sign in as a test user, then return here.')
      }
    } catch {
      setHasUserSession(false)
      setStatus('Unable to verify user session.')
    }
  }

  useEffect(() => { checkUser() }, [])

  async function run(label: string, fn: () => Promise<Response>) {
    try {
      setStatus(`Running: ${label} ...`)
      const r = await fn()
      const text = await r.text()
      setStatus(`${label}: ${r.status} ${r.statusText} ${text ? `\n${text}` : ''}`)
    } catch (e:any) {
      setStatus(`${label}: Error ${e?.message || String(e)}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Integrations (Admin)</h1>
          <p className="text-slate-600 text-sm">Run smoke tests via existing endpoints. Requires a normal user session for OAuth-backed providers, or specify an email to impersonate.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <input
            placeholder="Impersonate user email"
            className="rounded-lg border border-slate-300 px-3 py-1"
            value={impersonateEmail}
            onChange={e=>setImpersonateEmail(e.target.value)}
          />
          {hasUserSession ? (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">User session: {userEmail || 'OK'}</span>
          ) : (
            <a href="/login" className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Sign in as test user</a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slack */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Slack</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>run('Slack Status', () => fetch('/api/integrations/slack/status', { cache: 'no-store' }))} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Status</button>
            <button onClick={async ()=>{
              const channelId = prompt('Slack channel ID?') || ''
              if (!channelId) return
              if (impersonateEmail) {
                await run('Slack Test Message (admin)', () => fetch('/api/admin-internal/integrations/slack/test-message', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail: impersonateEmail, channelId })
                }))
              } else {
                await run('Slack Test Message', () => fetch('/api/integrations/slack/test-message', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelId })
                }))
              }
            }} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Send test message</button>
          </div>
        </div>

        {/* Google Workspace */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Google Workspace</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>run('Google Status', () => fetch('/api/integrations/google/status', { cache: 'no-store' }))} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Status</button>
            <button onClick={()=> impersonateEmail
              ? run('Google Test Email (admin)', () => fetch('/api/admin-internal/integrations/google/test-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail: impersonateEmail }) }))
              : run('Google Test Email', () => fetch('/api/integrations/google/test-email', { method: 'POST' }))
            } className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Test email</button>
            <button onClick={()=> impersonateEmail
              ? run('Google Test Calendar (admin)', () => fetch('/api/admin-internal/integrations/google/test-calendar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail: impersonateEmail }) }))
              : run('Google Test Calendar', () => fetch('/api/integrations/google/test-calendar', { method: 'POST' }))
            } className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Test calendar</button>
          </div>
        </div>

        {/* Microsoft 365 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Microsoft 365</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>run('Microsoft Status', () => fetch('/api/integrations/office365/status', { cache: 'no-store' }))} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Status</button>
            <button onClick={()=> impersonateEmail
              ? run('Microsoft Test Email (admin)', () => fetch('/api/admin-internal/integrations/office365/test-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail: impersonateEmail }) }))
              : run('Microsoft Test Email', () => fetch('/api/integrations/office365/test-email', { method: 'POST' }))
            } className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Test email</button>
            <button onClick={()=> impersonateEmail
              ? run('Microsoft Test Calendar (admin)', () => fetch('/api/admin-internal/integrations/office365/test-calendar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail: impersonateEmail }) }))
              : run('Microsoft Test Calendar', () => fetch('/api/integrations/office365/test-calendar', { method: 'POST' }))
            } className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Test calendar</button>
          </div>
        </div>

        {/* Jira */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Jira</h2>
          <p className="text-sm text-slate-600 mb-2">Requires a taskId and projectId belonging to the signed-in user.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={async ()=>{
              const taskId = prompt('Task ID?') || ''
              const projectId = prompt('Project ID?') || ''
              if (!taskId || !projectId) return
              if (impersonateEmail) {
                await run('Jira Create Issue (admin)', () => fetch('/api/admin-internal/integrations/jira/create-issue', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail: impersonateEmail, taskId, projectId })
                }))
              } else {
                await run('Jira Create Issue', () => fetch('/api/integrations/jira/create-issue', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, projectId })
                }))
              }
            }} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Create test issue</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-900 mb-2">Output</h2>
        <pre className="text-xs text-slate-800 whitespace-pre-wrap">{status || '—'}</pre>
      </div>
    </div>
  )
}


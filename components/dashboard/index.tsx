"use client"

import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Slack as SlackIcon,
  GitBranch,
  MessageSquare,
  Send,
  Sparkles,
  Target,
  Trash2,
  Users,
} from 'lucide-react'
import type { Plan, IntegrationSummary } from '@/types/db'

// Subscription gate: hides Pro-only UI or shows an upgrade nudge
export function SubscriptionGate({ plan, children }: { plan: Plan | null, children: React.ReactNode }) {
  if (plan && plan !== 'FREE') return <>{children}</>
  return (
    <div className="relative">
      <div className="opacity-60 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link href="/pricing" className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700">
          Upgrade to unlock full analytics & AI
        </Link>
      </div>
    </div>
  )
}

export function SectionTabs({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'projects', label: 'Projects' },
    { id: 'goals', label: 'Goals' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'billing', label: 'Billing' },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium border ${value === t.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function AIAssistant({ userId, disabled }: { userId: string, disabled?: boolean }) {
  const [prompt, setPrompt] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!prompt.trim() || disabled) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, prompt }) })
      const json = await res.json().catch(() => ({}))
      setSuggestions(json?.suggestions || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${disabled ? 'opacity-60 pointer-events-none select-none' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h4 className="font-medium">AI Assistant</h4>
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-md px-3 py-2"
          placeholder="Ask AI to prioritize or break down tasks..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button onClick={ask} className="px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 flex items-center gap-1">
          <Send className="h-4 w-4" />
          Ask
        </button>
      </div>
      {loading && <div className="mt-3 text-sm text-gray-500">Thinking...</div>}
      {!!suggestions.length && (
        <div className="mt-4 space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded border">
              <div className="text-sm font-medium">{s.title}</div>
              {s.description && <div className="text-xs text-gray-600 mt-1">{s.description}</div>}
              {Array.isArray(s.subtasks) && s.subtasks.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-xs text-gray-700">
                  {s.subtasks.map((st: string, j: number) => <li key={j}>{st}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function IntegrationsPanel({ plan, statuses, onRefetch }: { plan: Plan | null, statuses?: IntegrationSummary[], onRefetch?: ()=>void }) {
  const [busy, setBusy] = useState<Record<string, boolean>>({})
  const get = (type: string) => statuses?.find(s => s.type?.toLowerCase() === type)
  const Badge = ({ ok }: { ok: boolean }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${ok? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{ok? 'Connected' : 'Not connected'}</span>
  )
  const syncNow = async (id?: string) => {
    if (!id) return
    setBusy(prev => ({ ...prev, [id]: true }))
    try { await fetch(`/api/integrations/${id}/sync`, { method: 'POST' }) } catch {}
    setBusy(prev => ({ ...prev, [id!]: false }))
    try { onRefetch && onRefetch() } catch {}
  }
  const testAction = async (endpoint: string, id?: string) => {
    if (!endpoint) return
    const key = `${id || endpoint}-test`
    setBusy(prev => ({ ...prev, [key]: true }))
    try { await fetch(endpoint, { method: 'POST' }) } catch {}
    setBusy(prev => ({ ...prev, [key]: false }))
  }
  const startAuth = async (provider: 'slack' | 'google' | 'office365') => {
    try {
      const res = await fetch(`/api/integrations/${provider}/auth`, { method: 'POST' })
      if (!res.ok) return
      const json = await res.json().catch(()=>({}))
      const url = json?.authUrl
      if (url) window.location.assign(url)
    } catch {}
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Slack */}
      <div className="p-4 rounded-xl border bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlackIcon className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium">Slack</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge ok={!!get('slack')} />
            {get('slack')?.id && (
              <button onClick={()=>syncNow(get('slack')!.id)} className={`text-sm px-3 py-1.5 border rounded-md ${busy[get('slack')!.id!] ? 'opacity-60' : 'hover:bg-gray-50'}`}>{busy[get('slack')!.id!] ? 'Syncing...' : 'Sync now'}</button>
            )}
            <button onClick={()=>startAuth('slack')} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">{get('slack')? 'Manage' : 'Connect'}</button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Send notifications to channels.</p>
        {get('slack')?.userEmail && <p className="text-xs text-gray-500 mt-1">Connected as {get('slack')!.userEmail}</p>}
        {get('slack')?.lastSync && <p className="text-xs text-gray-500">Last sync: {new Date(get('slack')!.lastSync!).toLocaleString()}</p>}
      </div>
      {/* Jira */}
      <div className="p-4 rounded-xl border bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium">Jira</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge ok={!!get('jira')} />
            {get('jira')?.id && (
              <button onClick={()=>syncNow(get('jira')!.id)} className={`text-sm px-3 py-1.5 border rounded-md ${busy[get('jira')!.id!] ? 'opacity-60' : 'hover:bg-gray-50'}`}>{busy[get('jira')!.id!] ? 'Syncing...' : 'Sync now'}</button>
            )}
            <Link href="/dashboard/projects" className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">{get('jira')? 'Manage' : 'Configure'}</Link>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Create issues directly from tasks.</p>
        {get('jira')?.userEmail && <p className="text-xs text-gray-500 mt-1">Connected as {get('jira')!.userEmail}</p>}
      </div>
      {/* Google */}
      <div className="p-4 rounded-xl border bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium">Google Workspace</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge ok={!!get('google')} />
            {get('google')?.id && (
              <button onClick={()=>syncNow(get('google')!.id)} className={`text-sm px-3 py-1.5 border rounded-md ${busy[get('google')!.id!] ? 'opacity-60' : 'hover:bg-gray-50'}`}>{busy[get('google')!.id!] ? 'Syncing...' : 'Sync now'}</button>
            )}
            <button onClick={()=>startAuth('google')} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">{get('google')? 'Manage' : 'Connect'}</button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Docs, Sheets, Calendar, Meets.</p>
        {get('google')?.userEmail && <p className="text-xs text-gray-500 mt-1">Connected as {get('google')!.userEmail}</p>}
      </div>
      {/* Microsoft Teams */}
      <div className="p-4 rounded-xl border bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium">Microsoft 365</h4>
          </div>
        <div className="flex items-center gap-2">
            <Badge ok={!!get('office365')} />
            {get('office365')?.id && (
              <button onClick={()=>syncNow(get('office365')!.id)} className={`text-sm px-3 py-1.5 border rounded-md ${busy[get('office365')!.id!] ? 'opacity-60' : 'hover:bg-gray-50'}`}>{busy[get('office365')!.id!] ? 'Syncing...' : 'Sync now'}</button>
            )}
            <button onClick={()=>startAuth('office365')} className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">{get('office365')? 'Manage' : 'Connect'}</button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Teams, Outlook, Calendar.</p>
        {get('office365')?.userEmail && <p className="text-xs text-gray-500 mt-1">Connected as {get('office365')!.userEmail}</p>}
      </div>
    </div>
  )
}


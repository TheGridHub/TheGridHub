"use client"

import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { useI18n } from '@/components/i18n/I18nProvider'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function SlackChannelPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useI18n()
  const [channels, setChannels] = useState<Array<{id: string, name: string}>>([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        // Check Slack connection first
        const statusRes = await fetch('/api/integrations/slack/status')
        const status = await statusRes.json().catch(()=> ({}))
        if (!mounted) return
        setConnected(!!status?.connected)
        if (status?.connected) {
          const res = await fetch('/api/integrations/slack/channels')
          const data = await res.json()
          if (mounted) setChannels(data.channels || [])
        }
      } catch {}
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])
  const disabled = loading || connected === false
  return (
    <select className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      <option value="">{connected === false ? 'Connect Slack in Settings' : (t('projects.selectChannel') || 'Select a channel')}</option>
      {channels.map((c) => (
        <option key={c.id} value={c.id}>#{c.name}</option>
      ))}
    </select>
  )
}

function JiraProjectKeyInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const { t } = useI18n()
  const [key, setKey] = useState(value)
  useEffect(() => setKey(value), [value])
  return (
    <div className="flex items-center gap-2">
      <input className="flex-1 px-3 py-2 rounded-md bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="e.g. TGH" value={key} onChange={(e) => setKey(e.target.value.toUpperCase())} />
      <button onClick={() => onSave(key)} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">{t('common.save') || 'Save'}</button>
    </div>
  )
}

export default function ProjectsPage() {
  const { data: projects, mutate, isLoading } = useSWR('/api/projects', fetcher)
  const { t } = useI18n()
  const [form, setForm] = useState({ name: '', description: '', color: '#7c3aed' })

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ name: '', description: '', color: '#7c3aed' })
    mutate()
  }

  const deleteProject = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="bg-white shadow-sm border-b mb-6">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">{t('projects.title') || 'Projects'}</h1>
              <button onClick={() => mutate()} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> {t('common.refresh')}
              </button>
            </div>
          </div>
        </header>

        <form onSubmit={createProject} className="grid md:grid-cols-4 gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <input className="px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder={t('projects.namePlaceholder') || 'Project name'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 md:col-span-2" placeholder={t('common.description') || 'Description'} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> {t('common.create') || 'Create'}</button>
        </form>

        {isLoading ? (
          <div className="text-center text-gray-600">{t('projects.loading') || 'Loading projects...'}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {(!projects || projects.length === 0) && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200 md:col-span-2">
                <p className="text-gray-600">{t('projects.empty') || 'No projects yet. Create one above.'}</p>
              </div>
            )}
            {projects?.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.description || (t('common.noDescription') || 'No description')}</div>
                  </div>
                  <button onClick={() => deleteProject(p.id)} className="p-2 hover:bg-red-50 rounded-lg border border-gray-200 text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>

                {/* Integration Settings per Project */}
                <div className="grid md:grid-cols-2 gap-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="space-y-2">
                    <div className="text-sm text-purple-700 font-medium">{t('projects.slackDefaultChannel') || 'Slack Default Channel'}</div>
                    <SlackChannelPicker
                      value={p.slackDefaultChannelId || ''}
                      onChange={async (channelId) => {
                        await fetch(`/api/projects/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slackDefaultChannelId: channelId }) })
                        mutate()
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-purple-700 font-medium">{t('projects.jiraProjectKey') || 'Jira Project Key'}</div>
                    <JiraProjectKeyInput
                      value={p.jiraProjectKey || ''}
                      onSave={async (key: string) => {
                        await fetch(`/api/projects/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jiraProjectKey: key }) })
                        mutate()
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


"use client"

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SubscriptionGate } from '@/components/dashboard'

export type Project = { id: string, name: string }

export default function CreateTaskDrawer({
  open,
  onClose,
  userId,
  projects,
  plan,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  userId: string
  projects: Project[]
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE' | null
  onCreated: (task: any) => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW'|'MEDIUM'|'HIGH'>('MEDIUM')
  const [projectId, setProjectId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!open) {
      setTitle(''); setDescription(''); setPriority('MEDIUM'); setProjectId(''); setDueDate('');
      setPrompt(''); setSuggestions([]); setSaving(false); setLoadingAI(false)
    }
  }, [open])

  const create = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const id = (globalThis.crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const payload: any = {
        id,
        userId,
        title: title.trim(),
        description: description.trim() || null,
        status: 'UPCOMING',
        priority,
        progress: 0,
        projectId: projectId || null,
      }
      if (dueDate) payload.dueDate = new Date(dueDate).toISOString()
      const { data, error } = await supabase.from('tasks').insert(payload).select('*').single()
      if (!error && data) {
        onCreated({
          id: data.id,
          title: data.title,
          project: (projects.find(p => p.id === data.projectId)?.name) || '',
          priority: (data.priority || 'MEDIUM').toLowerCase(),
          status: (data.status || 'UPCOMING').toLowerCase().replace('_','-'),
          progress: data.progress || 0,
          dueDate: data.dueDate ? new Date(data.dueDate).toDateString() : '',
        })
        onClose()
      }
    } finally {
      setSaving(false)
    }
  }

  const askAI = async () => {
    if (!prompt.trim()) return
    setLoadingAI(true)
    try {
      const res = await fetch('/api/ai/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, prompt }) })
      const json = await res.json().catch(()=>({ suggestions: [] }))
      setSuggestions(json.suggestions || [])
      setSelected({})
      // Try to apply the first suggestion
      if (json.suggestions && json.suggestions.length > 0) {
        const s = json.suggestions[0]
        if (s.title && !title) setTitle(s.title)
        if (s.description && !description) setDescription(s.description)
      }
    } finally {
      setLoadingAI(false)
    }
  }

  const toggle = (key: string) => setSelected(prev => ({ ...prev, [key]: !prev[key] }))

  const createSelected = async () => {
    const subtasks: string[] = []
    suggestions.forEach((s, si) => {
      (s.subtasks || []).forEach((st: string, ti: number) => {
        const key = `${si}:${ti}`
        if (selected[key]) subtasks.push(st)
      })
    })
    if (subtasks.length === 0) return
    setSaving(true)
    try {
      const rows = subtasks.map(st => {
        const id = (globalThis.crypto as any)?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const payload: any = {
          id,
          userId,
          title: st,
          description: (description || null),
          status: 'UPCOMING',
          priority,
          progress: 0,
          projectId: projectId || null,
        }
        if (dueDate) payload.dueDate = new Date(dueDate).toISOString()
        return payload
      })
      const { data, error } = await supabase.from('tasks').insert(rows).select('*')
      if (!error && Array.isArray(data)) {
        data.forEach((d: any) => {
          onCreated({
            id: d.id,
            title: d.title,
            project: (projects.find(p => p.id === d.projectId)?.name) || '',
            priority: (d.priority || 'MEDIUM').toLowerCase(),
            status: (d.status || 'UPCOMING').toLowerCase().replace('_','-'),
            progress: d.progress || 0,
            dueDate: d.dueDate ? new Date(d.dueDate).toDateString() : '',
          })
        })
        onClose()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      {/* Drawer */}
      <div className={`absolute top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Create Task</h3>
          <p className="text-sm text-gray-600">Add a new task to your workspace</p>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-64px-72px)]">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title *</label>
            <input className="w-full border rounded-md px-3 py-2" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Enter task title" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea className="w-full border rounded-md px-3 py-2" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Enter task description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Priority</label>
              <select className="w-full border rounded-md px-3 py-2" value={priority} onChange={(e)=>setPriority(e.target.value as any)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Project</label>
              <select className="w-full border rounded-md px-3 py-2" value={projectId} onChange={(e)=>setProjectId(e.target.value)}>
                <option value="">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Due date</label>
            <input type="date" className="w-full border rounded-md px-3 py-2" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
          </div>

          {/* AI Suggestions */}
          <SubscriptionGate plan={plan}>
            <div className="mt-2 p-3 border rounded-lg">
              <div className="text-sm font-medium mb-2">AI Suggestions</div>
              <div className="flex gap-2">
                <input className="flex-1 border rounded-md px-3 py-2" placeholder="Ask AI: e.g. ‘Plan my week’" value={prompt} onChange={(e)=>setPrompt(e.target.value)} />
                <button onClick={askAI} className="px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">{loadingAI ? '...' : 'Generate'}</button>
              </div>
              {!!suggestions.length && (
                <div className="mt-3 space-y-3 max-h-44 overflow-y-auto">
                  {suggestions.map((s, si) => (
                    <div key={si} className="p-2 bg-gray-50 border rounded">
                      <div className="text-xs font-medium">{s.title}</div>
                      {s.description && <div className="text-xs text-gray-600">{s.description}</div>}
                      {Array.isArray(s.subtasks) && s.subtasks.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {s.subtasks.map((st: string, ti: number) => {
                            const key = `${si}:${ti}`
                            return (
                              <label key={key} className="flex items-center gap-2 text-xs text-gray-700">
                                <input type="checkbox" checked={!!selected[key]} onChange={()=>toggle(key)} />
                                <span>{st}</span>
                              </label>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <button onClick={createSelected} className="mt-2 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700">Create selected subtasks</button>
                  </div>
                </div>
              )}
            </div>
          </SubscriptionGate>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
          <button onClick={create} disabled={!title.trim() || saving} className={`px-4 py-2 rounded-md text-white ${(!title.trim() || saving) ? 'bg-gray-300' : 'bg-purple-600 hover:bg-purple-700'}`}>{saving ? 'Saving...' : 'Create'}</button>
        </div>
      </div>
    </div>
  )
}


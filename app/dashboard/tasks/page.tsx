"use client"

import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { generateTaskSuggestions } from '@/lib/ai'

interface Task { id: string; title: string; description?: string; priority?: string; progress?: number; dueDate?: string | null }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [suggesting, setSuggesting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (e:any) {
      setError(e?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const create = async () => {
    if (!title.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
      const data = await res.json()
      if (res.ok && data.task) {
        setTasks([data.task, ...tasks])
        setTitle('')
      } else {
        setError(data.error || 'Failed to create task')
      }
    } catch (e:any) {
      setError(e?.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const remove = async (id: string) => {
    const prev = tasks
    setTasks(tasks.filter(t => t.id !== id))
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) setTasks(prev)
  }

  const suggest = async () => {
    setSuggesting(true)
    setError(null)
    try {
      // plan gate
      const chk = await fetch('/api/subscription/check-limit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'use_ai' }) })
      const ok = await chk.json()
      if (!ok.allowed) {
        setError(ok.reason || 'AI suggestions not allowed')
        setSuggesting(false)
        return
      }

      const gen = await generateTaskSuggestions('General productivity improvements', tasks.map(t => t.title))
      setSuggestions(gen || [])

      // track usage (1 per generation request)
      await fetch('/api/ai/usage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: 1 }) })
    } catch (e:any) {
      setError(e?.message || 'Failed to generate suggestions')
    } finally {
      setSuggesting(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Tasks</h1>

      <div className="flex gap-2 mb-4">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" className="flex-1 border border-gray-300 rounded-md px-3 py-2" />
        <button onClick={create} disabled={creating || !title.trim()} className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50">{creating ? 'Adding…' : 'Add'}</button>
      </div>
      {error && (
        <div className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 flex items-center justify-between">
          <span>{error}</span>
          {error?.toLowerCase().includes('upgrade') && (
            <button
              onClick={async()=>{ const r=await fetch('/api/stripe/create-checkout-session',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ interval:'monthly' })}); const j=await r.json(); if (j.url) window.location.href=j.url; }}
              className="px-3 py-1.5 rounded bg-black text-white hover:bg-black/90"
            >Upgrade to Pro</button>
          )}
        </div>
      )}

      <div className="mb-4">
        <button onClick={suggest} disabled={suggesting} className="px-3 py-2 rounded-md bg-purple-600 text-white disabled:opacity-50">
          {suggesting ? 'Generating…' : 'Suggest 5 Tasks (AI)'}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">AI Suggestions</h2>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start justify-between border rounded-md px-3 py-2">
                <div>
                  <div className="font-medium">{s.title || 'AI Task'}</div>
                  {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
                </div>
                <button onClick={async () => {
                  const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: s.title, description: s.description }) })
                  const data = await res.json()
                  if (data.task) setTasks([data.task, ...tasks])
                }} className="text-sm text-emerald-600 hover:underline">Add</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-2">
          {tasks.length === 0 && <div className="text-gray-600">No tasks yet.</div>}
          {tasks.map(t => (
            <div key={t.id} className="flex items-center justify-between border rounded-md px-3 py-2">
              <div>
                <div className="font-medium">{t.title}</div>
                {t.description && <div className="text-sm text-gray-600">{t.description}</div>}
              </div>
              <button onClick={() => remove(t.id)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          ))}
        </div>
      )}
      <Script src="https://js.puter.com/v2/puter.js" strategy="afterInteractive" />
    </div>
  )
}

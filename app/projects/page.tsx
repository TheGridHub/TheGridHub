"use client"

import useSWR from 'swr'
import { useState } from 'react'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProjectsPage() {
  const { data: projects, mutate, isLoading } = useSWR('/api/projects', fetcher)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-purple-900/30 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6 backdrop-blur bg-white/5 px-4 py-3 rounded-xl border border-white/10">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <button onClick={() => mutate()} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <form onSubmit={createProject} className="grid md:grid-cols-4 gap-3 bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
          <input className="px-3 py-2 rounded-lg bg-white/10 border border-white/10" placeholder="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Create</button>
        </form>

        {isLoading ? (
          <div className="text-center text-purple-200">Loading projects...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {(!projects || projects.length === 0) && (
              <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10 md:col-span-2">
                <p className="text-purple-200">No projects yet. Create one above.</p>
              </div>
            )}
            {projects?.map((p: any) => (
              <div key={p.id} className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-purple-200">{p.description || 'No description'}</div>
                  </div>
                  <button onClick={() => deleteProject(p.id)} className="p-2 hover:bg-white/10 rounded-lg border border-white/10 text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProfileSettingsPage() {
  const { data, mutate } = useSWR('/api/profile', fetcher)
  const [form, setForm] = useState({ name: '', email: '', avatar: '' })

  useEffect(() => {
    if (data) setForm({ name: data?.name || '', email: data?.email || '', avatar: data?.avatar || '' })
  }, [data])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    mutate()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-purple-900/30 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Profile Settings</h1>
        <form onSubmit={save} className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
          <div>
            <label className="block text-sm text-purple-200 mb-1">Name</label>
            <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10" />
          </div>
          <div>
            <label className="block text-sm text-purple-200 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10" />
          </div>
          <div>
            <label className="block text-sm text-purple-200 mb-1">Avatar URL</label>
            <input value={form.avatar} onChange={(e)=>setForm({...form, avatar:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10" />
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg">Save Changes</button>
        </form>
      </div>
    </div>
  )
}


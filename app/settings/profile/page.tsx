'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <header className="bg-white shadow-sm border-b mb-6">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          </div>
        </header>

        <form onSubmit={save} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <input value={form.avatar} onChange={(e)=>setForm({...form, avatar:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Save Changes</button>
        </form>
      </div>
    </div>
  )
}


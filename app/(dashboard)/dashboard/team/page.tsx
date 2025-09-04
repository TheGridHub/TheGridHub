"use client"

import useSWR from 'swr'
import { useState } from 'react'
import { UserPlus, RefreshCw, Trash2 } from 'lucide-react'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function TeamPage() {
  const { data: team, mutate } = useSWR('/api/team', fetcher)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
    setEmail('')
    mutate()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="bg-white shadow-sm border-b mb-6">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
              <button onClick={() => mutate()} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
        </header>

        <form onSubmit={addMember} className="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required placeholder="Invite by email" className="flex-1 px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"><UserPlus className="w-4 h-4" /> Invite</button>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
          {(team || []).map((m:any) => (
            <div key={m.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-gray-900">{m.userId}</div>
                <div className="text-sm text-gray-600">{m.role}</div>
              </div>
              <button className="p-2 hover:bg-red-50 rounded-lg border border-gray-200 text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {(!team || team.length===0) && (
            <div className="text-center p-8 text-gray-600">No team members yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}


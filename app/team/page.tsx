"use client"

import useSWR from 'swr'
import { useState } from 'react'
import { UserPlus, RefreshCw, Trash2 } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-purple-900/30 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6 backdrop-blur bg-white/5 px-4 py-3 rounded-xl border border-white/10">
          <h1 className="text-2xl font-semibold">Team</h1>
          <button onClick={() => mutate()} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <form onSubmit={addMember} className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required placeholder="Invite by email" className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10" />
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="px-3 py-2 rounded-lg bg-white/10 border border-white/10">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center gap-2"><UserPlus className="w-4 h-4" /> Invite</button>
        </form>

        <div className="bg-white/5 rounded-xl border border-white/10 divide-y divide-white/10">
          {(team || []).map((m:any) => (
            <div key={m.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{m.userId}</div>
                <div className="text-sm text-purple-200">{m.role}</div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg border border-white/10 text-red-300"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {(!team || team.length===0) && (
            <div className="text-center p-8 text-purple-200">No team members yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}


"use client"

import useSWR from 'swr'
import { useEffect, useState } from 'react'
import { Users, UserPlus, RefreshCw, Trash2, Plus, FolderPlus } from 'lucide-react'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function SlackChannelPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [channels, setChannels] = useState<Array<{id: string, name: string}>>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/integrations/slack/channels')
        const data = await res.json()
        if (mounted) setChannels(data.channels || [])
      } catch {}
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])
  return (
    <select className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" value={value} onChange={(e) => onChange(e.target.value)} disabled={loading}>
      <option value="">Select a channel</option>
      {channels.map((c) => (
        <option key={c.id} value={c.id}>#{c.name}</option>
      ))}
    </select>
  )
}

function JiraProjectKeyInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [key, setKey] = useState(value)
  useEffect(() => setKey(value), [value])
  return (
    <div className="flex items-center gap-2">
      <input className="flex-1 px-3 py-2 rounded-md bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="e.g. TGH" value={key} onChange={(e) => setKey(e.target.value.toUpperCase())} />
      <button onClick={() => onSave(key)} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Save</button>
    </div>
  )
}

export default function WorkspacePage() {
  const [tab, setTab] = useState<'members' | 'projects'>('members')

  // Team state
  const { data: team, mutate: mutateTeam, isLoading: teamLoading } = useSWR('/api/team', fetcher)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')

  // Projects state
  const { data: projects, mutate: mutateProjects, isLoading: projectsLoading } = useSWR('/api/projects', fetcher)
  const [projectForm, setProjectForm] = useState({ name: '', description: '', color: '#7c3aed' })

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail, role: inviteRole }) })
    setInviteEmail('')
    setInviteRole('member')
    mutateTeam()
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(projectForm) })
    setProjectForm({ name: '', description: '', color: '#7c3aed' })
    mutateProjects()
  }

  const deleteProject = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    mutateProjects()
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient and blobs */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-50 via-white to-white" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-fuchsia-300/30 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 bg-clip-text text-transparent">Workspace</h1>
              <p className="text-gray-600">Manage your team, members, and projects in one place.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { mutateTeam(); mutateProjects(); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white/70 backdrop-blur hover:bg-white">
                <RefreshCw className="w-4 h-4 text-gray-600" /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex rounded-xl bg-white/60 backdrop-blur border border-purple-200 p-1 shadow-sm">
            <button onClick={() => setTab('members')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='members' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow' : 'text-gray-700 hover:bg-white'}`}>
              <Users className="w-4 h-4 inline mr-2" /> Members
            </button>
            <button onClick={() => setTab('projects')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='projects' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow' : 'text-gray-700 hover:bg-white'}`}>
              <FolderPlus className="w-4 h-4 inline mr-2" /> Projects
            </button>
          </div>
        </div>

        {/* Content cards */}
        {tab === 'members' ? (
          <div className="space-y-6">
            {/* Invite form */}
            <form onSubmit={inviteMember} className="grid md:grid-cols-4 gap-3 bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-purple-200 p-4">
              <input value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} type="email" required placeholder="Invite by email" className="px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 md:col-span-2" />
              <select value={inviteRole} onChange={(e)=>setInviteRole(e.target.value)} className="px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"><UserPlus className="w-4 h-4" /> Invite</button>
            </form>

            {/* Members list */}
            <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-purple-200">
              <div className="px-4 py-3 border-b border-purple-200/50 flex items-center justify-between">
                <div className="font-medium text-gray-900">Team Members</div>
                {teamLoading && <div className="text-sm text-gray-500">Loading...</div>}
              </div>
              <div className="divide-y divide-gray-100">
                {(team || []).map((m:any) => (
                  <div key={m.id} className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-medium text-gray-900">{m.userId}</div>
                      <div className="text-sm text-gray-600">{m.role}</div>
                    </div>
                    <button disabled title="Removal coming soon" className="p-2 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!team || team.length===0) && (
                  <div className="text-center p-10 text-gray-600">No team members yet.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Create project */}
            <form onSubmit={createProject} className="grid md:grid-cols-4 gap-3 bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-purple-200 p-4">
              <input className="px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="Project name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} required />
              <input className="px-3 py-2 rounded-lg bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 md:col-span-2" placeholder="Description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Create</button>
            </form>

            {/* Projects list */}
            <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-purple-200">
              <div className="px-4 py-3 border-b border-purple-200/50 flex items-center justify-between">
                <div className="font-medium text-gray-900">Projects</div>
                {projectsLoading && <div className="text-sm text-gray-500">Loading...</div>}
              </div>
              <div className="p-4 grid md:grid-cols-2 gap-4">
                {(!projects || projects.length === 0) && (
                  <div className="text-center py-16 bg-white/80 rounded-xl border border-purple-200 md:col-span-2">
                    <p className="text-gray-600">No projects yet. Create one above.</p>
                  </div>
                )}
                {projects?.map((p: any) => (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-sm text-gray-600">{p.description || 'No description'}</div>
                      </div>
                      <button onClick={() => deleteProject(p.id)} className="p-2 hover:bg-red-50 rounded-lg border border-gray-200 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    {/* Integration Settings per Project */}
                    <div className="grid md:grid-cols-2 gap-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="space-y-2">
                        <div className="text-sm text-purple-700 font-medium">Slack Default Channel</div>
                        <SlackChannelPicker
                          value={p.slackDefaultChannelId || ''}
                          onChange={async (channelId) => {
                            await fetch(`/api/projects/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slackDefaultChannelId: channelId }) })
                            mutateProjects()
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-purple-700 font-medium">Jira Project Key</div>
                        <JiraProjectKeyInput
                          value={p.jiraProjectKey || ''}
                          onSave={async (key: string) => {
                            await fetch(`/api/projects/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jiraProjectKey: key }) })
                            mutateProjects()
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


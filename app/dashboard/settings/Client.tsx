"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getProfileClient, setTeamNameClient, setPreferencesClient } from '@/lib/profile.client'

const presets = [
  'Personal',
  'Design Team',
  'Engineering',
  'Marketing',
  'Operations',
]

type Tab = 'profile' | 'workspace' | 'security'

export default function SettingsClient() {
  const supabase = useMemo(() => createClient(), [])
  const [tab, setTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile fields
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Workspace fields
  const [teamName, setTeamName] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [customName, setCustomName] = useState('')

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const md: any = user.user_metadata || {}
        setDisplayName(md.full_name || user.email?.split('@')[0] || '')
        setAvatarUrl(md.avatar_url || '')
      }
      const { profile } = await getProfileClient()
      if (profile) {
        setTeamName(profile.team_name ?? null)
      }
      setLoading(false)
    })()
  }, [supabase])

  async function saveProfile() {
    setSaving(true)
    try {
      await supabase.auth.updateUser({ data: { full_name: displayName, avatar_url: avatarUrl } })
      alert('Profile updated')
    } catch (e: any) {
      alert(e?.message || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  async function changePassword() {
    if (!newPassword || newPassword.length < 8) { alert('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      await supabase.auth.updateUser({ password: newPassword })
      setNewPassword('')
      alert('Password updated')
    } catch (e: any) {
      alert(e?.message || 'Failed to update password')
    } finally { setSaving(false) }
  }

  async function saveWorkspaceName() {
    const name = selectedPreset === 'Custom' ? customName.trim() : selectedPreset
    if (!name) { alert('Please select or enter a workspace name'); return }
    setSaving(true)
    try {
      await setTeamNameClient(name)
      setTeamName(name)
      alert('Workspace name saved')
    } catch (e: any) {
      alert(e?.message || 'Failed to save workspace name')
    } finally { setSaving(false) }
  }

  function renderTabs() {
    return (
      <div className="flex items-center gap-3 border-b pb-2 mb-4">
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'workspace', label: 'Workspace' },
          { id: 'security', label: 'Security' },
        ].map(t => (
          <button
            key={t.id}
            className={`px-3 py-1.5 rounded ${tab===t.id ? 'bg-black text-white' : 'bg-gray-100'}`}
            onClick={()=> setTab(t.id as Tab)}
          >{t.label}</button>
        ))}
      </div>
    )
  }

  function renderProfile() {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <div className="font-semibold">Basic Info</div>
          <label className="text-sm text-gray-600">Display Name</label>
          <input className="border rounded px-3 py-2 w-full" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
          <label className="text-sm text-gray-600">Avatar URL</label>
          <input className="border rounded px-3 py-2 w-full" value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} />
          <div className="text-right"><button className="px-3 py-2 rounded bg-black text-white" disabled={saving} onClick={saveProfile}>Save</button></div>
        </div>

        <div className="bg-white rounded-xl border p-4 space-y-3">
          <div className="font-semibold">Change Password</div>
          <label className="text-sm text-gray-600">New Password</label>
          <input type="password" className="border rounded px-3 py-2 w-full" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Minimum 8 characters" />
          <div className="text-right"><button className="px-3 py-2 rounded bg-black text-white" disabled={saving} onClick={changePassword}>Update Password</button></div>
        </div>
      </div>
    )
  }

  function renderWorkspace() {
    const showPrompt = !teamName
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <div className="font-semibold">Workspace</div>
          {showPrompt ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">Set your workspace name</div>
              <select className="border rounded px-3 py-2 w-full" value={selectedPreset} onChange={e=> setSelectedPreset(e.target.value)}>
                <option value="">Select a preset</option>
                {presets.map(p => <option key={p} value={p}>{p}</option>)}
                <option>Custom</option>
              </select>
              {selectedPreset === 'Custom' && (
                <input className="border rounded px-3 py-2 w-full" placeholder="Enter a custom name" value={customName} onChange={e=>setCustomName(e.target.value)} />
              )}
              <div className="text-right"><button className="px-3 py-2 rounded bg-black text-white" disabled={saving} onClick={saveWorkspaceName}>Save Workspace</button></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Workspace Name</div>
                <div className="text-lg font-semibold">{teamName}</div>
              </div>
              <button className="px-3 py-2 rounded bg-gray-100" onClick={()=> setTeamName(null)}>Change</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-4 space-y-3">
          <div className="font-semibold">Team Members</div>
          <div className="text-sm text-gray-600">Manage members and roles (coming soon)</div>
        </div>
      </div>
    )
  }

  function renderSecurity() {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <div className="font-semibold">Sessions</div>
          <div className="text-sm text-gray-600">Sign out other sessions (coming soon)</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Settings</h1>
      <p className="text-gray-600 mb-4">Manage your profile, workspace and security preferences.</p>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <>
          {renderTabs()}
          {tab === 'profile' && renderProfile()}
          {tab === 'workspace' && renderWorkspace()}
          {tab === 'security' && renderSecurity()}
        </>
      )}
    </div>
  )
}


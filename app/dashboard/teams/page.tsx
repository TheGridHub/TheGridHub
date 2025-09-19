"use client"

import React, { useEffect, useState } from 'react'
import {
  Users,
  Plus,
  Mail,
  MoreVertical,
  Shield,
  Crown,
  UserX,
  UserPlus,
  Search,
  ChevronDown,
  Check,
  X,
  AlertCircle,
  Loader2,
  Clock,
  Edit2,
  Trash2,
  Send,
} from 'lucide-react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useWorkspace } from '@/hooks/useWorkspace'
import { createClient } from '@/utils/supabase/client'

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  last_active: string | null
}

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'member'
  invited_by: string
  invited_at: string
  status: 'pending' | 'accepted' | 'expired'
}

const roleColors = {
  owner: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  member: 'bg-gray-100 text-gray-700 border-gray-200',
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: Users,
}

export default function TeamsPage() {
  const { profile, isFreePlan } = useUserProfile()
  const { workspace, updateWorkspaceName } = useWorkspace()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [editingTeamName, setEditingTeamName] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadTeamData()
  }, [])

  useEffect(() => {
    setTeamName(workspace?.name || 'Personal Workspace')
  }, [workspace])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // For now, create mock team members
      const mockMembers: TeamMember[] = [
        {
          id: user.id,
          email: profile?.email || user.email || '',
          full_name: profile?.full_name || 'You',
          avatar_url: profile?.avatar_url || null,
          role: 'owner',
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
        }
      ]

      // Add some example team members if not personal workspace
      if (workspace?.member_count && workspace.member_count > 1) {
        mockMembers.push(
          {
            id: '2',
            email: 'john.doe@example.com',
            full_name: 'John Doe',
            avatar_url: null,
            role: 'admin',
            joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            email: 'jane.smith@example.com',
            full_name: 'Jane Smith',
            avatar_url: null,
            role: 'member',
            joined_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            last_active: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          }
        )
      }

      setMembers(mockMembers)

      // Mock pending invitations
      const mockInvitations: Invitation[] = []
      if (workspace?.member_count && workspace.member_count > 1) {
        mockInvitations.push({
          id: '1',
          email: 'pending@example.com',
          role: 'member',
          invited_by: user.email || '',
          invited_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        })
      }
      setInvitations(mockInvitations)
    } catch (err) {
      setError('Failed to load team data')
      console.error('Error loading team:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (isFreePlan && members.length >= 10) {
      setError('Free plan is limited to 10 team members. Upgrade to Pro for unlimited members.')
      return
    }

    setInviting(true)
    setError(null)

    try {
      // Simulate sending invitation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newInvitation: Invitation = {
        id: String(Date.now()),
        email: inviteEmail,
        role: inviteRole,
        invited_by: profile?.email || '',
        invited_at: new Date().toISOString(),
        status: 'pending',
      }
      
      setInvitations([newInvitation, ...invitations])
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('member')
    } catch (err) {
      setError('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member from the team?')) {
      setMembers(members.filter(m => m.id !== memberId))
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    setInvitations(invitations.filter(i => i.id !== invitationId))
  }

  const handleSaveTeamName = async () => {
    if (teamName.trim() && teamName !== workspace?.name) {
      await updateWorkspaceName(teamName.trim())
    }
    setEditingTeamName(false)
  }

  const filteredMembers = members.filter(member =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return past.toLocaleDateString()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and collaborate effectively
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Team Name</h3>
            {!editingTeamName && (
              <button
                onClick={() => setEditingTeamName(true)}
                className="p-1 text-gray-400 hover:text-[#873bff] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {editingTeamName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTeamName()
                  if (e.key === 'Escape') {
                    setTeamName(workspace?.name || 'Personal Workspace')
                    setEditingTeamName(false)
                  }
                }}
                className="flex-1 px-3 py-1.5 text-sm border border-[#873bff] rounded focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                autoFocus
              />
              <button
                onClick={handleSaveTeamName}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setTeamName(workspace?.name || 'Personal Workspace')
                  setEditingTeamName(false)
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-lg font-medium text-gray-900">{workspace?.name || 'Personal Workspace'}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Total Members</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{members.length}</p>
            {isFreePlan && (
              <p className="text-sm text-gray-500">/ 10 limit</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Pending Invites</h3>
          <p className="text-3xl font-bold text-gray-900">{invitations.filter(i => i.status === 'pending').length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            {error.includes('Upgrade') && (
              <a href="/dashboard/billing" className="text-sm font-medium text-red-700 hover:text-red-900 underline mt-1 inline-block">
                View pricing plans →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-[#873bff] animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading team members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No team members found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMembers.map((member) => {
              const RoleIcon = roleIcons[member.role]
              return (
                <div key={member.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.full_name || ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#873bff] to-[#7a35e6] text-white font-semibold">
                            {(member.full_name || member.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {member.full_name || member.email.split('@')[0]}
                          </p>
                          {member.id === profile?.id && (
                            <span className="text-xs text-gray-500">(You)</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${roleColors[member.role]}`}>
                            <RoleIcon className="w-3 h-3" />
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Active {member.last_active ? formatRelativeTime(member.last_active) : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {member.role !== 'owner' && member.id !== profile?.id && (
                      <div className="relative">
                        <button
                          onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {selectedMember === member.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              Change Role
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <UserX className="w-4 h-4" />
                              Remove from Team
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Invitations</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{invitation.email}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${roleColors[invitation.role]}`}>
                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        Invited {formatRelativeTime(invitation.invited_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm text-[#873bff] hover:bg-[#873bff]/10 rounded transition-colors flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      Resend
                    </button>
                    <button
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite Team Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {isFreePlan && members.length >= 9 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    You're approaching the 10 member limit for free plans.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteEmail('')
                  setInviteRole('member')
                  setError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {inviting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

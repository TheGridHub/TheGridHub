"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  Bell,
  FileText,
  CheckSquare,
  Mail,
  Calendar,
  BarChart3,
  Users,
  Building2,
  Briefcase,
  Puzzle,
  Settings,
  CreditCard,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Search,
  Plus,
  Sparkles,
  Crown,
  Edit3,
  Check,
} from 'lucide-react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useWorkspace } from '@/hooks/useWorkspace'
import { createClient } from '@/utils/supabase/client'

const navigation = [
  { label: 'Overview', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'Analytics', href: '/dashboard/analytics', Icon: BarChart3 },
  { label: 'Projects', href: '/dashboard/projects', Icon: Briefcase },
  { label: 'Tasks', href: '/dashboard/tasks', Icon: CheckSquare },
  { label: 'Contacts', href: '/dashboard/contacts', Icon: Users },
  { label: 'Teams', href: '/dashboard/teams', Icon: Users },
  { label: 'Notes', href: '/dashboard/notes', Icon: FileText },
  { label: 'Emails', href: '/dashboard/emails', Icon: Mail },
  { label: 'Integrations', href: '/dashboard/integrations', Icon: Puzzle },
  { label: 'Notifications', href: '/dashboard/notifications', Icon: Bell },
  { label: 'Calendar', href: '/dashboard/calendars', Icon: Calendar },
  { label: 'Companies', href: '/dashboard/companies', Icon: Building2 },
  { label: 'Billing', href: '/dashboard/billing', Icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', Icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingWorkspace, setEditingWorkspace] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  const { profile, isLoading: profileLoading } = useUserProfile()
  const { workspace, updateWorkspaceName, isLoading: workspaceLoading } = useWorkspace()
  const supabase = createClient()

  useEffect(() => {
    if (editingWorkspace && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingWorkspace])

  useEffect(() => {
    setWorkspaceName(workspace?.name || 'Personal Workspace')
  }, [workspace])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSaveWorkspaceName = async () => {
    if (workspaceName.trim() && workspaceName !== workspace?.name) {
      await updateWorkspaceName(workspaceName.trim())
    }
    setEditingWorkspace(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveWorkspaceName()
    } else if (e.key === 'Escape') {
      setWorkspaceName(workspace?.name || 'Personal Workspace')
      setEditingWorkspace(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto flex flex-col`}>
          
          {/* Logo and workspace */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#873bff] to-[#7a35e6] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#873bff] to-[#7a35e6] bg-clip-text text-transparent">
                  TheGridHub
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workspace selector */}
            <div className="relative">
              {editingWorkspace ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveWorkspaceName}
                    className="flex-1 px-3 py-2 text-sm border border-[#873bff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                    placeholder="Workspace name"
                  />
                  <button
                    onClick={handleSaveWorkspaceName}
                    className="p-2 text-[#873bff] hover:bg-[#873bff]/10 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingWorkspace(true)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#873bff]/20 to-[#7a35e6]/20 rounded-md flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#873bff]">
                        {workspace?.name?.charAt(0)?.toUpperCase() || 'W'}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        {workspaceLoading ? 'Loading...' : (workspace?.name || 'Set workspace name')}
                      </div>
                      {profile && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {profile.plan_type === 'pro' ? (
                            <><Crown className="w-3 h-3 text-amber-500" /> Pro Plan</>
                          ) : (
                            <>Free Plan</>  
                          )}
                        </div>
                      )}
                    </div>
                  </span>
                  <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-[#873bff] transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map(({ label, href, Icon }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-[#873bff]/10 to-[#7a35e6]/10 text-[#873bff] border-l-2 border-[#873bff]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#873bff]' : ''}`} />
                    <span>{label}</span>
                    {label === 'Notifications' && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        3
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-100">
            {profile?.plan_type === 'free' && (
              <Link
                href="/dashboard/billing"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 mb-3 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Crown className="w-4 h-4" />
                <span className="font-medium">Upgrade to Pro</span>
              </Link>
            )}
            
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#873bff] to-[#7a35e6] text-white font-semibold">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {profileLoading ? 'Loading...' : (
                    profile?.first_name ? 
                      `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}` :
                      profile?.full_name || profile?.email?.split('@')[0] || 'User'
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {profile?.email || ''}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                {/* Search bar */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg w-96">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects, tasks, contacts..."
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400"
                  />
                  <kbd className="px-2 py-0.5 text-xs bg-white border border-gray-200 rounded">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* Quick add button */}
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                
                {/* Notifications */}
                <Link
                  href="/dashboard/notifications"
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Link>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#873bff] to-[#7a35e6] text-white text-sm font-semibold">
                          {profile?.first_name?.charAt(0)?.toUpperCase() || profile?.full_name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {profile?.first_name ? 
                            `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}` :
                            profile?.full_name || profile?.email?.split('@')[0] || 'User'
                          }
                        </div>
                        <div className="text-xs text-gray-500">{profile?.email}</div>
                      </div>
                      
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile Settings
                      </Link>
                      
                      <Link
                        href="/dashboard/billing"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <CreditCard className="w-4 h-4" />
                        Billing & Plans
                      </Link>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

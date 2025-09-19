"use client"

import React, { useEffect, useState } from 'react'
import {
  Briefcase,
  CheckSquare,
  Users,
  Bell,
  TrendingUp,
  Activity,
  HardDrive,
  Sparkles,
  Crown,
  ArrowUpRight,
  Calendar,
  Clock,
  FileText,
  Building2,
  Mail,
  ChevronRight,
  Zap,
  Shield,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useWorkspace } from '@/hooks/useWorkspace'
import { createClient } from '@/utils/supabase/client'
import { formatRelativeTime } from '@/lib/utils/format'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ElementType
  href?: string
  loading?: boolean
}

function StatCard({ title, value, change, icon: Icon, href, loading }: StatCardProps) {
  const content = (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 transition-all ${
      href ? 'hover:shadow-lg hover:border-[#873bff]/20 cursor-pointer' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
          {change && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-[#873bff]/10 to-[#7a35e6]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[#873bff]" />
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

interface QuickActionProps {
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
}

function QuickAction({ title, description, icon: Icon, href, color }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-[#873bff]/20 transition-all group"
    >
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 group-hover:text-[#873bff] transition-colors">
          {title}
        </p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#873bff] transition-colors" />
    </Link>
  )
}

export default function DashboardHome() {
  const { profile, isLoading: profileLoading, isFreePlan } = useUserProfile()
  const { workspace, isLoading: workspaceLoading } = useWorkspace()
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    notifications: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load stats in parallel
        const [projectsRes, tasksRes, notificationsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/tasks'),
          fetch('/api/notifications').catch(() => ({ json: async () => ({ notifications: [] }) }))
        ])

        const [projectsData, tasksData, notificationsData] = await Promise.all([
          projectsRes.json(),
          tasksRes.json(),
          notificationsRes.json()
        ])

        setStats({
          projects: projectsData.projects?.length || 0,
          tasks: tasksData.tasks?.length || 0,
          notifications: notificationsData.notifications?.filter((n: any) => !n.read)?.length || 0,
        })

        // Create recent activity from tasks and projects
        const activities = []
        if (projectsData.projects?.length) {
          activities.push(...projectsData.projects.slice(0, 2).map((p: any) => ({
            type: 'project',
            title: `Project: ${p.name}`,
            time: p.created_at,
            icon: Briefcase
          })))
        }
        if (tasksData.tasks?.length) {
          activities.push(...tasksData.tasks.slice(0, 3).map((t: any) => ({
            type: 'task',
            title: `Task: ${t.title}`,
            time: t.created_at,
            icon: CheckSquare
          })))
        }
        setRecentActivity(activities.slice(0, 5))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    const gb = mb / 1024
    return `${gb.toFixed(2)} GB`
  }

  const storagePercentage = profile ? (profile.storage_used / profile.storage_limit) * 100 : 0
  const aiRequestsPercentage = profile ? (profile.ai_requests_used / profile.ai_requests_limit) * 100 : 0

  const quickActions = [
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: Briefcase,
      href: '/dashboard/projects',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Add Task',
      description: 'Create a new task',
      icon: CheckSquare,
      href: '/dashboard/tasks',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Invite Team',
      description: 'Add team members',
      icon: Users,
      href: '/dashboard/teams',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'View Analytics',
      description: 'Check your stats',
      icon: Activity,
      href: '/dashboard/analytics',
      color: 'bg-orange-100 text-orange-600'
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profileLoading ? 'loading...' : (profile?.full_name || profile?.email?.split('@')[0] || 'there')}!
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Projects"
          value={stats.projects}
          icon={Briefcase}
          href="/dashboard/projects"
          loading={loading}
        />
        <StatCard
          title="Active Tasks"
          value={stats.tasks}
          icon={CheckSquare}
          href="/dashboard/tasks"
          loading={loading}
        />
        <StatCard
          title="Team Members"
          value={workspace?.member_count || 1}
          icon={Users}
          href="/dashboard/teams"
          loading={workspaceLoading}
        />
        <StatCard
          title="Notifications"
          value={stats.notifications}
          icon={Bell}
          href="/dashboard/notifications"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Usage Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#873bff]" />
            Usage Overview
          </h2>
          
          <div className="space-y-6">
            {/* AI Requests */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#873bff]" />
                  <span className="text-sm font-medium text-gray-700">AI Requests</span>
                </div>
                <span className="text-sm text-gray-600">
                  {profile?.ai_requests_used || 0} / {profile?.ai_requests_limit || 10}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#873bff] to-[#7a35e6] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(aiRequestsPercentage, 100)}%` }}
                />
              </div>
              {isFreePlan && aiRequestsPercentage > 80 && (
                <p className="text-xs text-amber-600 mt-1">Running low on AI requests</p>
              )}
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#873bff]" />
                  <span className="text-sm font-medium text-gray-700">Storage</span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatStorageSize(profile?.storage_used || 0)} / {formatStorageSize(profile?.storage_limit || 1073741824)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#873bff] to-[#7a35e6] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Plan Limits */}
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Projects</p>
                  <p className="text-sm font-medium text-gray-900">
                    {stats.projects} / {isFreePlan ? '5' : 'Unlimited'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Team Members</p>
                  <p className="text-sm font-medium text-gray-900">
                    {workspace?.member_count || 1} / {isFreePlan ? '10' : 'Unlimited'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Banner for Free Users */}
          {isFreePlan && (
            <div className="mt-6 p-4 bg-gradient-to-r from-[#873bff]/10 to-[#7a35e6]/10 rounded-lg border border-[#873bff]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-[#873bff]" />
                  <div>
                    <p className="font-medium text-gray-900">Unlock Premium Features</p>
                    <p className="text-sm text-gray-600">Get unlimited projects, AI requests, and more</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Upgrade Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#873bff]" />
            Recent Activity
          </h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <activity.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(activity.time) || 'Recently'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No recent activity</p>
              <p className="text-xs text-gray-400 mt-1">Start by creating a project or task</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <QuickAction key={action.title} {...action} />
          ))}
        </div>
      </div>

      {/* Pro Features Showcase for Free Users */}
      {isFreePlan && (
        <div className="bg-gradient-to-br from-[#873bff]/5 to-[#7a35e6]/5 rounded-xl border border-[#873bff]/10 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Zap className="w-6 h-6 text-[#873bff]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Supercharge Your Workflow with Pro</h3>
              <p className="text-gray-600">Unlock powerful features to boost your team's productivity</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#873bff]/10 rounded">
                <Sparkles className="w-4 h-4 text-[#873bff]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Unlimited AI Requests</p>
                <p className="text-xs text-gray-600 mt-0.5">No daily limits on AI assistance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#873bff]/10 rounded">
                <HardDrive className="w-4 h-4 text-[#873bff]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">100GB Storage</p>
                <p className="text-xs text-gray-600 mt-0.5">100x more space for files</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#873bff]/10 rounded">
                <Shield className="w-4 h-4 text-[#873bff]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Priority Support</p>
                <p className="text-xs text-gray-600 mt-0.5">Get help when you need it</p>
              </div>
            </div>
          </div>
          
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Crown className="w-4 h-4" />
            View Pricing Plans
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

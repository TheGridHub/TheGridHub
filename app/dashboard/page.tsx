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
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useDashboardData, useDashboardSubscriptions } from '@/hooks/useDashboardData'
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
  const { 
    dashboardData, 
    usageStats, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    getDisplayName,
    getWorkspaceName,
    hasAnyData,
    getEmptyState 
  } = useDashboardData()
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  // Subscribe to real-time updates
  useDashboardSubscriptions()

  // Load recent activity when dashboard data is available
  useEffect(() => {
    const loadRecentActivity = async () => {
      if (!dashboardData?.user_id) return
      
      try {
        setLoading(true)
        
        // Load recent activity from projects and tasks
        const [projectsRes, tasksRes] = await Promise.all([
          fetch('/api/projects').catch(() => ({ json: async () => ({ projects: [] }) })),
          fetch('/api/tasks').catch(() => ({ json: async () => ({ tasks: [] }) }))
        ])

        const [projectsData, tasksData] = await Promise.all([
          projectsRes.json(),
          tasksRes.json()
        ])

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
        console.error('Error loading recent activity:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecentActivity()
  }, [dashboardData?.user_id])

  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    const gb = mb / 1024
    return `${gb.toFixed(2)} GB`
  }

  // Calculate real usage percentages
  const storagePercentage = usageStats ? (usageStats.storage_used / (1024 * 1024 * 1024)) * 100 : 0 // Convert to GB
  const aiRequestsPercentage = usageStats && dashboardData ? 
    (usageStats.ai_requests_count / (isFreePlan ? 10 : 1000)) * 100 : 0

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

  // Show error state
  if (dashboardError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-lg font-medium text-red-900 mb-2">Failed to load dashboard</h2>
          <p className="text-red-700 mb-4">We couldn't load your dashboard data. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // Show empty state for new users
  if (dashboardData && !dashboardLoading && !hasAnyData()) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section for New Users */}
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-[#873bff] to-[#7a35e6] rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to TheGridHub, {getDisplayName()}!
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            You're all set up! Let's help you get started by creating your first project, task, or adding a contact.
          </p>
          
          {/* Quick Start Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {quickActions.slice(0, 3).map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#873bff] hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mx-auto mb-4`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#873bff]">
                  {action.title}
                </h3>
                <p className="text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
          
          {/* Features Preview */}
          <div className="mt-12 p-8 bg-gray-50 rounded-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What you can do with TheGridHub</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckSquare className="w-4 h-4 text-green-600" />
                Manage tasks and projects
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4 text-blue-600" />
                Collaborate with your team
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI-powered assistance
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Activity className="w-4 h-4 text-orange-600" />
                Track progress and analytics
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {dashboardLoading ? 'loading...' : getDisplayName()}!
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Projects"
          value={usageStats?.projects_count || 0}
          icon={Briefcase}
          href="/dashboard/projects"
          loading={dashboardLoading}
        />
        <StatCard
          title="Active Tasks"
          value={usageStats?.tasks_count || 0}
          icon={CheckSquare}
          href="/dashboard/tasks"
          loading={dashboardLoading}
        />
        <StatCard
          title="Contacts"
          value={usageStats?.contacts_count || 0}
          icon={Users}
          href="/dashboard/contacts"
          loading={dashboardLoading}
        />
        <StatCard
          title="AI Requests"
          value={usageStats?.ai_requests_count || 0}
          icon={Sparkles}
          href="/dashboard/tasks"
          loading={dashboardLoading}
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
                  {usageStats?.ai_requests_count || 0} / {isFreePlan ? 'Unlimited' : 'Unlimited'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-green-600 mt-1">✨ Unlimited AI requests for all users!</p>
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#873bff]" />
                  <span className="text-sm font-medium text-gray-700">Storage</span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatStorageSize(usageStats?.storage_used || 0)} / {formatStorageSize(isFreePlan ? 1073741824 : 107374182400)}
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
                    {usageStats?.projects_count || 0} / {isFreePlan ? '5' : 'Unlimited'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contacts</p>
                  <p className="text-sm font-medium text-gray-900">
                    {usageStats?.contacts_count || 0} / {isFreePlan ? '100' : 'Unlimited'}
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
                <Briefcase className="w-4 h-4 text-[#873bff]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Unlimited Projects</p>
                <p className="text-xs text-gray-600 mt-0.5">Create as many projects as you need</p>
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

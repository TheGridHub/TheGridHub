'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  CheckSquare, 
  BarChart3, 
  Users, 
  Target, 
  Settings,
  ChevronDown,
  Plus,
  Briefcase,
  Contacts,
  Calendar,
  Mail,
  Building2,
  CreditCard,
  Search,
  Crown,
  Bot
} from 'lucide-react'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useProjects } from '@/hooks/useProjects'
import { useUserProfile } from '@/hooks/useUserProfile'
import { ProfileSkeleton, NavigationSkeleton } from '@/components/ui/SkeletonLoaders'

export default function Sidebar() {
  const { profile, isFreePlan } = useUserProfile()
  const { dashboardData, usageStats, getDisplayName, getWorkspaceName } = useDashboardData()
  const { projects, isLoading: projectsLoading } = useProjects()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      href: '/dashboard',
      count: null
    },
    { 
      icon: CheckSquare, 
      label: 'Tasks', 
      href: '/dashboard/tasks',
      count: usageStats?.tasks_count || null
    },
    { 
      icon: Briefcase, 
      label: 'Projects', 
      href: '/dashboard/projects',
      count: usageStats?.projects_count || null
    },
    { 
      icon: Contacts, 
      label: 'Contacts', 
      href: '/dashboard/contacts',
      count: usageStats?.contacts_count || null
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      href: '/dashboard/analytics',
      count: null
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      href: '/dashboard/calendars',
      count: null
    },
    { 
      icon: Mail, 
      label: 'Emails', 
      href: '/dashboard/emails',
      count: null
    },
    { 
      icon: Building2, 
      label: 'Companies', 
      href: '/dashboard/companies',
      count: null
    },
    { 
      icon: Users, 
      label: 'Teams', 
      href: '/dashboard/teams',
      count: null
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/dashboard/settings',
      count: null
    }
  ]

  const bottomMenuItems = [
    {
      icon: CreditCard,
      label: 'Billing',
      href: '/dashboard/billing'
    }
  ]

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) // Show only first 5

  const getProjectColor = (index: number) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-[#873bff] to-[#7a35e6] rounded-lg flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">TheGridHub</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 150)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#873bff] focus:border-[#873bff]"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">⌘F</span>
          </div>
        </div>
      </div>

      {/* Workspace Info */}
      <div className="px-6 pb-4">
        {dashboardData ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#873bff]/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-[#873bff] rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {getDisplayName()?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {getWorkspaceName()}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {getDisplayName()}
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        ) : (
          <ProfileSkeleton />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {usageStats ? (
          <>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#873bff]/10 text-[#873bff]'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href) ? 'text-[#873bff]' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.label}
                {item.count !== null && item.count > 0 && (
                  <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
            
            <div className="h-px bg-gray-200 my-4" />
            
            {bottomMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#873bff]/10 text-[#873bff]'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href) ? 'text-[#873bff]' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.label}
              </Link>
            ))}
          </>
        ) : (
          <NavigationSkeleton />
        )}
      </nav>

      {/* Projects */}
      <div className="px-3 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Projects
          </h3>
          <Link 
            href="/dashboard/projects"
            className="text-gray-400 hover:text-[#873bff] transition-colors"
            title="View all projects"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
        
        {projectsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-200 rounded-full" />
                <div className="h-3 bg-gray-200 rounded flex-1" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-1">
            {filteredProjects.map((project, index) => (
              <Link
                key={project.id}
                href={`/dashboard/projects`}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50 transition-colors"
                title={project.name}
              >
                <div className={`w-3 h-3 rounded-full mr-3 ${getProjectColor(index)}`} />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
            {projects.length > 5 && (
              <Link
                href="/dashboard/projects"
                className="group flex items-center px-3 py-2 text-xs text-gray-500 hover:text-[#873bff] transition-colors"
              >
                View all {projects.length} projects →
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500 mb-2">No projects yet</p>
            <Link
              href="/dashboard/projects"
              className="text-xs text-[#873bff] hover:underline"
            >
              Create your first project
            </Link>
          </div>
        )}
      </div>

      {/* Plan Banner */}
      <div className="px-3 pb-6">
        {isFreePlan ? (
          <div className="bg-gradient-to-r from-[#873bff] to-[#7a35e6] rounded-lg p-4 text-white">
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Free Plan
            </div>
            <div className="text-xs opacity-90 mb-3">
              Upgrade to Pro for unlimited projects and advanced features
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-3">
              <div 
                className="bg-white rounded-full h-2 transition-all" 
                style={{ 
                  width: `${Math.min(((usageStats?.projects_count || 0) / 5) * 100, 100)}%` 
                }}
              />
            </div>
            <Link
              href="/dashboard/billing"
              className="text-xs underline hover:no-underline flex items-center gap-1"
            >
              Upgrade to Pro →
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Pro Plan
            </div>
            <div className="text-xs opacity-90 mb-3">
              Enjoy unlimited access to all features
            </div>
            <Link
              href="/dashboard/billing"
              className="text-xs underline hover:no-underline flex items-center gap-1"
            >
              Manage subscription →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

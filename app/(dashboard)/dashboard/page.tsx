'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Calendar,
  TrendingUp,
  Plus,
  Bell,
  Search,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = [
    { name: 'Active Tasks', value: '12', icon: CheckSquare, change: '+4.75%', changeType: 'positive' },
    { name: 'Projects', value: '4', icon: LayoutDashboard, change: '+10.18%', changeType: 'positive' },
    { name: 'Team Members', value: '8', icon: Users, change: '0%', changeType: 'neutral' },
    { name: 'Completion Rate', value: '89%', icon: TrendingUp, change: '+2.36%', changeType: 'positive' },
  ]

  const recentTasks = [
    { id: 1, title: 'Update project documentation', project: 'Website Redesign', status: 'in-progress', priority: 'high' },
    { id: 2, title: 'Review pull requests', project: 'Mobile App', status: 'pending', priority: 'medium' },
    { id: 3, title: 'Client meeting preparation', project: 'Client Portal', status: 'completed', priority: 'high' },
    { id: 4, title: 'Deploy to staging environment', project: 'API Development', status: 'in-progress', priority: 'low' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.imageUrl || `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}&background=0D9488&color=fff`}
                  alt={user?.firstName || 'User'}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{user?.firstName || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting}, {user?.firstName || 'there'}!
          </h2>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    New Task
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-500">{task.project}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all tasks →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center">
                  <Plus className="h-5 w-5 mr-3" />
                  Create New Task
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                  <Calendar className="h-5 w-5 mr-3" />
                  Schedule Meeting
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                  <Users className="h-5 w-5 mr-3" />
                  Invite Team Member
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium mb-2">Upgrade to Pro</h3>
              <p className="text-sm mb-4 opacity-90">Get unlimited projects, advanced analytics, and priority support.</p>
              <Link href="/pricing" className="inline-flex items-center text-sm font-medium bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Upgrade Now
                <Plus className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

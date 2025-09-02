'use client'

import { Bell, Search, User, LogOut, AlertTriangle } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

interface AdminHeaderProps {
  stats?: {
    totalUsers: number
    activeUsers: number
    totalRevenue: number
    paidUsers: number
  }
}

export default function AdminHeader({ stats }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-semibold text-gray-900">Administrative Dashboard</h2>
          
          {/* Quick Stats */}
          {stats && (
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">{stats.totalUsers} Total Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{stats.activeUsers} Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">${stats.totalRevenue.toLocaleString()} Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">{stats.paidUsers} Paid Users</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, payments..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Alerts */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* System Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">All Systems Operational</span>
          </div>

          {/* Admin User */}
          <div className="flex items-center space-x-3">
            <UserButton afterSignOutUrl="/" />
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900">Admin User</div>
              <div className="text-xs text-gray-500">Super Administrator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Banner (show when there are critical issues) */}
      <div className="hidden mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">System Alert</p>
            <p className="text-xs text-red-600">High database load detected. Monitor system performance.</p>
          </div>
        </div>
      </div>
    </header>
  )
}
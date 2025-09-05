'use client'

import { 
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  BarChart3,
  Settings,
  Shield,
  Database,
  Globe,
  AlertTriangle
} from 'lucide-react'

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Statistics'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage all users'
    },
    {
      id: 'payments',
      label: 'Payment Management',
      icon: CreditCard,
      description: 'Subscriptions & Billing'
    },
    {
      id: 'system',
      label: 'System Health',
      icon: Activity,
      description: 'Database & Performance'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Usage & Insights'
    },
    {
      id: 'activity',
      label: 'Activity Logs',
      icon: Globe,
      description: 'Audit Trail'
    },
    {
      id: 'settings',
      label: 'Admin Settings',
      icon: Settings,
      description: 'Configuration'
    }
  ]

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200">
      {/* Admin Header */}
      <div className="p-6 border-b border-gray-200 bg-red-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
<h1 className="text-lg font-bold text-red-900">TheGridHub Admin</h1>
            <p className="text-sm text-red-700">Administrative Panel</p>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">System Operational</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className={`h-5 w-5 ${
              activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
            }`} />
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
            <Database className="h-4 w-4" />
            <span>Database Backup</span>
          </button>
          <button className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
            <Globe className="h-4 w-4" />
            <span>System Status</span>
          </button>
          <button className="w-full flex items-center space-x-2 p-2 text-sm text-orange-600 hover:bg-orange-50 rounded">
            <AlertTriangle className="h-4 w-4" />
            <span>Emergency Actions</span>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Version: 1.0.0</div>
          <div>Environment: Production</div>
          <div>Last Deploy: {new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  )
}

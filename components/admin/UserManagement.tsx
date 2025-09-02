'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Lock, 
  Unlock, 
  Mail, 
  Trash2,
  Eye,
  UserPlus,
  Crown,
  Ban,
  RefreshCw
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  subscription: 'personal' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'pending'
  lastActive: string
  createdAt: string
  tasksCount: number
  projectsCount: number
  totalRevenue: number
}

interface UserManagementProps {
  users: User[]
  onUserUpdate: (userId: string, updates: any) => void
}

export default function UserManagement({ users, onUserUpdate }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSubscription, setFilterSubscription] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  // Sample user data (in production, this comes from your database)
  const sampleUsers: User[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      subscription: 'pro',
      status: 'active',
      lastActive: '2 hours ago',
      createdAt: '2024-01-15',
      tasksCount: 45,
      projectsCount: 3,
      totalRevenue: 144
    },
    {
      id: '2',
      email: 'sarah.smith@company.com',
      name: 'Sarah Smith',
      subscription: 'enterprise',
      status: 'active',
      lastActive: '1 day ago',
      createdAt: '2023-12-08',
      tasksCount: 123,
      projectsCount: 8,
      totalRevenue: 600
    },
    {
      id: '3',
      email: 'mike.wilson@startup.co',
      name: 'Mike Wilson',
      subscription: 'personal',
      status: 'active',
      lastActive: '3 hours ago',
      createdAt: '2024-02-01',
      tasksCount: 12,
      projectsCount: 1,
      totalRevenue: 0
    },
    {
      id: '4',
      email: 'emma.davis@agency.com',
      name: 'Emma Davis',
      subscription: 'pro',
      status: 'suspended',
      lastActive: '1 week ago',
      createdAt: '2023-11-20',
      tasksCount: 67,
      projectsCount: 4,
      totalRevenue: 288
    }
  ]

  const displayUsers = users.length > 0 ? users : sampleUsers

  const filteredUsers = displayUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    const matchesSubscription = filterSubscription === 'all' || user.subscription === filterSubscription
    
    return matchesSearch && matchesStatus && matchesSubscription
  })

  const getSubscriptionBadge = (subscription: string) => {
    const badges = {
      personal: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    return badges[subscription as keyof typeof badges] || badges.personal
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const handleUserAction = async (userId: string, action: string) => {
    switch (action) {
      case 'suspend':
        onUserUpdate(userId, { status: 'suspended' })
        break
      case 'activate':
        onUserUpdate(userId, { status: 'active' })
        break
      case 'upgrade':
        // Handle subscription upgrade
        break
      case 'delete':
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          // Handle user deletion
        }
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage all users, subscriptions, and account settings</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Plans</option>
            <option value="personal">Personal</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{displayUsers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {displayUsers.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pro/Enterprise</p>
          <p className="text-2xl font-bold text-blue-600">
            {displayUsers.filter(u => u.subscription !== 'personal').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">
            ${displayUsers.reduce((sum, u) => sum + u.totalRevenue, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">Joined {user.createdAt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSubscriptionBadge(user.subscription)}`}>
                      {user.subscription === 'enterprise' && <Crown className="w-3 h-3 mr-1" />}
                      {user.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{user.tasksCount} tasks</div>
                    <div className="text-xs text-gray-500">{user.projectsCount} projects</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">${user.totalRevenue}</div>
                    <div className="text-xs text-gray-500">lifetime</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {/* Dropdown would go here */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Mail className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Send Bulk Email</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-5 w-5 text-green-600" />
            <span className="font-medium">Sync User Data</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Crown className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Bulk Upgrade</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Ban className="h-5 w-5 text-red-600" />
            <span className="font-medium">Bulk Suspend</span>
          </button>
        </div>
      </div>
    </div>
  )
}
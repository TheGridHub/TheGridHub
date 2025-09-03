'use client'

import { 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  UserPlus, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface AdminDashboardProps {
  data: any
}

export default function AdminDashboard({ data }: AdminDashboardProps) {
  // Mock chart data (in production, this would come from your analytics)
  const userGrowthData = [
    { name: 'Jan', users: 400, revenue: 2400 },
    { name: 'Feb', users: 600, revenue: 3600 },
    { name: 'Mar', users: 800, revenue: 4800 },
    { name: 'Apr', users: 1000, revenue: 6000 },
    { name: 'May', users: 1400, revenue: 8400 },
    { name: 'Jun', users: 1800, revenue: 10800 },
  ]

  const subscriptionData = [
    { name: 'Personal', value: 65, color: '#94a3b8' },
    { name: 'Pro', value: 25, color: '#3b82f6' },
    { name: 'Enterprise', value: 10, color: '#8b5cf6' },
  ]

  const recentActivity = [
    { id: 1, type: 'signup', user: 'john@example.com', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'payment', user: 'sarah@company.com', time: '5 minutes ago', status: 'success' },
    { id: 3, type: 'upgrade', user: 'team@startup.co', time: '12 minutes ago', status: 'success' },
    { id: 4, type: 'signup', user: 'dev@agency.com', time: '18 minutes ago', status: 'pending' },
    { id: 5, type: 'cancellation', user: 'user@domain.com', time: '25 minutes ago', status: 'warning' },
  ]

  const systemMetrics = [
    { label: 'API Response Time', value: '145ms', status: 'good', trend: '+5%' },
    { label: 'Database Queries', value: '2.4K/min', status: 'good', trend: '+12%' },
    { label: 'Active Sessions', value: '1,247', status: 'good', trend: '+8%' },
    { label: 'Error Rate', value: '0.02%', status: 'excellent', trend: '-15%' },
  ]

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats?.totalUsers || 0}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${(data.stats?.totalRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats?.activeUsers || 0}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <Activity className="h-3 w-3 mr-1" />
                +5% from yesterday
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Users</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats?.paidUsers || 0}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <CreditCard className="h-3 w-3 mr-1" />
                {((data.stats?.paidUsers / data.stats?.totalUsers) * 100 || 0).toFixed(1)}% conversion
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth & Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type === 'signup' && '👤 New user signup'}
                    {activity.type === 'payment' && '💳 Payment received'}
                    {activity.type === 'upgrade' && '⬆️ Plan upgrade'}
                    {activity.type === 'cancellation' && '❌ Subscription cancelled'}
                  </p>
                  <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                </div>
                {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {activity.status === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                {activity.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <div className="space-y-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                  <p className="text-lg font-semibold text-gray-700">{metric.value}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                    metric.status === 'good' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {metric.status}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metric.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Add New User</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CreditCard className="h-5 w-5 text-green-600" />
            <span className="font-medium">Process Refund</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Globe className="h-5 w-5 text-purple-600" />
            <span className="font-medium">System Maintenance</span>
          </button>
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium">Send Alert</span>
          </button>
        </div>
      </div>
    </div>
  )
}

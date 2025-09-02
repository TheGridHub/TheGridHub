'use client'

import { useState } from 'react'
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Globe,
  Smartphone,
  Monitor,
  Lock,
  Mail,
  CreditCard,
  FileText,
  Settings,
  Shield,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  MapPin,
  Wifi,
  Database
} from 'lucide-react'

interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  action: string
  category: 'authentication' | 'profile' | 'security' | 'data' | 'payment' | 'system'
  description: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  location?: {
    country: string
    region: string
    city: string
  }
  device: {
    type: 'desktop' | 'mobile' | 'tablet'
    os: string
    browser: string
  }
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'success' | 'failed' | 'warning' | 'info'
}

interface ActivityLogsProps {
  onExportLogs?: (filters: any) => void
  onViewDetails?: (logId: string) => void
}

export default function ActivityLogs({ onExportLogs, onViewDetails }: ActivityLogsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('24h')
  const [selectedUser, setSelectedUser] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Sample activity logs data
  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      userId: 'user_123',
      userEmail: 'john.doe@example.com',
      userName: 'John Doe',
      action: 'LOGIN_SUCCESS',
      category: 'authentication',
      description: 'User successfully logged in',
      details: {
        loginMethod: 'email_password',
        rememberMe: true,
        twoFactorUsed: false
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: {
        country: 'United States',
        region: 'California',
        city: 'San Francisco'
      },
      device: {
        type: 'desktop',
        os: 'Windows 10',
        browser: 'Chrome 120.0'
      },
      timestamp: '2024-01-20T10:30:00Z',
      severity: 'low',
      status: 'success'
    },
    {
      id: '2',
      userId: 'user_456',
      userEmail: 'sarah.smith@company.com',
      userName: 'Sarah Smith',
      action: 'PROFILE_UPDATE',
      category: 'profile',
      description: 'User updated profile information',
      details: {
        fieldsChanged: ['name', 'phone'],
        oldValues: { name: 'Sarah S.', phone: '+1234567890' },
        newValues: { name: 'Sarah Smith', phone: '+1987654321' }
      },
      ipAddress: '10.0.0.15',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: {
        country: 'United Kingdom',
        region: 'England',
        city: 'London'
      },
      device: {
        type: 'desktop',
        os: 'macOS',
        browser: 'Chrome 120.0'
      },
      timestamp: '2024-01-20T09:15:00Z',
      severity: 'low',
      status: 'success'
    },
    {
      id: '3',
      userId: 'user_789',
      userEmail: 'mike.wilson@startup.co',
      userName: 'Mike Wilson',
      action: 'LOGIN_FAILED',
      category: 'authentication',
      description: 'Failed login attempt - invalid password',
      details: {
        loginMethod: 'email_password',
        failureReason: 'invalid_password',
        attemptCount: 3
      },
      ipAddress: '203.0.113.0',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      location: {
        country: 'Canada',
        region: 'Ontario',
        city: 'Toronto'
      },
      device: {
        type: 'mobile',
        os: 'iOS 17',
        browser: 'Safari Mobile'
      },
      timestamp: '2024-01-20T08:45:00Z',
      severity: 'medium',
      status: 'failed'
    },
    {
      id: '4',
      userId: 'user_012',
      userEmail: 'admin@taskgrid.com',
      userName: 'Admin User',
      action: 'SYSTEM_CONFIG_CHANGE',
      category: 'system',
      description: 'System configuration updated',
      details: {
        setting: 'rate_limit',
        oldValue: 100,
        newValue: 150,
        reason: 'Increased load capacity'
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: {
        country: 'United States',
        region: 'New York',
        city: 'New York'
      },
      device: {
        type: 'desktop',
        os: 'Windows 11',
        browser: 'Edge 120.0'
      },
      timestamp: '2024-01-20T07:20:00Z',
      severity: 'high',
      status: 'success'
    },
    {
      id: '5',
      userId: 'user_345',
      userEmail: 'emma.davis@agency.com',
      userName: 'Emma Davis',
      action: 'PASSWORD_RESET',
      category: 'security',
      description: 'Password reset initiated',
      details: {
        resetMethod: 'email_link',
        expirationTime: '2024-01-20T08:20:00Z'
      },
      ipAddress: '172.16.254.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0)',
      location: {
        country: 'Australia',
        region: 'New South Wales',
        city: 'Sydney'
      },
      device: {
        type: 'desktop',
        os: 'Windows 10',
        browser: 'Firefox 120.0'
      },
      timestamp: '2024-01-20T07:20:00Z',
      severity: 'medium',
      status: 'success'
    },
    {
      id: '6',
      userId: 'user_678',
      userEmail: 'team@enterprise.com',
      userName: 'Team Lead',
      action: 'PAYMENT_PROCESSED',
      category: 'payment',
      description: 'Subscription payment processed successfully',
      details: {
        amount: 50.00,
        currency: 'USD',
        plan: 'enterprise',
        paymentMethod: 'credit_card',
        transactionId: 'txn_1234567890'
      },
      ipAddress: '198.51.100.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
      location: {
        country: 'Germany',
        region: 'Bavaria',
        city: 'Munich'
      },
      device: {
        type: 'desktop',
        os: 'macOS',
        browser: 'Safari 17.0'
      },
      timestamp: '2024-01-20T06:00:00Z',
      severity: 'low',
      status: 'success'
    }
  ])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <LogIn className="h-4 w-4" />
      case 'profile':
        return <User className="h-4 w-4" />
      case 'security':
        return <Shield className="h-4 w-4" />
      case 'data':
        return <Database className="h-4 w-4" />
      case 'payment':
        return <CreditCard className="h-4 w-4" />
      case 'system':
        return <Settings className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return badges[severity as keyof typeof badges] || badges.low
  }

  const getCategoryBadge = (category: string) => {
    const badges = {
      authentication: 'bg-blue-100 text-blue-800',
      profile: 'bg-green-100 text-green-800',
      security: 'bg-red-100 text-red-800',
      data: 'bg-purple-100 text-purple-800',
      payment: 'bg-indigo-100 text-indigo-800',
      system: 'bg-gray-100 text-gray-800'
    }
    return badges[category as keyof typeof badges] || badges.system
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus
    const matchesUser = selectedUser === '' || log.userId === selectedUser
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus && matchesUser
  })

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log)
    setShowDetails(true)
    onViewDetails?.(log.id)
  }

  const handleExportLogs = () => {
    const filters = {
      searchTerm,
      selectedCategory,
      selectedSeverity,
      selectedStatus,
      dateRange,
      selectedUser
    }
    onExportLogs?.(filters)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
            <p className="text-gray-600">Monitor user activities and system events</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Advanced Filters</span>
            </button>
            
            <button
              onClick={handleExportLogs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Logs</span>
            </button>
          </div>
        </div>

        {/* Search and Basic Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="profile">Profile</option>
            <option value="security">Security</option>
            <option value="data">Data</option>
            <option value="payment">Payment</option>
            <option value="system">System</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <input
                  type="text"
                  placeholder="Filter by user..."
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input
                  type="text"
                  placeholder="Filter by IP..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Actions</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredLogs.filter(log => log.status === 'failed').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredLogs.filter(log => log.severity === 'high' || log.severity === 'critical').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-green-600">
                {new Set(filteredLogs.map(log => log.userId)).size}
              </p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location & Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {log.userName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                        <div className="text-sm text-gray-500">{log.userEmail}</div>
                        <div className="text-xs text-gray-400 font-mono">{log.action}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getCategoryBadge(log.category)}`}>
                        {getCategoryIcon(log.category)}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(log.category)}`}>
                        {log.category}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <span className="text-sm text-gray-900 capitalize">{log.status}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityBadge(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1 mb-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{log.location?.city}, {log.location?.country}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getDeviceIcon(log.device.type)}
                        <span className="text-xs text-gray-500">{log.device.os} • {log.device.browser}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.ipAddress}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Activity Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.userName}</p>
                    <p className="text-xs text-gray-500">{selectedLog.userEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{selectedLog.action}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.description}</p>
                </div>
                
                {/* Technical Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP Address</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-sm font-mono text-gray-900 break-all">{selectedLog.userAgent}</p>
                </div>
                
                {/* Location & Device */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLog.location?.city}, {selectedLog.location?.region}, {selectedLog.location?.country}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLog.device.type} • {selectedLog.device.os} • {selectedLog.device.browser}
                    </p>
                  </div>
                </div>
                
                {/* Additional Details */}
                {Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Refresh Logs</span>
          </button>
          
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-5 w-5 text-green-600" />
            <span className="font-medium">Schedule Report</span>
          </button>
          
          <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Log Settings</span>
          </button>
          
          <button className="flex items-center space-x-2 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-600">Alert Rules</span>
          </button>
        </div>
      </div>
    </div>
  )
}

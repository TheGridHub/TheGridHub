'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  BellRing,
  Check,
  CheckCheck,
  X,
  Search,
  Filter,
  Settings,
  Trash2,
  Archive,
  MoreVertical,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Mail,
  Users,
  FileText,
  Briefcase,
  Star,
  MessageSquare,
  Clock,
  Volume2,
  VolumeX,
  Globe,
  Loader2,
  RotateCcw,
  Zap,
  User,
  Download
} from 'lucide-react'

// Types
interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  category: 'system' | 'tasks' | 'teams' | 'projects' | 'contacts' | 'billing' | 'security'
  read: boolean
  created_at: string
  action_url?: string
  action_label?: string
  metadata?: {
    user_name?: string
    project_name?: string
    task_title?: string
    [key: string]: any
  }
}

// Notification categories
const CATEGORIES = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'system', label: 'System', icon: Settings },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'contacts', label: 'Contacts', icon: User },
  { id: 'billing', label: 'Billing', icon: Zap },
  { id: 'security', label: 'Security', icon: AlertTriangle }
]

const NOTIFICATION_TYPES = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  system: { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
}

export default function NotificationsPage() {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(true)

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'New task assigned to you',
      message: 'John Smith assigned you the task "Update user interface design" in Project Alpha.',
      type: 'info',
      category: 'tasks',
      read: false,
      created_at: '2024-01-15T10:30:00Z',
      action_url: '/dashboard/tasks',
      action_label: 'View Task',
      metadata: {
        user_name: 'John Smith',
        task_title: 'Update user interface design',
        project_name: 'Project Alpha'
      }
    },
    {
      id: '2',
      title: 'Team invitation accepted',
      message: 'Sarah Johnson has accepted your invitation to join the Marketing Team.',
      type: 'success',
      category: 'teams',
      read: false,
      created_at: '2024-01-15T09:15:00Z',
      action_url: '/dashboard/teams',
      action_label: 'View Team',
      metadata: {
        user_name: 'Sarah Johnson',
        team_name: 'Marketing Team'
      }
    },
    {
      id: '3',
      title: 'Payment successful',
      message: 'Your Pro subscription has been renewed successfully for $29/month.',
      type: 'success',
      category: 'billing',
      read: true,
      created_at: '2024-01-14T16:45:00Z',
      action_url: '/dashboard/billing',
      action_label: 'View Invoice',
      metadata: {
        amount: '$29',
        plan: 'Pro'
      }
    },
    {
      id: '4',
      title: 'Project deadline approaching',
      message: 'Project "Website Redesign" is due in 2 days. 3 tasks are still incomplete.',
      type: 'warning',
      category: 'projects',
      read: false,
      created_at: '2024-01-14T14:20:00Z',
      action_url: '/dashboard/projects',
      action_label: 'View Project',
      metadata: {
        project_name: 'Website Redesign',
        days_remaining: 2,
        incomplete_tasks: 3
      }
    },
    {
      id: '5',
      title: 'Security alert',
      message: 'A new device signed in to your account from Chrome on Windows.',
      type: 'warning',
      category: 'security',
      read: true,
      created_at: '2024-01-14T11:30:00Z',
      action_url: '/dashboard/settings',
      action_label: 'Review Security',
      metadata: {
        device: 'Chrome on Windows',
        location: 'San Francisco, CA'
      }
    },
    {
      id: '6',
      title: 'Weekly report ready',
      message: 'Your team productivity report for the week of Jan 8-14 is now available.',
      type: 'info',
      category: 'system',
      read: true,
      created_at: '2024-01-14T08:00:00Z',
      action_url: '/dashboard/analytics',
      action_label: 'View Report',
      metadata: {
        report_type: 'Weekly Productivity',
        week: 'Jan 8-14'
      }
    },
    {
      id: '7',
      title: 'Storage limit reached',
      message: 'You\'ve used 95% of your storage space. Consider upgrading or cleaning up files.',
      type: 'error',
      category: 'system',
      read: false,
      created_at: '2024-01-13T20:15:00Z',
      action_url: '/dashboard/billing',
      action_label: 'Upgrade Plan',
      metadata: {
        usage_percent: 95,
        storage_limit: '5GB'
      }
    }
  ]

  // Load notifications
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNotifications(mockNotifications)
    } catch (error) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || notification.category === selectedCategory
    const matchesReadStatus = !showUnreadOnly || !notification.read

    return matchesSearch && matchesCategory && matchesReadStatus
  })

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length
  const unreadCountByCategory = (category: string) => {
    if (category === 'all') return unreadCount
    return notifications.filter(n => !n.read && n.category === category).length
  }

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Mark as read
  const markAsRead = async (ids: string[]) => {
    try {
      setNotifications(notifications.map(n => 
        ids.includes(n.id) ? { ...n, read: true } : n
      ))
    } catch (error) {
      setError('Failed to mark notifications as read')
    }
  }

  // Mark as unread
  const markAsUnread = async (ids: string[]) => {
    try {
      setNotifications(notifications.map(n => 
        ids.includes(n.id) ? { ...n, read: false } : n
      ))
    } catch (error) {
      setError('Failed to mark notifications as unread')
    }
  }

  // Delete notifications
  const deleteNotifications = async (ids: string[]) => {
    try {
      setNotifications(notifications.filter(n => !ids.includes(n.id)))
      setSelectedNotifications([])
    } catch (error) {
      setError('Failed to delete notifications')
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      setError('Failed to mark all as read')
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      setNotifications([])
    } catch (error) {
      setError('Failed to clear notifications')
    }
  }

  // Handle notification selection
  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      setPushEnabled(permission === 'granted')
    } catch (error) {
      console.error('Failed to request notification permission:', error)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BellRing className="w-8 h-8 text-[#873bff]" />
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-sm bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              Stay updated with your team activities and important events
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {CATEGORIES.map(category => {
                const Icon = category.icon
                const unreadForCategory = unreadCountByCategory(category.id)
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[#873bff]/10 text-[#873bff]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                    {unreadForCategory > 0 && (
                      <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {unreadForCategory}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    showUnreadOnly
                      ? 'bg-[#873bff]/10 text-[#873bff]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Unread Only
                </button>
                
                <button
                  onClick={clearAllNotifications}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="mt-4 flex items-center justify-between p-3 bg-[#873bff]/5 rounded-lg">
                <span className="text-sm text-[#873bff] font-medium">
                  {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAsRead(selectedNotifications)}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => markAsUnread(selectedNotifications)}
                    className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Mark Unread
                  </button>
                  <button
                    onClick={() => deleteNotifications(selectedNotifications)}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedNotifications([])}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Notifications */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || showUnreadOnly ? 'No notifications found' : 'All caught up!'}
              </h3>
              <p className="text-gray-500">
                {searchQuery || showUnreadOnly
                  ? 'Try adjusting your search or filters'
                  : 'You have no new notifications'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map(notification => {
                const typeConfig = NOTIFICATION_TYPES[notification.type]
                const TypeIcon = typeConfig.icon
                
                return (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl border p-6 transition-all hover:shadow-md ${
                      !notification.read 
                        ? 'border-l-4 border-l-[#873bff] bg-[#873bff]/2' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="mt-1 w-4 h-4 text-[#873bff] rounded border-gray-300 focus:ring-[#873bff]"
                      />
                      
                      {/* Type Icon */}
                      <div className={`p-2 rounded-full ${typeConfig.bg} ${typeConfig.border} border`}>
                        <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`font-semibold text-gray-900 ${!notification.read ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[#873bff] rounded-full" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3">
                          {notification.message}
                        </p>
                        
                        {/* Action Button */}
                        {notification.action_url && (
                          <div className="flex items-center gap-3">
                            <a
                              href={notification.action_url}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[#873bff] text-white rounded-lg hover:bg-[#7a35e6] transition-colors"
                            >
                              {notification.action_label || 'View'}
                            </a>
                            
                            {!notification.read ? (
                              <button
                                onClick={() => markAsRead([notification.id])}
                                className="text-sm text-gray-600 hover:text-gray-800"
                              >
                                Mark as read
                              </button>
                            ) : (
                              <button
                                onClick={() => markAsUnread([notification.id])}
                                className="text-sm text-gray-600 hover:text-gray-800"
                              >
                                Mark as unread
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Sound Notifications</p>
                  <p className="text-sm text-gray-600">Play sound for new notifications</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#873bff] focus:ring-offset-2 ${
                    soundEnabled ? 'bg-[#873bff]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Browser push notifications</p>
                </div>
                <button
                  onClick={requestNotificationPermission}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#873bff] focus:ring-offset-2 ${
                    pushEnabled ? 'bg-[#873bff]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Send notifications to your email</p>
                </div>
                <button
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#873bff] focus:ring-offset-2 ${
                    emailEnabled ? 'bg-[#873bff]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

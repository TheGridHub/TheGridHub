'use client'

import { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  User,
  Users,
  Shield,
  Bell,
  Key,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  Edit3,
  Camera,
  Mail,
  Phone,
  Globe,
  Building,
  MapPin,
  Calendar,
  Clock,
  Palette,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Copy,
  RefreshCw,
  Plus,
  X,
  Check,
  Crown,
  Loader2,
  AlertCircle,
  Lock,
  Unlock,
  FileText,
  HelpCircle,
  LogOut,
  Zap,
  Database,
  Code,
  ToggleLeft,
  ToggleRight,
  Volume2,
  VolumeX
} from 'lucide-react'

// Types
interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl: string
  phone?: string
  bio?: string
  company?: string
  location?: string
  website?: string
  timezone: string
  language: string
  theme: 'light' | 'dark' | 'system'
}

interface TeamSettings {
  id: string
  name: string
  description: string
  logoUrl?: string
  website?: string
  industry: string
  size: string
  timezone: string
  workingHours: {
    start: string
    end: string
    timezone: string
  }
  branding: {
    primaryColor: string
    secondaryColor: string
    logo?: string
  }
}

interface NotificationSettings {
  email: {
    tasks: boolean
    projects: boolean
    teams: boolean
    mentions: boolean
    reminders: boolean
    marketing: boolean
  }
  push: {
    tasks: boolean
    projects: boolean
    teams: boolean
    mentions: boolean
    reminders: boolean
  }
  desktop: {
    enabled: boolean
    sound: boolean
    volume: number
  }
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessions: Array<{
    id: string
    device: string
    location: string
    lastActive: Date
    current: boolean
  }>
  loginHistory: Array<{
    id: string
    timestamp: Date
    location: string
    device: string
    success: boolean
  }>
}

interface APIToken {
  id: string
  name: string
  token: string
  permissions: string[]
  lastUsed?: Date
  createdAt: Date
  expiresAt?: Date
}

type TabType = 'profile' | 'team' | 'notifications' | 'security' | 'api' | 'billing' | 'danger'

export default function SettingsClient() {
  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    email: 'john.doe@company.com',
    fullName: 'John Doe',
    avatarUrl: '',
    phone: '+1 (555) 123-4567',
    bio: 'Product Manager passionate about building great user experiences.',
    company: 'Acme Inc.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    timezone: 'America/Los_Angeles',
    language: 'en-US',
    theme: 'system'
  })

  // Team state
  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    id: '1',
    name: 'Acme Inc',
    description: 'Building the future of business management software',
    logoUrl: '',
    website: 'https://acme.com',
    industry: 'Technology',
    size: '11-50',
    timezone: 'America/Los_Angeles',
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/Los_Angeles'
    },
    branding: {
      primaryColor: '#873bff',
      secondaryColor: '#7a35e6'
    }
  })

  // Notification state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      tasks: true,
      projects: true,
      teams: true,
      mentions: true,
      reminders: true,
      marketing: false
    },
    push: {
      tasks: true,
      projects: false,
      teams: true,
      mentions: true,
      reminders: true
    },
    desktop: {
      enabled: true,
      sound: true,
      volume: 70
    },
    frequency: 'realtime'
  })

  // Security state
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessions: [
      {
        id: '1',
        device: 'Chrome on MacOS',
        location: 'San Francisco, CA',
        lastActive: new Date(),
        current: true
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'San Francisco, CA',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        current: false
      }
    ],
    loginHistory: [
      {
        id: '1',
        timestamp: new Date(),
        location: 'San Francisco, CA',
        device: 'Chrome on MacOS',
        success: true
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        location: 'San Francisco, CA',
        device: 'Safari on iPhone',
        success: true
      }
    ]
  })

  // API tokens state
  const [apiTokens, setApiTokens] = useState<APIToken[]>([
    {
      id: '1',
      name: 'Mobile App Integration',
      token: 'sk_test_123...xyz',
      permissions: ['read:projects', 'write:tasks'],
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    }
  ])

  const [showNewTokenModal, setShowNewTokenModal] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [newTokenPermissions, setNewTokenPermissions] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  // Load data
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Data already set in initial state
    } catch (error) {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  // Save functions
  const saveProfile = async () => {
    setSaving(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Profile updated successfully')
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const saveTeamSettings = async () => {
    setSaving(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Team settings updated successfully')
    } catch (error) {
      setError('Failed to update team settings')
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    setSaving(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Notification preferences updated successfully')
    } catch (error) {
      setError('Failed to update notifications')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Password updated successfully')
    } catch (error) {
      setError('Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const toggleTwoFactor = async () => {
    setSaving(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSecurity(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled
      }))
      setSuccess(`Two-factor authentication ${security.twoFactorEnabled ? 'disabled' : 'enabled'}`)
    } catch (error) {
      setError('Failed to update two-factor authentication')
    } finally {
      setSaving(false)
    }
  }

  const createAPIToken = async () => {
    if (!newTokenName.trim()) {
      setError('Token name is required')
      return
    }
    if (newTokenPermissions.length === 0) {
      setError('At least one permission is required')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newToken: APIToken = {
        id: Date.now().toString(),
        name: newTokenName,
        token: `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        permissions: [...newTokenPermissions],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
      setApiTokens(prev => [...prev, newToken])
      setShowNewTokenModal(false)
      setNewTokenName('')
      setNewTokenPermissions([])
      setSuccess('API token created successfully')
    } catch (error) {
      setError('Failed to create API token')
    } finally {
      setSaving(false)
    }
  }

  const revokeAPIToken = async (tokenId: string) => {
    setSaving(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setApiTokens(prev => prev.filter(token => token.id !== tokenId))
      setShowDeleteConfirm(null)
      setSuccess('API token revoked successfully')
    } catch (error) {
      setError('Failed to revoke API token')
    } finally {
      setSaving(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    setSaving(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setSecurity(prev => ({
        ...prev,
        sessions: prev.sessions.filter(session => session.id !== sessionId)
      }))
      setSuccess('Session terminated successfully')
    } catch (error) {
      setError('Failed to terminate session')
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setSaving(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        // In real app, this would redirect to a goodbye page
        alert('Account deletion initiated. You will receive an email confirmation.')
      } catch (error) {
        setError('Failed to delete account')
      } finally {
        setSaving(false)
      }
    }
  }

  const exportData = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Simulate file download
      const blob = new Blob([JSON.stringify({ profile, teamSettings, notifications }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'account-data.json'
      a.click()
      URL.revokeObjectURL(url)
      setSuccess('Data export completed successfully')
    } catch (error) {
      setError('Failed to export data')
    } finally {
      setSaving(false)
    }
  }

  // Helper functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API', icon: Code },
    { id: 'billing', label: 'Billing', icon: Crown },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-[#873bff]" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your account, team settings, and preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#873bff]/10 text-[#873bff] border-l-4 border-[#873bff]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#873bff]" />
              <span className="ml-3 text-gray-600">Loading settings...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
                  </div>

                  {/* Basic Information */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={profile.company || ''}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profile.location || ''}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={profile.website || ''}
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Profile
                      </button>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
                    
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-[#873bff] rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full border-2 border-gray-200 hover:border-gray-300">
                          <Camera className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avatar URL
                        </label>
                        <input
                          type="url"
                          value={profile.avatarUrl}
                          onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={profile.timezone}
                          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                        >
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={profile.language}
                          onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="en-GB">English (UK)</option>
                          <option value="es-ES">Spanish</option>
                          <option value="fr-FR">French</option>
                          <option value="de-DE">German</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={profile.theme}
                          onChange={(e) => setProfile({ ...profile, theme: e.target.value as 'light' | 'dark' | 'system' })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                        >
                          <option value="system">System</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Tab */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Settings</h2>
                  </div>

                  {/* Team Information */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Team Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team Name *
                        </label>
                        <input
                          type="text"
                          value={teamSettings.name}
                          onChange={(e) => setTeamSettings({ ...teamSettings, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={teamSettings.website || ''}
                          onChange={(e) => setTeamSettings({ ...teamSettings, website: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        <select
                          value={teamSettings.industry}
                          onChange={(e) => setTeamSettings({ ...teamSettings, industry: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                        >
                          <option value="Technology">Technology</option>
                          <option value="Finance">Finance</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Retail">Retail</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team Size
                        </label>
                        <select
                          value={teamSettings.size}
                          onChange={(e) => setTeamSettings({ ...teamSettings, size: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                        >
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={teamSettings.description}
                        onChange={(e) => setTeamSettings({ ...teamSettings, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                        placeholder="Describe your team and what you do..."
                      />
                    </div>
                  </div>

                  {/* Branding */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Team Branding</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={teamSettings.branding.primaryColor}
                            onChange={(e) => setTeamSettings({
                              ...teamSettings,
                              branding: { ...teamSettings.branding, primaryColor: e.target.value }
                            })}
                            className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={teamSettings.branding.primaryColor}
                            onChange={(e) => setTeamSettings({
                              ...teamSettings,
                              branding: { ...teamSettings.branding, primaryColor: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={teamSettings.branding.secondaryColor}
                            onChange={(e) => setTeamSettings({
                              ...teamSettings,
                              branding: { ...teamSettings.branding, secondaryColor: e.target.value }
                            })}
                            className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={teamSettings.branding.secondaryColor}
                            onChange={(e) => setTeamSettings({
                              ...teamSettings,
                              branding: { ...teamSettings.branding, secondaryColor: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={saveTeamSettings}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Team Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  </div>

                  {/* Email Notifications */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#873bff]" />
                      Email Notifications
                    </h3>
                    
                    <div className="space-y-4">
                      {Object.entries(notifications.email).map(([key, enabled]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Get notified about {key.toLowerCase()} via email
                            </p>
                          </div>
                          <button
                            onClick={() => setNotifications({
                              ...notifications,
                              email: { ...notifications.email, [key]: !enabled }
                            })}
                            className="relative inline-flex items-center"
                          >
                            {enabled ? (
                              <ToggleRight className="w-8 h-8 text-[#873bff]" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-gray-400" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-[#873bff]" />
                      Push Notifications
                    </h3>
                    
                    <div className="space-y-4">
                      {Object.entries(notifications.push).map(([key, enabled]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Get push notifications about {key.toLowerCase()}
                            </p>
                          </div>
                          <button
                            onClick={() => setNotifications({
                              ...notifications,
                              push: { ...notifications.push, [key]: !enabled }
                            })}
                            className="relative inline-flex items-center"
                          >
                            {enabled ? (
                              <ToggleRight className="w-8 h-8 text-[#873bff]" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-gray-400" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Notifications */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-[#873bff]" />
                      Desktop Notifications
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Enable Desktop Notifications</p>
                          <p className="text-sm text-gray-500">Show notifications on your desktop</p>
                        </div>
                        <button
                          onClick={() => setNotifications({
                            ...notifications,
                            desktop: { ...notifications.desktop, enabled: !notifications.desktop.enabled }
                          })}
                          className="relative inline-flex items-center"
                        >
                          {notifications.desktop.enabled ? (
                            <ToggleRight className="w-8 h-8 text-[#873bff]" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                          )}
                        </button>
                      </div>
                      
                      {notifications.desktop.enabled && (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Sound</p>
                              <p className="text-sm text-gray-500">Play sound with notifications</p>
                            </div>
                            <button
                              onClick={() => setNotifications({
                                ...notifications,
                                desktop: { ...notifications.desktop, sound: !notifications.desktop.sound }
                              })}
                              className="relative inline-flex items-center"
                            >
                              {notifications.desktop.sound ? (
                                <Volume2 className="w-6 h-6 text-[#873bff]" />
                              ) : (
                                <VolumeX className="w-6 h-6 text-gray-400" />
                              )}
                            </button>
                          </div>
                          
                          {notifications.desktop.sound && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Volume: {notifications.desktop.volume}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={notifications.desktop.volume}
                                onChange={(e) => setNotifications({
                                  ...notifications,
                                  desktop: { ...notifications.desktop, volume: parseInt(e.target.value) }
                                })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Notification Frequency */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Frequency</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { value: 'realtime', label: 'Real-time', description: 'Instant notifications' },
                        { value: 'hourly', label: 'Hourly', description: 'Batched every hour' },
                        { value: 'daily', label: 'Daily', description: 'Once per day digest' },
                        { value: 'weekly', label: 'Weekly', description: 'Weekly summary' }
                      ].map(option => (
                        <label key={option.value} className="cursor-pointer">
                          <div className={`p-4 border-2 rounded-lg transition-colors ${
                            notifications.frequency === option.value
                              ? 'border-[#873bff] bg-[#873bff]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center mb-2">
                              <input
                                type="radio"
                                name="frequency"
                                value={option.value}
                                checked={notifications.frequency === option.value}
                                onChange={(e) => setNotifications({ ...notifications, frequency: e.target.value as any })}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 rounded-full border-2 mr-2 ${
                                notifications.frequency === option.value
                                  ? 'border-[#873bff] bg-[#873bff]'
                                  : 'border-gray-300'
                              }`}>
                                {notifications.frequency === option.value && (
                                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                )}
                              </div>
                              <span className="font-medium text-gray-900">{option.label}</span>
                            </div>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={saveNotifications}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
                  </div>

                  {/* Password */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={changePassword}
                        disabled={saving || !newPassword || newPassword !== confirmPassword}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Enable Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account with 2FA
                        </p>
                      </div>
                      
                      <button
                        onClick={toggleTwoFactor}
                        disabled={saving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          security.twoFactorEnabled
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : security.twoFactorEnabled ? (
                          <>
                            <Unlock className="w-4 h-4" />
                            Disable 2FA
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Enable 2FA
                          </>
                        )}
                      </button>
                    </div>
                    
                    {security.twoFactorEnabled && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          ✓ Two-factor authentication is enabled and protecting your account
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
                    
                    <div className="space-y-4">
                      {security.sessions.map(session => (
                        <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-8 h-8 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {session.device}
                                {session.current && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                    Current
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                {session.location} • Last active {formatDate(session.lastActive)}
                              </p>
                            </div>
                          </div>
                          
                          {!session.current && (
                            <button
                              onClick={() => terminateSession(session.id)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Login History */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Login Activity</h3>
                    
                    <div className="space-y-3">
                      {security.loginHistory.map(login => (
                        <div key={login.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              login.success ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {login.device} from {login.location}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(login.timestamp)}
                              </p>
                            </div>
                          </div>
                          
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            login.success
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {login.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* API Tab */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">API Management</h2>
                  </div>

                  {/* API Tokens */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">API Tokens</h3>
                        <p className="text-sm text-gray-500 mt-1">Create and manage API tokens for accessing our API</p>
                      </div>
                      
                      <button
                        onClick={() => setShowNewTokenModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-4 h-4" />
                        New Token
                      </button>
                    </div>
                    
                    {apiTokens.length === 0 ? (
                      <div className="text-center py-8">
                        <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No API tokens yet</p>
                        <button
                          onClick={() => setShowNewTokenModal(true)}
                          className="px-4 py-2 bg-[#873bff] text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Create Your First Token
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {apiTokens.map(token => (
                          <div key={token.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{token.name}</h4>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <code className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono">
                                    {token.token}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(token.token)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {token.permissions.map(permission => (
                                    <span key={permission} className="px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                                      {permission}
                                    </span>
                                  ))}
                                </div>
                                
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                  <span>Created {formatDate(token.createdAt)}</span>
                                  {token.lastUsed && (
                                    <span>Last used {formatDate(token.lastUsed)}</span>
                                  )}
                                  {token.expiresAt && (
                                    <span>Expires {formatDate(token.expiresAt)}</span>
                                  )}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => setShowDeleteConfirm(token.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* API Documentation */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">API Documentation</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a
                        href="#"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#873bff] hover:bg-[#873bff]/5 transition-colors"
                      >
                        <FileText className="w-6 h-6 text-[#873bff]" />
                        <div>
                          <p className="font-medium text-gray-900">API Reference</p>
                          <p className="text-sm text-gray-500">Complete API documentation</p>
                        </div>
                      </a>
                      
                      <a
                        href="#"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#873bff] hover:bg-[#873bff]/5 transition-colors"
                      >
                        <Code className="w-6 h-6 text-[#873bff]" />
                        <div>
                          <p className="font-medium text-gray-900">Code Examples</p>
                          <p className="text-sm text-gray-500">Sample code in various languages</p>
                        </div>
                      </a>
                      
                      <a
                        href="#"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#873bff] hover:bg-[#873bff]/5 transition-colors"
                      >
                        <Zap className="w-6 h-6 text-[#873bff]" />
                        <div>
                          <p className="font-medium text-gray-900">Quick Start</p>
                          <p className="text-sm text-gray-500">Get up and running in minutes</p>
                        </div>
                      </a>
                      
                      <a
                        href="#"
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#873bff] hover:bg-[#873bff]/5 transition-colors"
                      >
                        <HelpCircle className="w-6 h-6 text-[#873bff]" />
                        <div>
                          <p className="font-medium text-gray-900">Support</p>
                          <p className="text-sm text-gray-500">Get help with API integration</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Settings</h2>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="text-center">
                      <Crown className="w-12 h-12 text-[#873bff] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Management</h3>
                      <p className="text-gray-600 mb-6">
                        For detailed billing information, subscription management, and usage tracking,
                        please visit the dedicated billing section.
                      </p>
                      
                      <button
                        onClick={() => window.location.href = '/dashboard/billing'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Crown className="w-4 h-4" />
                        Go to Billing
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Danger Zone</h2>
                    <p className="text-gray-600">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                  </div>

                  {/* Export Data */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Export Account Data</h3>
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-600 mb-2">
                          Download a copy of your account data including profile, settings, and team information.
                        </p>
                        <p className="text-sm text-gray-500">
                          This may take a few minutes to process.
                        </p>
                      </div>
                      
                      <button
                        onClick={exportData}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 ml-4"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export Data
                      </button>
                    </div>
                  </div>

                  {/* Delete Account */}
                  <div className="bg-white rounded-xl border border-red-200 p-6">
                    <h3 className="text-lg font-medium text-red-900 mb-4">Delete Account</h3>
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-red-600 mb-2">
                          Permanently delete your account and all associated data.
                        </p>
                        <p className="text-sm text-red-500">
                          This action cannot be undone. All your projects, tasks, notes, and team data will be lost forever.
                        </p>
                      </div>
                      
                      <button
                        onClick={deleteAccount}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 ml-4"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New API Token Modal */}
      {showNewTokenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create API Token</h3>
              <button
                onClick={() => {
                  setShowNewTokenModal(false)
                  setNewTokenName('')
                  setNewTokenPermissions([])
                  setError(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Name *
                </label>
                <input
                  type="text"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="e.g., Mobile App Integration"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions *
                </label>
                <div className="space-y-2">
                  {[
                    'read:projects',
                    'write:projects', 
                    'read:tasks',
                    'write:tasks',
                    'read:contacts',
                    'write:contacts',
                    'read:notes',
                    'write:notes'
                  ].map(permission => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newTokenPermissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTokenPermissions([...newTokenPermissions, permission])
                          } else {
                            setNewTokenPermissions(newTokenPermissions.filter(p => p !== permission))
                          }
                        }}
                        className="w-4 h-4 text-[#873bff] rounded border-gray-300 focus:ring-[#873bff]"
                      />
                      <span className="ml-2 text-sm text-gray-700 font-mono">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewTokenModal(false)
                  setNewTokenName('')
                  setNewTokenPermissions([])
                  setError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createAPIToken}
                disabled={saving || !newTokenName.trim() || newTokenPermissions.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Create Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Revoke API Token</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to revoke this API token? Applications using this token will lose access immediately.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => revokeAPIToken(showDeleteConfirm)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Revoke Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


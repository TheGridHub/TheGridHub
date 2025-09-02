'use client'

import { useState } from 'react'
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Settings, 
  Eye, 
  EyeOff,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  CreditCard,
  MapPin,
  Phone,
  Calendar,
  Globe,
  Key,
  History,
  Download,
  Upload,
  Trash2,
  MessageSquare,
  Ban,
  UserPlus,
  RefreshCw
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  phone?: string
  country?: string
  timezone?: string
  subscription: 'personal' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'pending'
  emailVerified: boolean
  twoFactorEnabled: boolean
  createdAt: string
  lastLogin: string
  loginCount: number
  tasksCount: number
  projectsCount: number
  storageUsed: number
  storageLimit: number
  preferences: {
    theme: string
    language: string
    notifications: boolean
    marketing: boolean
  }
  billing: {
    nextBillingDate?: string
    paymentMethod?: string
    billingAddress?: {
      street: string
      city: string
      state: string
      country: string
      zip: string
    }
  }
}

interface ActivityLog {
  id: string
  action: string
  details: string
  ipAddress: string
  userAgent: string
  location?: string
  timestamp: string
  status: 'success' | 'failed' | 'warning'
}

interface UserProfileManagerProps {
  userId: string
  onUserUpdate: (userId: string, updates: any) => void
  onPasswordReset: (userId: string) => void
  onEmailChange: (userId: string, newEmail: string) => void
}

export default function UserProfileManager({ 
  userId, 
  onUserUpdate, 
  onPasswordReset,
  onEmailChange 
}: UserProfileManagerProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Sample user data (replace with actual data from your backend)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    avatar: '',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    timezone: 'America/New_York',
    subscription: 'pro',
    status: 'active',
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20T10:30:00Z',
    loginCount: 45,
    tasksCount: 128,
    projectsCount: 12,
    storageUsed: 2.4,
    storageLimit: 10,
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: true,
      marketing: false
    },
    billing: {
      nextBillingDate: '2024-02-15',
      paymentMethod: 'Visa ending in 4242',
      billingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'US',
        zip: '10001'
      }
    }
  })

  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Login',
      details: 'Successful login via web browser',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'New York, NY',
      timestamp: '2024-01-20T10:30:00Z',
      status: 'success'
    },
    {
      id: '2',
      action: 'Password Change',
      details: 'Password changed successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'New York, NY',
      timestamp: '2024-01-19T14:22:00Z',
      status: 'success'
    },
    {
      id: '3',
      action: 'Failed Login',
      details: 'Invalid password attempt',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      location: 'New York, NY',
      timestamp: '2024-01-18T09:15:00Z',
      status: 'failed'
    },
    {
      id: '4',
      action: 'Profile Update',
      details: 'Updated profile information',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'New York, NY',
      timestamp: '2024-01-17T16:45:00Z',
      status: 'success'
    }
  ])

  const handleSave = async () => {
    setLoading(true)
    try {
      onUserUpdate(userId, userProfile)
      setSuccessMessage('User profile updated successfully')
      setEditMode(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrorMessage('Failed to update user profile')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (confirm('Are you sure you want to reset this user\'s password? They will receive an email with reset instructions.')) {
      try {
        await onPasswordReset(userId)
        setSuccessMessage('Password reset email sent successfully')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        setErrorMessage('Failed to send password reset email')
        setTimeout(() => setErrorMessage(''), 3000)
      }
    }
  }

  const handleEmailChange = async (newEmail: string) => {
    if (confirm(`Are you sure you want to change this user's email to ${newEmail}?`)) {
      try {
        await onEmailChange(userId, newEmail)
        setUserProfile(prev => ({ ...prev, email: newEmail, emailVerified: false }))
        setSuccessMessage('Email change initiated. User will receive verification email.')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        setErrorMessage('Failed to change email address')
        setTimeout(() => setErrorMessage(''), 3000)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const getSubscriptionBadge = (subscription: string) => {
    const badges = {
      personal: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    return badges[subscription as keyof typeof badges] || badges.personal
  }

  const getActivityStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-800">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-800">{errorMessage}</span>
        </div>
      )}

      {/* User Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                {userProfile.name}
                {userProfile.emailVerified && (
                  <CheckCircle className="h-5 w-5 text-green-500" title="Email Verified" />
                )}
                {userProfile.twoFactorEnabled && (
                  <Shield className="h-5 w-5 text-blue-500" title="2FA Enabled" />
                )}
              </h2>
              <p className="text-gray-600">{userProfile.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(userProfile.status)}`}>
                  {userProfile.status}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionBadge(userProfile.subscription)}`}>
                  {userProfile.subscription}
                </span>
                <span className="text-xs text-gray-500">
                  Member since {new Date(userProfile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'account', label: 'Account', icon: Settings },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'activity', label: 'Activity', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="flex items-center space-x-2">
                    {editMode ? (
                      <input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 flex-1">{userProfile.email}</p>
                    )}
                    {userProfile.emailVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" title="Verified" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" title="Not Verified" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={userProfile.phone || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  {editMode ? (
                    <select
                      value={userProfile.country || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      {/* Add more countries */}
                    </select>
                  ) : (
                    <p className="text-gray-900">{userProfile.country || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  {editMode ? (
                    <select
                      value={userProfile.timezone || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Timezone</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      {/* Add more timezones */}
                    </select>
                  ) : (
                    <p className="text-gray-900">{userProfile.timezone || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="font-semibold text-gray-900">{userProfile.tasksCount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Projects</span>
                  <span className="font-semibold text-gray-900">{userProfile.projectsCount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Login Count</span>
                  <span className="font-semibold text-gray-900">{userProfile.loginCount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(userProfile.lastLogin).toLocaleDateString()}
                  </span>
                </div>
                <div className="py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Storage Used</span>
                    <span className="font-semibold text-gray-900">
                      {userProfile.storageUsed} GB / {userProfile.storageLimit} GB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(userProfile.storageUsed / userProfile.storageLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                {editMode ? (
                  <select
                    value={userProfile.preferences.theme}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, theme: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{userProfile.preferences.theme}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                {editMode ? (
                  <select
                    value={userProfile.preferences.language}
                    onChange={(e) => setUserProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {userProfile.preferences.language === 'en' && 'English'}
                    {userProfile.preferences.language === 'es' && 'Spanish'}
                    {userProfile.preferences.language === 'fr' && 'French'}
                    {userProfile.preferences.language === 'de' && 'German'}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="notifications"
                  type="checkbox"
                  checked={userProfile.preferences.notifications}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, notifications: e.target.checked }
                  }))}
                  disabled={!editMode}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="marketing"
                  type="checkbox"
                  checked={userProfile.preferences.marketing}
                  onChange={(e) => setUserProfile(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, marketing: e.target.checked }
                  }))}
                  disabled={!editMode}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="marketing" className="text-sm font-medium text-gray-700">
                  Marketing Emails
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handlePasswordReset}
                className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Key className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Reset Password</div>
                  <div className="text-sm text-gray-500">Send password reset email to user</div>
                </div>
              </button>

              <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Send Verification Email</div>
                  <div className="text-sm text-gray-500">Resend email verification</div>
                </div>
              </button>

              <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <RefreshCw className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Force Sync</div>
                  <div className="text-sm text-gray-500">Sync user data across services</div>
                </div>
              </button>

              <button className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Download className="h-5 w-5 text-indigo-600" />
                <div>
                  <div className="font-medium">Export Data</div>
                  <div className="text-sm text-gray-500">Download user's data</div>
                </div>
              </button>

              <button className="flex items-center space-x-2 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left">
                <Ban className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-600">Suspend Account</div>
                  <div className="text-sm text-red-500">Temporarily disable account</div>
                </div>
              </button>

              <button className="flex items-center space-x-2 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-600">Delete Account</div>
                  <div className="text-sm text-red-500">Permanently delete user account</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-500">
                      {userProfile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setUserProfile(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    userProfile.twoFactorEnabled
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {userProfile.twoFactorEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Email Verification</div>
                    <div className="text-sm text-gray-500">
                      {userProfile.emailVerified ? 'Verified' : 'Not Verified'}
                    </div>
                  </div>
                </div>
                {userProfile.emailVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Verify Now
                  </button>
                )}
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <div className="font-medium">Login Sessions</div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Active sessions: 2 • Last login: {new Date(userProfile.lastLogin).toLocaleString()}
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200">
                  Revoke All Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Plan</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionBadge(userProfile.subscription)}`}>
                    {userProfile.subscription}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Billing Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {userProfile.billing.nextBillingDate ? new Date(userProfile.billing.nextBillingDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="text-sm font-medium text-gray-900">
                    {userProfile.billing.paymentMethod || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {userProfile.billing.billingAddress && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>{userProfile.billing.billingAddress.street}</div>
                  <div>
                    {userProfile.billing.billingAddress.city}, {userProfile.billing.billingAddress.state} {userProfile.billing.billingAddress.zip}
                  </div>
                  <div>{userProfile.billing.billingAddress.country}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getActivityStatusIcon(log.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{log.action}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>IP: {log.ipAddress} • {log.location}</div>
                    <div className="truncate max-w-md">{log.userAgent}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

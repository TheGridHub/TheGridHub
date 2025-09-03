'use client'

import { useState } from 'react'
import { 
  Settings, 
  Shield, 
  Toggle, 
  Bell, 
  Mail, 
  Database, 
  Globe, 
  Lock,
  Users,
  Palette,
  Code,
  Zap,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Upload,
  Download,
  Eye,
  EyeOff,
  Key,
  Server,
  Monitor,
  Wrench,
  Flag,
  Clock,
  Smartphone,
  HardDrive,
  Wifi,
  MessageSquare,
  CreditCard
} from 'lucide-react'

interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  category: 'ui' | 'api' | 'experimental' | 'security'
  environment: 'development' | 'staging' | 'production' | 'all'
  lastModified: string
}

interface SystemSetting {
  id: string
  category: string
  name: string
  description: string
  value: any
  type: 'boolean' | 'string' | 'number' | 'select' | 'json'
  options?: string[]
  sensitive?: boolean
}

interface MaintenanceWindow {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'active' | 'completed'
  affectedServices: string[]
}

interface AdminSettingsProps {
  onSettingChange?: (settingId: string, value: any) => void
  onFeatureFlagToggle?: (flagId: string, enabled: boolean) => void
  onMaintenanceSchedule?: (maintenance: Omit<MaintenanceWindow, 'id' | 'status'>) => void
}

export default function AdminSettings({ 
  onSettingChange, 
  onFeatureFlagToggle, 
  onMaintenanceSchedule 
}: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)

  // Feature Flags
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: '1',
      name: 'AI Suggestions',
      description: 'Enable AI-powered task suggestions for users',
      enabled: true,
      category: 'api',
      environment: 'production',
      lastModified: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Dark Mode',
      description: 'Allow users to switch to dark theme',
      enabled: true,
      category: 'ui',
      environment: 'all',
      lastModified: '2024-01-14T14:22:00Z'
    },
    {
      id: '3',
      name: 'Team Collaboration Beta',
      description: 'Beta version of team collaboration features',
      enabled: false,
      category: 'experimental',
      environment: 'staging',
      lastModified: '2024-01-10T09:15:00Z'
    },
    {
      id: '4',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for all new account registrations',
      enabled: false,
      category: 'security',
      environment: 'production',
      lastModified: '2024-01-08T16:45:00Z'
    },
    {
      id: '5',
      name: 'Advanced Analytics',
      description: 'Show detailed analytics dashboard to users',
      enabled: true,
      category: 'ui',
      environment: 'production',
      lastModified: '2024-01-12T11:20:00Z'
    }
  ])

  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([
    {
      id: '1',
      category: 'Authentication',
      name: 'Session Timeout',
      description: 'User session timeout in minutes',
      value: 60,
      type: 'number'
    },
    {
      id: '2',
      category: 'Authentication',
      name: 'Password Min Length',
      description: 'Minimum password length requirement',
      value: 8,
      type: 'number'
    },
    {
      id: '3',
      category: 'Email',
      name: 'SMTP Server',
      description: 'SMTP server hostname',
      value: 'smtp.TaskWork.com',
      type: 'string'
    },
    {
      id: '4',
      category: 'Email',
      name: 'SMTP Password',
      description: 'SMTP server password',
      value: '••••••••••••',
      type: 'string',
      sensitive: true
    },
    {
      id: '5',
      category: 'API',
      name: 'Rate Limit',
      description: 'API requests per minute per user',
      value: 100,
      type: 'number'
    },
    {
      id: '6',
      category: 'Storage',
      name: 'Max File Size',
      description: 'Maximum file upload size in MB',
      value: 10,
      type: 'number'
    },
    {
      id: '7',
      category: 'Notifications',
      name: 'Email Notifications',
      description: 'Send email notifications for important events',
      value: true,
      type: 'boolean'
    },
    {
      id: '8',
      category: 'Security',
      name: 'Login Attempt Limit',
      description: 'Maximum failed login attempts before lockout',
      value: 5,
      type: 'number'
    },
    {
      id: '9',
      category: 'Integrations',
      name: 'Webhook Timeout',
      description: 'Webhook timeout in seconds',
      value: 30,
      type: 'number'
    },
    {
      id: '10',
      category: 'Performance',
      name: 'Cache Duration',
      description: 'Default cache duration in minutes',
      value: 15,
      type: 'number'
    }
  ])

  const [maintenanceWindows] = useState<MaintenanceWindow[]>([
    {
      id: '1',
      title: 'Database Optimization',
      description: 'Routine database maintenance and optimization',
      startTime: '2024-01-20T02:00:00Z',
      endTime: '2024-01-20T04:00:00Z',
      status: 'scheduled',
      affectedServices: ['Database', 'API', 'Web App']
    },
    {
      id: '2',
      title: 'Security Updates',
      description: 'Critical security patches deployment',
      startTime: '2024-01-15T01:00:00Z',
      endTime: '2024-01-15T02:30:00Z',
      status: 'completed',
      affectedServices: ['All Services']
    }
  ])

  const handleSettingChange = (settingId: string, value: any) => {
    setSystemSettings(prev => 
      prev.map(setting => 
        setting.id === settingId ? { ...setting, value } : setting
      )
    )
    setUnsavedChanges(true)
    onSettingChange?.(settingId, value)
  }

  const handleFeatureFlagToggle = (flagId: string, enabled: boolean) => {
    setFeatureFlags(prev => 
      prev.map(flag => 
        flag.id === flagId 
          ? { ...flag, enabled, lastModified: new Date().toISOString() }
          : flag
      )
    )
    setUnsavedChanges(true)
    onFeatureFlagToggle?.(flagId, enabled)
  }

  const toggleSensitiveVisibility = (settingId: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }))
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'authentication':
        return <Lock className="h-5 w-5 text-blue-600" />
      case 'email':
        return <Mail className="h-5 w-5 text-green-600" />
      case 'api':
        return <Code className="h-5 w-5 text-purple-600" />
      case 'storage':
        return <HardDrive className="h-5 w-5 text-orange-600" />
      case 'notifications':
        return <Bell className="h-5 w-5 text-yellow-600" />
      case 'security':
        return <Shield className="h-5 w-5 text-red-600" />
      case 'integrations':
        return <Wifi className="h-5 w-5 text-indigo-600" />
      case 'performance':
        return <Zap className="h-5 w-5 text-pink-600" />
      default:
        return <Settings className="h-5 w-5 text-gray-600" />
    }
  }

  const getFeatureFlagCategoryColor = (category: string) => {
    switch (category) {
      case 'ui':
        return 'bg-blue-100 text-blue-800'
      case 'api':
        return 'bg-green-100 text-green-800'
      case 'experimental':
        return 'bg-yellow-100 text-yellow-800'
      case 'security':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const groupedSettings = systemSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, SystemSetting[]>)

  const groupedFlags = featureFlags.reduce((acc, flag) => {
    if (!acc[flag.category]) {
      acc[flag.category] = []
    }
    acc[flag.category].push(flag)
    return acc
  }, {} as Record<string, FeatureFlag[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
            <p className="text-gray-600">Configure system settings, feature flags, and maintenance options</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {unsavedChanges && (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
            
            <button
              onClick={() => setUnsavedChanges(false)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Emergency Maintenance Toggle */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Emergency Maintenance Mode</h3>
                <p className="text-sm text-red-700">Enable to put the system in maintenance mode immediately</p>
              </div>
            </div>
            <button
              onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isMaintenanceMode ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isMaintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: 'General Settings', icon: Settings },
              { id: 'features', label: 'Feature Flags', icon: Flag },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'integrations', label: 'Integrations', icon: Wifi },
              { id: 'monitoring', label: 'Monitoring', icon: Monitor }
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

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(([category, settings]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                {getCategoryIcon(category)}
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
              </div>
              
              <div className="space-y-4">
                {settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{setting.name}</h4>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {setting.type === 'boolean' && (
                        <button
                          onClick={() => handleSettingChange(setting.id, !setting.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            setting.value ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              setting.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                      
                      {setting.type === 'string' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type={setting.sensitive && !showSensitive[setting.id] ? 'password' : 'text'}
                            value={setting.value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                            className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {setting.sensitive && (
                            <button
                              onClick={() => toggleSensitiveVisibility(setting.id)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              {showSensitive[setting.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      
                      {setting.type === 'number' && (
                        <input
                          type="number"
                          value={setting.value}
                          onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                      
                      {setting.type === 'select' && setting.options && (
                        <select
                          value={setting.value}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {setting.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          {Object.entries(groupedFlags).map(([category, flags]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{category} Features</h3>
              
              <div className="space-y-4">
                {flags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{flag.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFeatureFlagCategoryColor(flag.category)}`}>
                          {flag.category}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {flag.environment}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{flag.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last modified: {new Date(flag.lastModified).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-4">
                      <span className={`text-sm font-medium ${flag.enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => handleFeatureFlagToggle(flag.id, !flag.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          flag.enabled ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            flag.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Feature Flag Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Flag Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{featureFlags.filter(f => f.enabled).length}</div>
                <div className="text-sm text-gray-500">Enabled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{featureFlags.filter(f => !f.enabled).length}</div>
                <div className="text-sm text-gray-500">Disabled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{featureFlags.filter(f => f.category === 'experimental').length}</div>
                <div className="text-sm text-gray-500">Experimental</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{featureFlags.filter(f => f.environment === 'production').length}</div>
                <div className="text-sm text-gray-500">In Production</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            
            <div className="space-y-6">
              {/* Password Policy */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Password Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Minimum Length</span>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      defaultValue="8"
                      className="w-20 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Require Special Characters</span>
                    <Toggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Require Numbers</span>
                    <Toggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Require Uppercase</span>
                    <Toggle />
                  </div>
                </div>
              </div>

              {/* Session Management */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Session Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Session Timeout (minutes)</span>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      defaultValue="60"
                      className="w-20 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Remember Me Duration (days)</span>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      defaultValue="30"
                      className="w-20 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Force Re-authentication for Sensitive Actions</span>
                    <Toggle />
                  </div>
                </div>
              </div>

              {/* API Security */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">API Security</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rate Limiting (requests/minute)</span>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      defaultValue="100"
                      className="w-20 px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CORS Enabled</span>
                    <Toggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Key Required</span>
                    <Toggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Scheduled Maintenance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Maintenance</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Schedule Maintenance</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {maintenanceWindows.map((maintenance) => (
                <div key={maintenance.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{maintenance.title}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceStatusColor(maintenance.status)}`}>
                      {maintenance.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{maintenance.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Start Time:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(maintenance.startTime).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">End Time:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(maintenance.endTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="font-medium text-gray-700 text-sm">Affected Services:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {maintenance.affectedServices.map((service) => (
                        <span key={service} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Maintenance Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Maintenance Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Database Cleanup</div>
                  <div className="text-sm text-gray-500">Clean up old logs and temporary data</div>
                </div>
              </button>
              
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <RefreshCw className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Cache Clear</div>
                  <div className="text-sm text-gray-500">Clear all application caches</div>
                </div>
              </button>
              
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Download className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Backup System</div>
                  <div className="text-sm text-gray-500">Create full system backup</div>
                </div>
              </button>
              
              <button className="flex items-center space-x-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 text-left">
                <Server className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-600">Restart Services</div>
                  <div className="text-sm text-red-500">Restart all application services</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Third-party Integrations</h3>
            
            <div className="space-y-4">
              {[
                { name: 'Stripe', description: 'Payment processing', status: 'connected', icon: CreditCard },
                { name: 'SendGrid', description: 'Email delivery service', status: 'connected', icon: Mail },
                { name: 'Slack', description: 'Team notifications', status: 'disconnected', icon: MessageSquare },
                { name: 'Google Analytics', description: 'Web analytics', status: 'connected', icon: BarChart3 }
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <integration.icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{integration.name}</h4>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      integration.status === 'connected' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {integration.status}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      {integration.status === 'connected' ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring & Alerts</h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Alert Thresholds</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">CPU Usage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue="80"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Memory Usage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue="85"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Disk Usage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue="90"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Response Time (ms)</label>
                    <input
                      type="number"
                      min="0"
                      defaultValue="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Alerts</span>
                    <Toggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">SMS Alerts</span>
                    <Toggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Slack Notifications</span>
                    <Toggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Webhook Alerts</span>
                    <Toggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function Toggle() {
    const [enabled, setEnabled] = useState(false)
    
    return (
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    )
  }
}


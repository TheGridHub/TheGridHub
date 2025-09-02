'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  Settings, 
  Calendar, 
  Mail, 
  FileText, 
  Users, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Shield
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: 'office365' | 'google'
  status: 'connected' | 'disconnected' | 'error'
  connectedAt?: string
  userEmail?: string
  features: {
    calendar: boolean
    email: boolean
    storage: boolean
    chat: boolean
    tasks: boolean
    sheets?: boolean
  }
  lastSync?: string
}

const INTEGRATION_CONFIGS = {
  office365: {
    name: 'Office 365',
    icon: '🏢',
    color: 'blue',
    features: [
      { id: 'calendar', name: 'Outlook Calendar', icon: Calendar, description: 'Sync tasks to calendar events' },
      { id: 'email', name: 'Outlook Email', icon: Mail, description: 'Send task assignment emails' },
      { id: 'storage', name: 'OneDrive', icon: FileText, description: 'Export projects to OneDrive' },
      { id: 'chat', name: 'Microsoft Teams', icon: Users, description: 'Post task updates to Teams channels' },
      { id: 'tasks', name: 'Microsoft To-Do', icon: CheckCircle, description: 'Sync tasks to Microsoft To-Do' }
    ]
  },
  google: {
    name: 'Google Workspace',
    icon: '🌐',
    color: 'emerald',
    features: [
      { id: 'calendar', name: 'Google Calendar', icon: Calendar, description: 'Create calendar events from tasks' },
      { id: 'email', name: 'Gmail', icon: Mail, description: 'Send beautiful task assignment emails' },
      { id: 'storage', name: 'Google Drive', icon: FileText, description: 'Save project exports to Drive' },
      { id: 'chat', name: 'Google Chat', icon: Users, description: 'Send notifications to Chat spaces' },
      { id: 'tasks', name: 'Google Tasks', icon: CheckCircle, description: 'Sync with Google Tasks app' },
      { id: 'sheets', name: 'Google Sheets', icon: FileText, description: 'Export project data to Sheets' }
    ]
  }
}

export default function IntegrationSettings() {
  const { user } = useUser()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchIntegrations()
    }
  }, [user])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations')
      const data = await response.json()
      setIntegrations(data)
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (type: 'office365' | 'google') => {
    setActionLoading(`connect-${type}`)
    try {
      const response = await fetch(`/api/integrations/${type}/auth`, {
        method: 'POST'
      })
      const { authUrl } = await response.json()
      
      // Redirect to OAuth flow
      window.location.href = authUrl
    } catch (error) {
      console.error(`Failed to connect ${type}:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    setActionLoading(`disconnect-${integrationId}`)
    try {
      await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE'
      })
      await fetchIntegrations()
    } catch (error) {
      console.error('Failed to disconnect integration:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSync = async (integrationId: string) => {
    setActionLoading(`sync-${integrationId}`)
    try {
      await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST'
      })
      await fetchIntegrations()
    } catch (error) {
      console.error('Failed to sync integration:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleFeature = async (integrationId: string, feature: string, enabled: boolean) => {
    try {
      await fetch(`/api/integrations/${integrationId}/features`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, enabled })
      })
      await fetchIntegrations()
    } catch (error) {
      console.error('Failed to toggle feature:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integrations</h2>
        <p className="text-slate-600">
          Connect TaskGrid with your favorite productivity tools to streamline your workflow.
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-6">
        {Object.entries(INTEGRATION_CONFIGS).map(([type, config]) => {
          const integration = integrations.find(i => i.type === type)
          const isConnected = integration?.status === 'connected'
          const hasError = integration?.status === 'error'
          
          return (
            <div
              key={type}
              className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 ${
                isConnected ? `border-${config.color}-200 bg-${config.color}-50/30` : 'border-slate-200'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${config.color}-100 flex items-center justify-center text-2xl`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{config.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {isConnected ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
                            <CheckCircle className="w-3 h-3" />
                            Connected
                          </span>
                        ) : hasError ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <AlertCircle className="w-3 h-3" />
                            Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Not Connected
                          </span>
                        )}
                        
                        {integration?.userEmail && (
                          <span className="text-xs text-slate-500">
                            {integration.userEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleSync(integration.id)}
                          disabled={actionLoading === `sync-${integration.id}`}
                          className={`p-2 rounded-lg transition-colors hover:bg-${config.color}-100 text-${config.color}-600 disabled:opacity-50`}
                          title="Sync now"
                        >
                          <RefreshCw className={`w-4 h-4 ${actionLoading === `sync-${integration.id}` ? 'animate-spin' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          disabled={actionLoading === `disconnect-${integration.id}`}
                          className="p-2 rounded-lg transition-colors hover:bg-red-100 text-red-600 disabled:opacity-50"
                          title="Disconnect"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(type as 'office365' | 'google')}
                        disabled={actionLoading === `connect-${type}`}
                        className={`inline-flex items-center gap-2 bg-${config.color}-600 hover:bg-${config.color}-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50`}
                      >
                        {actionLoading === `connect-${type}` ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {/* Connection Info */}
                {isConnected && integration && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Connected:</span>
                        <span className="ml-2 text-slate-900">
                          {new Date(integration.connectedAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Last Sync:</span>
                        <span className="ml-2 text-slate-900">
                          {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900 mb-3">Available Features</h4>
                  
                  <div className="grid gap-3">
                    {config.features.map((feature) => {
                      const Icon = feature.icon
                      const isFeatureEnabled = integration?.features?.[feature.id as keyof typeof integration.features] || false
                      
                      return (
                        <div
                          key={feature.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isConnected && isFeatureEnabled
                              ? `border-${config.color}-200 bg-${config.color}-50/50`
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${
                              isConnected && isFeatureEnabled 
                                ? `text-${config.color}-600` 
                                : 'text-slate-400'
                            }`} />
                            <div>
                              <div className="font-medium text-slate-900">
                                {feature.name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {feature.description}
                              </div>
                            </div>
                          </div>
                          
                          {isConnected && (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isFeatureEnabled}
                                onChange={(e) => toggleFeature(integration.id, feature.id, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className={`relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${config.color}-600`}></div>
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Security Notice */}
                {isConnected && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>Secure Connection:</strong> Your data is encrypted and we only access the minimum permissions needed for each feature. You can revoke access at any time.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Help Section */}
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 mb-3">Need Help?</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p>• <strong>Calendar Sync:</strong> Tasks with due dates automatically create calendar events</p>
          <p>• <strong>Email Notifications:</strong> Team members receive professional emails when assigned tasks</p>
          <p>• <strong>File Exports:</strong> Project data can be exported to Drive/OneDrive for backup</p>
          <p>• <strong>Chat Integration:</strong> Get real-time task updates in Teams or Google Chat</p>
          <p>• <strong>Task Sync:</strong> Keep TaskGrid tasks in sync with Microsoft To-Do or Google Tasks</p>
        </div>
        
        <div className="mt-4">
          <a
            href="https://help.taskgrid.io/integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View Integration Guide
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

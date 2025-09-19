'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Grid,
  List,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Key,
  Webhook,
  Activity,
  Zap,
  Globe,
  Github,
  Slack,
  Twitter,
  Mail,
  Calendar,
  Database,
  FileText,
  MessageSquare,
  CreditCard,
  Users,
  BarChart3,
  Camera,
  Video,
  Music,
  ShoppingCart,
  Truck,
  MapPin,
  Phone,
  Briefcase,
  Building,
  Star,
  Crown,
  Lock,
  Loader2,
  X,
  Copy,
  Edit3,
  Trash2,
  MoreVertical,
  ArrowUpRight,
  Puzzle,
  Sparkles,
  TrendingUp,
  Shield,
  Code,
  Cpu
} from 'lucide-react'

// Types
interface Integration {
  id: string
  name: string
  description: string
  category: 'communication' | 'productivity' | 'development' | 'marketing' | 'finance' | 'analytics' | 'storage' | 'social' | 'ecommerce' | 'ai'
  icon: any
  provider: string
  status: 'available' | 'connected' | 'error' | 'pending'
  isPro: boolean
  isPopular: boolean
  pricing: 'free' | 'paid' | 'freemium'
  setupComplexity: 'easy' | 'medium' | 'advanced'
  features: string[]
  permissions: string[]
  webhookUrl?: string
  apiKey?: string
  lastSync?: Date
  totalSyncs?: number
  errorCount?: number
  connectedAt?: Date
}

interface WebhookConfig {
  id: string
  integrationId: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
  lastTriggered?: Date
  successCount: number
  errorCount: number
}

interface APIKey {
  id: string
  integrationId: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
  usageCount: number
}

type ViewMode = 'grid' | 'list'
type FilterMode = 'all' | 'connected' | 'available' | 'popular' | 'pro'

const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: Grid },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'productivity', name: 'Productivity', icon: Briefcase },
  { id: 'development', name: 'Development', icon: Code },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
  { id: 'finance', name: 'Finance', icon: CreditCard },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'storage', name: 'Storage', icon: Database },
  { id: 'social', name: 'Social Media', icon: Users },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
  { id: 'ai', name: 'AI & ML', icon: Cpu }
]

export default function IntegrationsClient() {
  // State
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')

  // Mock integrations data
  const mockIntegrations: Integration[] = [
    {
      id: '1',
      name: 'Slack',
      description: 'Team communication and collaboration platform',
      category: 'communication',
      icon: Slack,
      provider: 'Slack Technologies',
      status: 'connected',
      isPro: false,
      isPopular: true,
      pricing: 'freemium',
      setupComplexity: 'easy',
      features: ['Team messaging', 'File sharing', 'Video calls', 'App integrations'],
      permissions: ['Read messages', 'Send messages', 'Manage channels'],
      webhookUrl: 'https://hooks.slack.com/services/...',
      connectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      totalSyncs: 1250,
      lastSync: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '2',
      name: 'GitHub',
      description: 'Code repository and version control platform',
      category: 'development',
      icon: Github,
      provider: 'GitHub Inc.',
      status: 'connected',
      isPro: false,
      isPopular: true,
      pricing: 'freemium',
      setupComplexity: 'medium',
      features: ['Repository sync', 'Issue tracking', 'Pull requests', 'Actions'],
      permissions: ['Read repositories', 'Write repositories', 'Manage webhooks'],
      apiKey: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      connectedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      totalSyncs: 850,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Google Drive',
      description: 'Cloud storage and file synchronization service',
      category: 'storage',
      icon: Database,
      provider: 'Google LLC',
      status: 'available',
      isPro: false,
      isPopular: true,
      pricing: 'freemium',
      setupComplexity: 'easy',
      features: ['File storage', 'Document sharing', 'Collaboration', 'Version history'],
      permissions: ['Read files', 'Write files', 'Manage sharing']
    },
    {
      id: '4',
      name: 'Stripe',
      description: 'Online payment processing platform',
      category: 'finance',
      icon: CreditCard,
      provider: 'Stripe Inc.',
      status: 'pending',
      isPro: true,
      isPopular: true,
      pricing: 'paid',
      setupComplexity: 'advanced',
      features: ['Payment processing', 'Subscription management', 'Analytics', 'Fraud detection'],
      permissions: ['Read payments', 'Create charges', 'Manage customers']
    },
    {
      id: '5',
      name: 'Mailchimp',
      description: 'Email marketing and automation platform',
      category: 'marketing',
      icon: Mail,
      provider: 'Intuit Mailchimp',
      status: 'available',
      isPro: false,
      isPopular: true,
      pricing: 'freemium',
      setupComplexity: 'medium',
      features: ['Email campaigns', 'Audience management', 'Automation', 'Analytics'],
      permissions: ['Read campaigns', 'Create campaigns', 'Manage audiences']
    },
    {
      id: '6',
      name: 'Zoom',
      description: 'Video conferencing and webinar platform',
      category: 'communication',
      icon: Video,
      provider: 'Zoom Video Communications',
      status: 'available',
      isPro: true,
      isPopular: false,
      pricing: 'freemium',
      setupComplexity: 'easy',
      features: ['Video meetings', 'Webinars', 'Recording', 'Screen sharing'],
      permissions: ['Create meetings', 'Manage recordings', 'View reports']
    },
    {
      id: '7',
      name: 'Google Analytics',
      description: 'Web analytics and reporting platform',
      category: 'analytics',
      icon: BarChart3,
      provider: 'Google LLC',
      status: 'error',
      isPro: false,
      isPopular: true,
      pricing: 'free',
      setupComplexity: 'medium',
      features: ['Traffic analysis', 'Conversion tracking', 'Custom reports', 'Real-time data'],
      permissions: ['Read analytics data', 'Create custom dimensions'],
      errorCount: 3,
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: '8',
      name: 'Shopify',
      description: 'E-commerce platform for online stores',
      category: 'ecommerce',
      icon: ShoppingCart,
      provider: 'Shopify Inc.',
      status: 'available',
      isPro: true,
      isPopular: false,
      pricing: 'paid',
      setupComplexity: 'advanced',
      features: ['Product management', 'Order processing', 'Inventory tracking', 'Analytics'],
      permissions: ['Read products', 'Write orders', 'Manage inventory']
    },
    {
      id: '9',
      name: 'OpenAI',
      description: 'Artificial intelligence and machine learning platform',
      category: 'ai',
      icon: Sparkles,
      provider: 'OpenAI',
      status: 'available',
      isPro: true,
      isPopular: true,
      pricing: 'paid',
      setupComplexity: 'advanced',
      features: ['GPT models', 'Text generation', 'Code completion', 'Image generation'],
      permissions: ['API access', 'Model usage', 'Token management']
    },
    {
      id: '10',
      name: 'Notion',
      description: 'All-in-one workspace for notes, docs, and collaboration',
      category: 'productivity',
      icon: FileText,
      provider: 'Notion Labs Inc.',
      status: 'available',
      isPro: false,
      isPopular: true,
      pricing: 'freemium',
      setupComplexity: 'easy',
      features: ['Document creation', 'Database management', 'Team collaboration', 'Templates'],
      permissions: ['Read pages', 'Write pages', 'Manage databases']
    },
    {
      id: '11',
      name: 'Twitter',
      description: 'Social media platform for microblogging',
      category: 'social',
      icon: Twitter,
      provider: 'X Corp.',
      status: 'available',
      isPro: false,
      isPopular: false,
      pricing: 'freemium',
      setupComplexity: 'medium',
      features: ['Tweet posting', 'Timeline access', 'Direct messages', 'Analytics'],
      permissions: ['Read tweets', 'Post tweets', 'Send messages']
    },
    {
      id: '12',
      name: 'Figma',
      description: 'Collaborative design and prototyping tool',
      category: 'productivity',
      icon: Puzzle,
      provider: 'Figma Inc.',
      status: 'available',
      isPro: true,
      isPopular: false,
      pricing: 'freemium',
      setupComplexity: 'medium',
      features: ['Design files', 'Prototype sharing', 'Version control', 'Comments'],
      permissions: ['Read files', 'Edit files', 'Manage projects']
    }
  ]

  // Load data
  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIntegrations(mockIntegrations)
    } catch (error) {
      setError('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter
    const matchesFilter = (() => {
      switch (filterMode) {
        case 'connected': return integration.status === 'connected'
        case 'available': return integration.status === 'available'
        case 'popular': return integration.isPopular
        case 'pro': return integration.isPro
        default: return true
      }
    })()
    
    return matchesSearch && matchesCategory && matchesFilter
  })

  // Connect integration
  const connectIntegration = async (integration: Integration) => {
    if (integration.isPro && plan !== 'pro') {
      setError('This integration requires a Pro plan. Please upgrade to continue.')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      // Simulate OAuth or API key setup
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update integration status
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { 
              ...int, 
              status: 'connected',
              connectedAt: new Date(),
              totalSyncs: 0,
              lastSync: new Date()
            }
          : int
      ))
      
      setShowConnectionModal(false)
      setSelectedIntegration(null)
    } catch (error) {
      setError('Failed to connect integration')
    } finally {
      setConnecting(false)
    }
  }

  // Disconnect integration
  const disconnectIntegration = async (integrationId: string) => {
    try {
      setIntegrations(prev => prev.map(int => 
        int.id === integrationId 
          ? { 
              ...int, 
              status: 'available',
              connectedAt: undefined,
              totalSyncs: undefined,
              lastSync: undefined,
              apiKey: undefined,
              webhookUrl: undefined
            }
          : int
      ))
    } catch (error) {
      setError('Failed to disconnect integration')
    }
  }

  // Get status color
  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // Get status icon
  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return CheckCircle
      case 'pending': return Clock
      case 'error': return AlertCircle
      default: return Plus
    }
  }

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffHours * 60)
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="w-8 h-8 text-[#873bff]" />
              Integrations Marketplace
            </h1>
            <p className="text-gray-600 mt-1">
              Connect your favorite tools and automate your workflow
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#873bff] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#873bff] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {plan !== 'pro' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-[#873bff]/10 to-[#7a35e6]/10 border border-[#873bff]/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-[#873bff]" />
                <div>
                  <p className="font-medium text-gray-900">
                    Unlock Premium Integrations
                  </p>
                  <p className="text-sm text-gray-600">
                    Get access to advanced integrations and unlimited syncs
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const r = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      interval: 'monthly',
                      currency: (window as any).__selectedCurrency
                    })
                  })
                  const j = await r.json()
                  if (j.url) window.location.href = j.url
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 6).map(category => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    categoryFilter === category.id
                      ? 'bg-[#873bff] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              )
            })}
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'connected', label: 'Connected' },
              { key: 'available', label: 'Available' },
              { key: 'popular', label: 'Popular' },
              { key: 'pro', label: 'Pro' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterMode(filter.key as FilterMode)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  filterMode === filter.key
                    ? 'bg-[#873bff] text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Integrations Grid/List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#873bff] mx-auto mb-4" />
            <p className="text-gray-600">Loading integrations...</p>
          </div>
        ) : filteredIntegrations.length === 0 ? (
          <div className="p-12 text-center">
            <Puzzle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || categoryFilter !== 'all' ? 'No integrations found' : 'No integrations available'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Check back later for new integrations'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredIntegrations.map(integration => {
                const Icon = integration.icon
                const StatusIcon = getStatusIcon(integration.status)
                
                return (
                  <div
                    key={integration.id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-[#873bff] hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-[#873bff]/10 transition-colors">
                          <Icon className="w-6 h-6 text-gray-600 group-hover:text-[#873bff] transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {integration.name}
                            {integration.isPopular && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {integration.isPro && (
                              <Crown className="w-4 h-4 text-[#873bff]" />
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{integration.provider}</p>
                        </div>
                      </div>
                      
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {integration.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {integration.features.slice(0, 2).map(feature => (
                        <span key={feature} className="px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                          {feature}
                        </span>
                      ))}
                      {integration.features.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{integration.features.length - 2}
                        </span>
                      )}
                    </div>
                    
                    {integration.status === 'connected' && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700">Last sync:</span>
                          <span className="text-green-600 font-medium">
                            {integration.lastSync ? formatTime(integration.lastSync) : 'Never'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-green-700">Total syncs:</span>
                          <span className="text-green-600 font-medium">{integration.totalSyncs || 0}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {integration.status === 'available' ? (
                        <button
                          onClick={() => {
                            setSelectedIntegration(integration)
                            setShowConnectionModal(true)
                          }}
                          disabled={integration.isPro && plan !== 'pro'}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {integration.isPro && plan !== 'pro' ? (
                            <>
                              <Lock className="w-4 h-4" />
                              Pro Only
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Connect
                            </>
                          )}
                        </button>
                      ) : integration.status === 'connected' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedIntegration(integration)
                              setShowConnectionModal(true)
                            }}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Configure
                          </button>
                          <button
                            onClick={() => disconnectIntegration(integration.id)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : integration.status === 'pending' ? (
                        <button
                          className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                          disabled
                        >
                          <Clock className="w-4 h-4" />
                          Pending
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedIntegration(integration)
                            setShowConnectionModal(true)
                          }}
                          className="flex-1 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Fix Error
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredIntegrations.map(integration => {
              const Icon = integration.icon
              const StatusIcon = getStatusIcon(integration.status)
              
              return (
                <div key={integration.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                          {integration.isPopular && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          {integration.isPro && (
                            <Crown className="w-4 h-4 text-[#873bff]" />
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>By {integration.provider}</span>
                          <span className="capitalize">{integration.pricing}</span>
                          <span className="capitalize">{integration.setupComplexity} setup</span>
                          {integration.status === 'connected' && integration.lastSync && (
                            <span>Last sync: {formatTime(integration.lastSync)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {integration.status === 'available' ? (
                        <button
                          onClick={() => {
                            setSelectedIntegration(integration)
                            setShowConnectionModal(true)
                          }}
                          disabled={integration.isPro && plan !== 'pro'}
                          className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {integration.isPro && plan !== 'pro' ? (
                            <>
                              <Lock className="w-4 h-4" />
                              Pro Only
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Connect
                            </>
                          )}
                        </button>
                      ) : integration.status === 'connected' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedIntegration(integration)
                              setShowConnectionModal(true)
                            }}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Configure
                          </button>
                          <button
                            onClick={() => disconnectIntegration(integration.id)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedIntegration(integration)
                            setShowConnectionModal(true)
                          }}
                          className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Fix Error
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Connection Modal */}
      {showConnectionModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <selectedIntegration.icon className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {selectedIntegration.status === 'connected' ? 'Configure' : 'Connect'} {selectedIntegration.name}
                    {selectedIntegration.isPro && (
                      <Crown className="w-5 h-5 text-[#873bff]" />
                    )}
                  </h2>
                  <p className="text-gray-600">{selectedIntegration.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowConnectionModal(false)
                  setSelectedIntegration(null)
                  setError(null)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Features */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedIntegration.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Permissions */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Required Permissions</h3>
                <div className="space-y-2">
                  {selectedIntegration.permissions.map(permission => (
                    <div key={permission} className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-blue-500" />
                      {permission}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Connection Details */}
              {selectedIntegration.status === 'connected' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-900">Connected Successfully</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Connected:</span>
                      <p className="font-medium text-green-900">
                        {selectedIntegration.connectedAt ? formatTime(selectedIntegration.connectedAt) : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="text-green-700">Total Syncs:</span>
                      <p className="font-medium text-green-900">{selectedIntegration.totalSyncs || 0}</p>
                    </div>
                    <div>
                      <span className="text-green-700">Last Sync:</span>
                      <p className="font-medium text-green-900">
                        {selectedIntegration.lastSync ? formatTime(selectedIntegration.lastSync) : 'Never'}
                      </p>
                    </div>
                    <div>
                      <span className="text-green-700">Status:</span>
                      <p className="font-medium text-green-900">Active</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                      <Key className="w-4 h-4" />
                      Manage API Keys
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                      <Webhook className="w-4 h-4" />
                      Configure Webhooks
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                      <Activity className="w-4 h-4" />
                      View Logs
                    </button>
                  </div>
                </div>
              ) : selectedIntegration.status === 'error' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-medium text-red-900">Connection Error</h3>
                  </div>
                  
                  <p className="text-sm text-red-700 mb-4">
                    There was an error connecting to {selectedIntegration.name}. This could be due to invalid credentials or network issues.
                  </p>
                  
                  <div className="text-sm text-red-700">
                    <span>Error Count: {selectedIntegration.errorCount || 0}</span>
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowConnectionModal(false)
                  setSelectedIntegration(null)
                  setError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              
              {selectedIntegration.status === 'available' && (
                <button
                  onClick={() => connectIntegration(selectedIntegration)}
                  disabled={connecting || (selectedIntegration.isPro && plan !== 'pro')}
                  className="px-6 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : selectedIntegration.isPro && plan !== 'pro' ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Pro Required
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Connect to {selectedIntegration.name}
                    </>
                  )}
                </button>
              )}
              
              {selectedIntegration.status === 'connected' && (
                <button
                  onClick={() => disconnectIntegration(selectedIntegration.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              )}
              
              {selectedIntegration.status === 'error' && (
                <button
                  onClick={() => connectIntegration(selectedIntegration)}
                  disabled={connecting}
                  className="px-6 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Retry Connection
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


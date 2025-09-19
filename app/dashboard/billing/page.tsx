'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  Crown,
  Check,
  X,
  Calendar,
  Download,
  ExternalLink,
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  Database,
  Zap,
  Mail,
  Settings,
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  BarChart3,
  Clock,
  FileText,
  Globe,
  Shield,
  Sparkles,
  Building,
  Star,
  Award,
  Rocket,
  Target,
  Layers,
  Headphones
} from 'lucide-react'

// Types
interface Subscription {
  id: string
  plan: 'free' | 'pro'
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  interval: 'monthly' | 'yearly'
  amount: number
  currency: string
  trialEnd?: Date
  cancelAtPeriodEnd: boolean
}

interface Usage {
  aiRequests: { used: number; limit: number }
  storage: { used: number; limit: number } // in GB
  teamMembers: { used: number; limit: number }
  integrations: { used: number; limit: number }
  projects: { used: number; limit: number }
  emailsPerMonth: { used: number; limit: number }
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  brand?: string
  last4: string
  expMonth?: number
  expYear?: number
  isDefault: boolean
}

interface Invoice {
  id: string
  number: string
  status: 'paid' | 'pending' | 'failed'
  amount: number
  currency: string
  date: Date
  dueDate?: Date
  description: string
  downloadUrl: string
}

interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  features: string[]
  limits: {
    aiRequests: number
    storage: number
    teamMembers: number
    integrations: number
    projects: number
    emailsPerMonth: number
  }
  isPopular?: boolean
}

export default function BillingPage() {
  // State
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [upgrading, setUpgrading] = useState(false)
  const [showPlans, setShowPlans] = useState(false)
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [error, setError] = useState<string | null>(null)
  const [currency, setCurrency] = useState('USD')

  // Pricing plans
  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for individuals getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      currency: 'USD',
      features: [
        'Up to 3 team members',
        '10 AI requests per month',
        '1 GB storage',
        'Basic integrations',
        '5 projects',
        '100 emails per month',
        'Community support'
      ],
      limits: {
        aiRequests: 10,
        storage: 1,
        teamMembers: 3,
        integrations: 3,
        projects: 5,
        emailsPerMonth: 100
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing teams and businesses',
      monthlyPrice: 29,
      yearlyPrice: 290, // $24.17/month
      currency: 'USD',
      features: [
        'Unlimited team members',
        '1,000 AI requests per month',
        '100 GB storage',
        'All integrations',
        'Unlimited projects',
        '10,000 emails per month',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access'
      ],
      limits: {
        aiRequests: 1000,
        storage: 100,
        teamMembers: -1, // unlimited
        integrations: -1,
        projects: -1,
        emailsPerMonth: 10000
      },
      isPopular: true
    }
  ]

  // Mock data
  const mockSubscription: Subscription = {
    id: 'sub_1234567890',
    plan: 'free',
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    interval: 'monthly',
    amount: 0,
    currency: 'USD',
    cancelAtPeriodEnd: false
  }

  const mockUsage: Usage = {
    aiRequests: { used: 7, limit: 10 },
    storage: { used: 0.3, limit: 1 },
    teamMembers: { used: 2, limit: 3 },
    integrations: { used: 2, limit: 3 },
    projects: { used: 3, limit: 5 },
    emailsPerMonth: { used: 45, limit: 100 }
  }

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1234567890',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      isDefault: true
    }
  ]

  const mockInvoices: Invoice[] = [
    {
      id: 'in_1234567890',
      number: 'INV-001',
      status: 'paid',
      amount: 29.00,
      currency: 'USD',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      description: 'Pro Plan - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'in_1234567891',
      number: 'INV-002',
      status: 'paid',
      amount: 29.00,
      currency: 'USD',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      description: 'Pro Plan - Monthly',
      downloadUrl: '#'
    }
  ]

  // Load data
  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubscription(mockSubscription)
      setUsage(mockUsage)
      setPaymentMethods(mockPaymentMethods)
      setInvoices(mockInvoices)
    } catch (error) {
      setError('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  // Upgrade/Downgrade functions
  const openPortal = async () => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (error) {
      setError('Failed to open billing portal')
    } finally {
      setUpgrading(false)
    }
  }

  const upgradeToPro = async (interval: 'monthly' | 'yearly') => {
    setUpgrading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval, currency })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      setError('Failed to start upgrade process')
    } finally {
      setUpgrading(false)
    }
  }

  // Helper functions
  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return '💳'
      case 'mastercard': return '💳'
      case 'amex': return '💳'
      default: return '💳'
    }
  }

  const currentPlan = pricingPlans.find(plan => plan.id === subscription?.plan) || pricingPlans[0]
  const isOnFreePlan = subscription?.plan === 'free'
  const yearlyDiscount = Math.round(((29 * 12 - 290) / (29 * 12)) * 100)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-[#873bff]" />
              Billing & Usage
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your subscription, usage, and payment methods
            </p>
          </div>
          
          {subscription?.plan === 'free' && (
            <button
              onClick={() => setShowPlans(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Pro
            </button>
          )}
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

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#873bff]" />
          <span className="ml-3 text-gray-600">Loading billing information...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current Plan */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#873bff]/5 to-[#7a35e6]/5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    subscription?.plan === 'pro' ? 'bg-gradient-to-r from-[#873bff] to-[#7a35e6]' : 'bg-gray-100'
                  }`}>
                    {subscription?.plan === 'pro' ? (
                      <Crown className="w-6 h-6 text-white" />
                    ) : (
                      <Star className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      {currentPlan.name} Plan
                      {subscription?.plan === 'pro' && (
                        <span className="px-2 py-1 text-xs bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-600">{currentPlan.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {subscription?.amount === 0 ? 'Free' : formatCurrency(subscription?.amount || 0, subscription?.currency || 'USD')}
                    {subscription?.amount && subscription.amount > 0 && (
                      <span className="text-sm font-normal text-gray-500">/{subscription?.interval}</span>
                    )}
                  </div>
                  {subscription?.plan === 'pro' && subscription.currentPeriodEnd && (
                    <p className="text-sm text-gray-500">
                      Renews {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                {subscription?.plan === 'free' ? (
                  <>
                    <button
                      onClick={() => upgradeToPro('monthly')}
                      disabled={upgrading}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                      Upgrade to Pro - Monthly
                    </button>
                    <button
                      onClick={() => upgradeToPro('yearly')}
                      disabled={upgrading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                      Upgrade to Pro - Yearly (Save {yearlyDiscount}%)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={openPortal}
                      disabled={upgrading}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                      Manage Subscription
                    </button>
                    <button
                      onClick={() => setShowPlans(true)}
                      className="flex items-center gap-2 px-4 py-2 text-[#873bff] hover:bg-[#873bff]/5 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View All Plans
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Usage Overview */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#873bff]" />
                Current Usage
              </h2>
              <p className="text-gray-600 mt-1">
                Track your usage across different features and services
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* AI Requests */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-gray-900">AI Requests</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {usage?.aiRequests.used}/{usage?.aiRequests.limit === -1 ? '∞' : usage?.aiRequests.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${usage ? getUsagePercentage(usage.aiRequests.used, usage.aiRequests.limit) : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Storage */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900">Storage</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {usage?.storage.used}GB/{usage?.storage.limit === -1 ? '∞' : `${usage?.storage.limit}GB`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${usage ? getUsagePercentage(usage.storage.used, usage.storage.limit) : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-900">Team Members</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {usage?.teamMembers.used}/{usage?.teamMembers.limit === -1 ? '∞' : usage?.teamMembers.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${usage ? getUsagePercentage(usage.teamMembers.used, usage.teamMembers.limit) : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Integrations */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-gray-900">Integrations</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {usage?.integrations.used}/{usage?.integrations.limit === -1 ? '∞' : usage?.integrations.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${usage ? getUsagePercentage(usage.integrations.used, usage.integrations.limit) : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Projects */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-gray-900">Projects</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {usage?.projects.used}/{usage?.projects.limit === -1 ? '∞' : usage?.projects.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${usage ? getUsagePercentage(usage.projects.used, usage.projects.limit) : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Emails */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-gray-900">Emails/Month</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {usage?.emailsPerMonth.used}/{usage?.emailsPerMonth.limit === -1 ? '∞' : usage?.emailsPerMonth.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${usage ? getUsagePercentage(usage.emailsPerMonth.used, usage.emailsPerMonth.limit) : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {isOnFreePlan && (
                <div className="mt-6 p-4 bg-gradient-to-r from-[#873bff]/5 to-[#7a35e6]/5 border border-[#873bff]/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Rocket className="w-5 h-5 text-[#873bff]" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Upgrade to unlock unlimited usage
                        </p>
                        <p className="text-sm text-gray-600">
                          Get unlimited AI requests, storage, team members, and more
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPlans(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Methods */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#873bff]" />
                  Payment Methods
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your payment methods and billing information
                </p>
              </div>
              
              <div className="p-6">
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No payment methods added</p>
                    <button className="px-4 py-2 bg-[#873bff] text-white rounded-lg hover:opacity-90 transition-opacity">
                      Add Payment Method
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map(method => (
                      <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getBrandIcon(method.brand || '')}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 capitalize">
                                {method.brand} •••• {method.last4}
                              </span>
                              {method.isDefault && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            {method.expMonth && method.expYear && (
                              <p className="text-sm text-gray-500">
                                Expires {String(method.expMonth).padStart(2, '0')}/{method.expYear}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-400 hover:text-red-600 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button className="w-full py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-[#873bff] hover:text-[#873bff] transition-colors">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add New Payment Method
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice History */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#873bff]" />
                  Invoice History
                </h2>
                <p className="text-gray-600 mt-1">
                  Download and view your past invoices
                </p>
              </div>
              
              <div className="p-6">
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No invoices yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {invoice.number}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(invoice.date)} • {formatCurrency(invoice.amount, invoice.currency)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {invoice.description}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => window.open(invoice.downloadUrl, '_blank')}
                          className="flex items-center gap-1 px-3 py-2 text-[#873bff] hover:bg-[#873bff]/5 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    ))}
                    
                    <div className="text-center pt-4">
                      <button className="text-[#873bff] hover:underline text-sm">
                        View All Invoices
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Modal */}
      {showPlans && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Choose Your Plan</h2>
                <p className="text-gray-600">Upgrade or change your current subscription</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedInterval('monthly')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedInterval === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setSelectedInterval('yearly')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedInterval === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Yearly (Save {yearlyDiscount}%)
                  </button>
                </div>
                
                <button
                  onClick={() => setShowPlans(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pricingPlans.map(plan => {
                const price = selectedInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
                const isCurrentPlan = plan.id === subscription?.plan
                
                return (
                  <div
                    key={plan.id}
                    className={`relative border-2 rounded-xl p-6 ${
                      plan.isPopular
                        ? 'border-[#873bff] ring-2 ring-[#873bff]/20'
                        : isCurrentPlan
                        ? 'border-green-500 ring-2 ring-green-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    } transition-all`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-full">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <span className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
                          CURRENT PLAN
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                          {price === 0 ? 'Free' : `$${price}`}
                        </span>
                        {price > 0 && (
                          <>
                            <span className="text-lg text-gray-500">/{selectedInterval === 'monthly' ? 'mo' : 'yr'}</span>
                            {selectedInterval === 'yearly' && plan.monthlyPrice > 0 && (
                              <div className="text-sm text-gray-500 mt-1">
                                ${Math.round((price / 12) * 100) / 100}/month billed yearly
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {plan.features.map(feature => (
                        <div key={feature} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      {isCurrentPlan ? (
                        <button
                          className="w-full py-3 border border-gray-200 text-gray-600 rounded-lg cursor-not-allowed"
                          disabled
                        >
                          Current Plan
                        </button>
                      ) : plan.id === 'free' ? (
                        <button
                          onClick={() => {
                            // Handle downgrade to free
                            setShowPlans(false)
                          }}
                          className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Downgrade to Free
                        </button>
                      ) : (
                        <button
                          onClick={() => upgradeToPro(selectedInterval)}
                          disabled={upgrading}
                          className="w-full py-3 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {upgrading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Crown className="w-4 h-4" />
                              Upgrade to {plan.name}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">Secure & Flexible</p>
                  <ul className="space-y-1">
                    <li>• Cancel anytime with no long-term commitment</li>
                    <li>• All plans include 24/7 support and secure data handling</li>
                    <li>• Upgrade or downgrade your plan at any time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

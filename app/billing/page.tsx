'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  CreditCard, 
  Calendar, 
  Download, 
  Settings, 
  Crown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Zap,
  Users,
  Database,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
// import { StripeHelpers } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS, PlanUtils } from '@/lib/pricing'

// Temporary helper function
const formatPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount)
}

interface BillingData {
  subscription: {
    id: string
    status: string
    currentPeriodEnd: string
    plan: string
    amount: number
    currency: string
    cancelAtPeriodEnd: boolean
    trialEnd?: string
  }
  usage: {
    projects: number
    tasks: number
    teamMembers: number
    aiSuggestions: number
    storage: number
  }
  invoices: Array<{
    id: string
    date: string
    amount: number
    status: string
    downloadUrl: string
  }>
  paymentMethod: {
    brand: string
    last4: string
    expiryMonth: number
    expiryYear: number
  } | null
}

export default function BillingPage() {
  const { user } = useUser()
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchBillingData()
    }
  }, [user])

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing')
      const data = await response.json()
      setBillingData(data)
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setActionLoading('portal')
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST'
      })
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpgradePlan = (targetPlan: string) => {
    window.location.href = `/pricing?upgrade=${targetPlan}`
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Billing & Subscription</h1>
          <p className="text-slate-600">Manage your subscription, view usage, and download invoices</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Plan */}
            <CurrentPlanCard 
              billingData={billingData}
              onManageSubscription={handleManageSubscription}
              onUpgrade={handleUpgradePlan}
              isLoading={actionLoading === 'portal'}
            />

            {/* Usage & Limits */}
            <UsageLimitsCard billingData={billingData} />

            {/* Payment History */}
            <PaymentHistoryCard billingData={billingData} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActionsCard 
              onManageSubscription={handleManageSubscription}
              billingData={billingData}
            />

            {/* Payment Method */}
            <PaymentMethodCard 
              paymentMethod={billingData?.paymentMethod}
              onManage={handleManageSubscription}
            />

            {/* Upgrade Suggestions */}
            <UpgradeSuggestionsCard 
              billingData={billingData}
              onUpgrade={handleUpgradePlan}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Loading billing information...</p>
      </div>
    </div>
  )
}

function CurrentPlanCard({ 
  billingData, 
  onManageSubscription, 
  onUpgrade,
  isLoading 
}: { 
  billingData: BillingData | null
  onManageSubscription: () => void
  onUpgrade: (plan: string) => void
  isLoading: boolean
}) {
  const subscription = billingData?.subscription
  const currentPlan = subscription?.plan || 'FREE'
  const plan = SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS]

  const isTrialing = subscription?.trialEnd && new Date(subscription.trialEnd) > new Date()
  const trialDaysLeft = subscription?.trialEnd 
    ? Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Current Plan</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-xl font-semibold text-slate-900">
                {plan?.name || 'Free'}
              </span>
            </div>
            {subscription && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                subscription.status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                subscription.status === 'past_due' ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {subscription.status === 'trialing' ? 'Trial' : 
                 subscription.status === 'active' ? 'Active' :
                 subscription.status === 'past_due' ? 'Past Due' :
                 subscription.status}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          {subscription ? (
            <>
              <div className="text-2xl font-bold text-slate-900">
                {formatPrice(subscription.amount)}
              </div>
              <div className="text-sm text-slate-600">per month</div>
            </>
          ) : (
            <div className="text-2xl font-bold text-emerald-600">Free</div>
          )}
        </div>
      </div>

      {/* Trial Alert */}
      {isTrialing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Trial Period Active
              </h3>
              <p className="text-blue-700 text-sm">
                You have {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in your free trial. 
                Your subscription will automatically start on {new Date(subscription?.trialEnd || '').toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <div className="text-2xl font-bold text-slate-900">
            {plan?.features.maxProjects === -1 ? '∞' : plan?.features.maxProjects || 3}
          </div>
          <div className="text-sm text-slate-600">Projects</div>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <div className="text-2xl font-bold text-slate-900">
            {plan?.features.maxTasks === -1 ? '∞' : plan?.features.maxTasks || 50}
          </div>
          <div className="text-sm text-slate-600">Tasks</div>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <div className="text-2xl font-bold text-slate-900">
            {plan?.features.maxTeamMembers === -1 ? '∞' : plan?.features.maxTeamMembers || 1}
          </div>
          <div className="text-sm text-slate-600">Team Members</div>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <div className="text-2xl font-bold text-slate-900">
            {plan?.features.storage || '100MB'}
          </div>
          <div className="text-sm text-slate-600">Storage</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {subscription ? (
          <>
            <button
              onClick={onManageSubscription}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Settings className="w-4 h-4" />
              )}
              Manage Subscription
            </button>
            
            <button
              onClick={() => onUpgrade('pro')}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade Plan
            </button>
          </>
        ) : (
          <Link
            href="/pricing"
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
          </Link>
        )}
      </div>

      {/* Next Billing */}
      {subscription && !subscription.cancelAtPeriodEnd && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Next billing date</span>
            <span className="text-sm font-medium text-slate-900">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Cancellation Notice */}
      {subscription?.cancelAtPeriodEnd && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 mb-1">
                Subscription Ending
              </h3>
              <p className="text-red-700 text-sm">
                Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. 
                You'll be downgraded to the Free plan unless you reactivate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UsageLimitsCard({ billingData }: { billingData: BillingData | null }) {
  const usage = billingData?.usage
  const subscription = billingData?.subscription
  const currentPlan = subscription?.plan || 'FREE'
  const plan = SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS]

  const usageItems = [
    {
      icon: Database,
      name: 'Projects',
      current: usage?.projects || 0,
      limit: plan?.features.maxProjects === -1 ? Infinity : plan?.features.maxProjects || 3,
      color: 'blue'
    },
    {
      icon: CheckCircle,
      name: 'Tasks',
      current: usage?.tasks || 0,
      limit: plan?.features.maxTasks === -1 ? Infinity : plan?.features.maxTasks || 50,
      color: 'emerald'
    },
    {
      icon: Users,
      name: 'Team Members',
      current: usage?.teamMembers || 0,
      limit: plan?.features.maxTeamMembers === -1 ? Infinity : plan?.features.maxTeamMembers || 1,
      color: 'purple'
    },
    {
      icon: Zap,
      name: 'AI Suggestions',
      current: usage?.aiSuggestions || 0,
      limit: plan?.features.aiSuggestions === -1 ? Infinity : plan?.features.aiSuggestions || 5,
      color: 'orange'
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Usage & Limits</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {usageItems.map((item, index) => {
          const percentage = item.limit === Infinity ? 0 : Math.min((item.current / item.limit) * 100, 100)
          const isNearLimit = percentage > 80
          const isAtLimit = percentage >= 100
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                  <span className="font-medium text-slate-900">{item.name}</span>
                </div>
                <span className="text-sm text-slate-600">
                  {item.current.toLocaleString()} / {item.limit === Infinity ? '∞' : item.limit.toLocaleString()}
                </span>
              </div>
              
              {item.limit !== Infinity && (
                <div className="space-y-2">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isAtLimit ? 'bg-red-500' :
                        isNearLimit ? 'bg-yellow-500' :
                        `bg-${item.color}-500`
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  
                  {isAtLimit && (
                    <p className="text-xs text-red-600 font-medium">
                      Limit reached - upgrade to continue
                    </p>
                  )}
                  
                  {isNearLimit && !isAtLimit && (
                    <p className="text-xs text-yellow-600 font-medium">
                      Approaching limit
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Storage Usage */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-900">Storage Used</span>
          <span className="text-sm text-slate-600">
            {usage?.storage || 0}MB / {plan?.features.storage || '100MB'}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="h-2 bg-slate-600 rounded-full transition-all duration-300"
            style={{ width: '25%' }} // Calculate actual percentage
          />
        </div>
      </div>
    </div>
  )
}

function PaymentHistoryCard({ billingData }: { billingData: BillingData | null }) {
  const invoices = billingData?.invoices || []

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Payment History</h2>
      
      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No payment history yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  invoice.status === 'paid' ? 'bg-emerald-500' :
                  invoice.status === 'pending' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <div>
                  <div className="font-medium text-slate-900">
                    {formatPrice(invoice.amount)}
                  </div>
                  <div className="text-sm text-slate-600">
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {invoice.status}
                </span>
                {invoice.status === 'paid' && (
                  <a
                    href={invoice.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuickActionsCard({ 
  onManageSubscription, 
  billingData 
}: { 
  onManageSubscription: () => void
  billingData: BillingData | null
}) {
  const subscription = billingData?.subscription

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        <button
          onClick={onManageSubscription}
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-slate-600" />
          <span className="text-sm text-slate-700">Manage Subscription</span>
        </button>
        
        <Link
          href="/pricing"
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors"
        >
          <TrendingUp className="w-5 h-5 text-slate-600" />
          <span className="text-sm text-slate-700">Compare Plans</span>
        </Link>
        
        <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors">
          <Download className="w-5 h-5 text-slate-600" />
          <span className="text-sm text-slate-700">Download Invoices</span>
        </button>
        
        <Link
          href="/contact"
          className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ExternalLink className="w-5 h-5 text-slate-600" />
          <span className="text-sm text-slate-700">Contact Support</span>
        </Link>
      </div>
    </div>
  )
}

function PaymentMethodCard({ 
  paymentMethod, 
  onManage 
}: { 
  paymentMethod: BillingData['paymentMethod']
  onManage: () => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Payment Method</h3>
      
      {paymentMethod ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-slate-600" />
            <div>
              <div className="font-medium text-slate-900">
                {paymentMethod.brand.toUpperCase()} ••••{paymentMethod.last4}
              </div>
              <div className="text-sm text-slate-600">
                Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </div>
            </div>
          </div>
          
          <button
            onClick={onManage}
            className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Update Payment Method
          </button>
        </div>
      ) : (
        <div className="text-center py-6">
          <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600 mb-3">No payment method on file</p>
          <button
            onClick={onManage}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Add Payment Method
          </button>
        </div>
      )}
    </div>
  )
}

function UpgradeSuggestionsCard({ 
  billingData, 
  onUpgrade 
}: { 
  billingData: BillingData | null
  onUpgrade: (plan: string) => void
}) {
  const usage = billingData?.usage
  const subscription = billingData?.subscription
  const currentPlan = subscription?.plan || 'FREE'
  
  // Determine if user is approaching limits
  const plan = SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS]
  const nearLimits = []

  if (plan && usage) {
    const projectUsage = plan.features.maxProjects !== -1 && 
      usage.projects / plan.features.maxProjects > 0.8
    const taskUsage = plan.features.maxTasks !== -1 && 
      usage.tasks / plan.features.maxTasks > 0.8
    const aiUsage = plan.features.aiSuggestions !== -1 && 
      usage.aiSuggestions / plan.features.aiSuggestions > 0.8

    if (projectUsage) nearLimits.push('projects')
    if (taskUsage) nearLimits.push('tasks')
    if (aiUsage) nearLimits.push('AI suggestions')
  }

  // Don't show upgrade suggestions for Enterprise plan
  if (currentPlan === 'ENTERPRISE' || nearLimits.length === 0) {
    return null
  }

  const recommendedPlan = PlanUtils.getRecommendedPlan(
    usage?.projects || 0,
    usage?.tasks || 0,
    usage?.teamMembers || 0
  )

  if (recommendedPlan === currentPlan) {
    return null
  }

  const targetPlan = SUBSCRIPTION_PLANS[recommendedPlan]

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-emerald-900 mb-1">
            Upgrade Recommended
          </h3>
          <p className="text-emerald-700 text-sm">
            You're approaching limits for {nearLimits.join(', ')}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="text-lg font-bold text-slate-900">
          {targetPlan.name} Plan
        </div>
        <div className="text-2xl font-bold text-emerald-600">
          {formatPrice(targetPlan.price)}/month
        </div>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>• {targetPlan.features.maxProjects === -1 ? 'Unlimited' : targetPlan.features.maxProjects} projects</li>
          <li>• {targetPlan.features.maxTasks === -1 ? 'Unlimited' : targetPlan.features.maxTasks.toLocaleString()} tasks</li>
          <li>• {targetPlan.features.maxTeamMembers === -1 ? 'Unlimited' : targetPlan.features.maxTeamMembers} team members</li>
        </ul>
      </div>

      <button
        onClick={() => onUpgrade(recommendedPlan.toLowerCase())}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Upgrade Now
      </button>
    </div>
  )
}

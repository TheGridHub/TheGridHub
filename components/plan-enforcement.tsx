'use client'

import { useState } from 'react'
import { Crown, Zap, TrendingUp, X, AlertTriangle, Lock } from 'lucide-react'
import Link from 'next/link'
import { StripeHelpers } from '@/lib/stripe'
import { SUBSCRIPTION_PLANS } from '@/lib/pricing'

interface PlanLimitModalProps {
  isOpen: boolean
  onClose: () => void
  limitType: string
  currentPlan: string
  upgradeRequired: string
  reason: string
}

export function PlanLimitModal({
  isOpen,
  onClose,
  limitType,
  currentPlan,
  upgradeRequired,
  reason
}: PlanLimitModalProps) {
  if (!isOpen) return null

  const targetPlan = SUBSCRIPTION_PLANS[upgradeRequired as keyof typeof SUBSCRIPTION_PLANS]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Plan Limit Reached</h2>
                <p className="text-sm text-slate-600">Upgrade to continue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-800 text-sm">{reason}</p>
              </div>
            </div>
          </div>

          {/* Recommended Plan */}
          {targetPlan && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">Recommended Plan</h3>
              <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-900">{targetPlan.name}</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600 mb-3">
                  {StripeHelpers.formatPrice(targetPlan.price)}/month
                </div>
                <div className="space-y-1 text-sm text-emerald-800">
                  <div>• {targetPlan.features.maxProjects === -1 ? 'Unlimited' : targetPlan.features.maxProjects.toLocaleString()} projects</div>
                  <div>• {targetPlan.features.maxTasks === -1 ? 'Unlimited' : targetPlan.features.maxTasks.toLocaleString()} tasks</div>
                  <div>• {targetPlan.features.maxTeamMembers === -1 ? 'Unlimited' : targetPlan.features.maxTeamMembers} team members</div>
                  {targetPlan.features.aiSuggestions > 0 && (
                    <div>• {targetPlan.features.aiSuggestions === -1 ? 'Unlimited' : targetPlan.features.aiSuggestions} AI suggestions/month</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/pricing?upgrade=${upgradeRequired.toLowerCase()}`}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
              onClick={onClose}
            >
              Upgrade Now
            </Link>
            <Link
              href="/pricing"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors text-center"
              onClick={onClose}
            >
              View All Plans
            </Link>
            <button
              onClick={onClose}
              className="w-full text-slate-600 hover:text-slate-700 font-medium py-2 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureGateProps {
  feature: string
  fallback?: React.ReactNode
  children: React.ReactNode
  userPlan: string
  onUpgradeClick?: () => void
}

export function FeatureGate({ 
  feature, 
  fallback, 
  children, 
  userPlan,
  onUpgradeClick
}: FeatureGateProps) {
  const plan = SUBSCRIPTION_PLANS[userPlan as keyof typeof SUBSCRIPTION_PLANS]
  const hasFeature = plan?.features.features?.includes(feature) || userPlan === 'ENTERPRISE'

  if (hasFeature) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4 max-w-xs text-center">
          <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="font-medium text-slate-900 mb-1">Pro Feature</h3>
          <p className="text-sm text-slate-600 mb-3">
            This feature requires a paid plan
          </p>
          <button
            onClick={onUpgradeClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  )
}

interface UsageBadgeProps {
  current: number
  limit: number
  label: string
  color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'red'
}

export function UsageBadge({ current, limit, label, color = 'blue' }: UsageBadgeProps) {
  const percentage = limit === -1 ? 0 : Math.min((current / limit) * 100, 100)
  const isNearLimit = percentage > 80
  const isAtLimit = percentage >= 100

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100'
  }

  const badgeColor = isAtLimit ? 'red' : isNearLimit ? 'orange' : color

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorClasses[badgeColor]}`}>
      <span>{label}: {current.toLocaleString()}</span>
      {limit !== -1 && (
        <span className="text-xs opacity-75">
          / {limit.toLocaleString()}
        </span>
      )}
      {isAtLimit && <AlertTriangle className="w-3 h-3" />}
    </div>
  )
}

interface LimitWarningProps {
  type: 'project' | 'task' | 'member' | 'ai' | 'storage'
  current: number
  limit: number
  onUpgrade: () => void
}

export function LimitWarning({ type, current, limit, onUpgrade }: LimitWarningProps) {
  const percentage = limit === -1 ? 0 : (current / limit) * 100
  const isNearLimit = percentage > 80
  const isAtLimit = percentage >= 100

  if (!isNearLimit && !isAtLimit) return null

  const typeLabels = {
    project: 'projects',
    task: 'tasks',
    member: 'team members',
    ai: 'AI suggestions',
    storage: 'storage'
  }

  const typeIcons = {
    project: Crown,
    task: CheckCircle,
    member: Users,
    ai: Zap,
    storage: Database
  }

  const Icon = typeIcons[type] || AlertTriangle

  return (
    <div className={`border rounded-lg p-4 ${
      isAtLimit ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${
          isAtLimit ? 'text-red-600' : 'text-yellow-600'
        }`} />
        <div className="flex-1">
          <h3 className={`font-medium mb-1 ${
            isAtLimit ? 'text-red-900' : 'text-yellow-900'
          }`}>
            {isAtLimit ? 'Limit Reached' : 'Approaching Limit'}
          </h3>
          <p className={`text-sm mb-3 ${
            isAtLimit ? 'text-red-700' : 'text-yellow-700'
          }`}>
            You've used {current} of {limit} {typeLabels[type]}
            {isAtLimit ? '. Upgrade to continue.' : ' available.'}
          </p>
          <button
            onClick={onUpgrade}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  )
}

interface PlanBadgeProps {
  plan: string
  showUpgrade?: boolean
  onUpgradeClick?: () => void
  className?: string
}

export function PlanBadge({ plan, showUpgrade = false, onUpgradeClick, className = '' }: PlanBadgeProps) {
  const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]
  
  if (!planConfig) return null

  const badgeColors = {
    FREE: 'bg-slate-100 text-slate-700',
    PRO: 'bg-emerald-100 text-emerald-700', 
    BUSINESS: 'bg-blue-100 text-blue-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700'
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColors[plan as keyof typeof badgeColors] || badgeColors.FREE}`}>
        {planConfig.name}
      </span>
      {showUpgrade && plan !== 'ENTERPRISE' && (
        <button
          onClick={onUpgradeClick}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Upgrade
        </button>
      )}
    </div>
  )
}

interface TrialBannerProps {
  trialEnd: Date
  onUpgrade: () => void
}

export function TrialBanner({ trialEnd, onUpgrade }: TrialBannerProps) {
  const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  
  if (daysLeft <= 0) return null

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5" />
          <div>
            <div className="font-medium">
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in trial
            </div>
            <div className="text-sm opacity-90">
              Upgrade now to continue using premium features
            </div>
          </div>
        </div>
        <button
          onClick={onUpgrade}
          className="bg-white text-emerald-600 hover:bg-emerald-50 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Upgrade
        </button>
      </div>
    </div>
  )
}

interface UpgradePromptProps {
  feature: string
  currentPlan: string
  onUpgrade: () => void
  onDismiss?: () => void
}

export function UpgradePrompt({ feature, currentPlan, onUpgrade, onDismiss }: UpgradePromptProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900">Unlock {feature}</h3>
            <p className="text-emerald-700 text-sm">Available in Pro and higher plans</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-emerald-100 rounded text-emerald-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="text-sm text-slate-700">
          Upgrade to unlock this feature and many more:
        </div>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>• Unlimited projects and tasks</li>
          <li>• Team collaboration</li>
          <li>• Advanced reporting</li>
          <li>• Priority support</li>
        </ul>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onUpgrade}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Upgrade Now
        </button>
        <Link
          href="/pricing"
          className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-600 font-medium py-2 px-4 rounded-lg transition-colors text-center"
        >
          View Plans
        </Link>
      </div>
    </div>
  )
}

interface PlanComparisonProps {
  currentPlan: string
  onSelectPlan: (plan: string) => void
}

export function PlanComparison({ currentPlan, onSelectPlan }: PlanComparisonProps) {
  const plans = Object.values(SUBSCRIPTION_PLANS).filter(plan => plan.id !== 'FREE')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Compare Plans</h3>
      
      <div className="grid gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-4 transition-all ${
              currentPlan === plan.id 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-slate-900">{plan.name}</h4>
                <p className="text-2xl font-bold text-slate-900">
                  {StripeHelpers.formatPrice(plan.price)}/month
                </p>
              </div>
              
              {currentPlan === plan.id ? (
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              ) : (
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Select
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div>Projects: {plan.features.maxProjects === -1 ? 'Unlimited' : plan.features.maxProjects.toLocaleString()}</div>
              <div>Tasks: {plan.features.maxTasks === -1 ? 'Unlimited' : plan.features.maxTasks.toLocaleString()}</div>
              <div>Team: {plan.features.maxTeamMembers === -1 ? 'Unlimited' : plan.features.maxTeamMembers}</div>
              <div>Storage: {plan.features.storage}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LimitCheckResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: string
}

export function usePlanEnforcement() {
  const [limitModal, setLimitModal] = useState<{
    isOpen: boolean
    limitType: string
    reason: string
    upgradeRequired: string
    currentPlan: string
  }>({
    isOpen: false,
    limitType: '',
    reason: '',
    upgradeRequired: '',
    currentPlan: ''
  })

  const showLimitModal = (
    limitType: string,
    reason: string,
    upgradeRequired: string,
    currentPlan: string
  ) => {
    setLimitModal({
      isOpen: true,
      limitType,
      reason,
      upgradeRequired,
      currentPlan
    })
  }

  const hideLimitModal = () => {
    setLimitModal(prev => ({ ...prev, isOpen: false }))
  }

  const checkAndEnforce = async (
    action: string,
    additionalData?: any
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/subscription/check-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...additionalData })
      })

      const result: LimitCheckResult = await response.json()

      if (!result.allowed && result.reason && result.upgradeRequired) {
        showLimitModal(
          action,
          result.reason,
          result.upgradeRequired,
          'FREE' // Will be fetched from context in real app
        )
        return false
      }

      return true
    } catch (error) {
      console.error('Error checking plan limits:', error)
      return false
    }
  }

  return {
    limitModal,
    showLimitModal,
    hideLimitModal,
    checkAndEnforce,
    LimitModal: () => (
      <PlanLimitModal
        isOpen={limitModal.isOpen}
        onClose={hideLimitModal}
        limitType={limitModal.limitType}
        currentPlan={limitModal.currentPlan}
        upgradeRequired={limitModal.upgradeRequired}
        reason={limitModal.reason}
      />
    )
  }
}

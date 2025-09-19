import { useUserProfile } from './useUserProfile'
import { PlanType } from '@/lib/types/database'

// Feature limits by plan
const PLAN_LIMITS = {
  free: {
    projects: 3,
    tasks: 50,
    storage: 1024 * 1024 * 1024, // 1GB
    teamMembers: 2,
    integrations: 1,
    notes: 20,
    contacts: 100,
    companies: 10,
    aiRequests: 10,
    customFields: false,
    advancedReporting: false,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    webhooks: false,
    sso: false,
    auditLogs: false,
  },
  pro: {
    projects: 25,
    tasks: 1000,
    storage: 10 * 1024 * 1024 * 1024, // 10GB
    teamMembers: 10,
    integrations: 5,
    notes: 500,
    contacts: 1000,
    companies: 100,
    aiRequests: 100,
    customFields: true,
    advancedReporting: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    webhooks: true,
    sso: false,
    auditLogs: false,
  },
  enterprise: {
    projects: Infinity,
    tasks: Infinity,
    storage: 100 * 1024 * 1024 * 1024, // 100GB
    teamMembers: Infinity,
    integrations: Infinity,
    notes: Infinity,
    contacts: Infinity,
    companies: Infinity,
    aiRequests: Infinity,
    customFields: true,
    advancedReporting: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    webhooks: true,
    sso: true,
    auditLogs: true,
  }
} as const

export function useFeatureAccess() {
  const { profile } = useUserProfile()
  const planType = profile?.plan_type || 'free'
  const limits = PLAN_LIMITS[planType]

  const canAccess = (feature: keyof typeof PLAN_LIMITS.free) => {
    return limits[feature] === true || limits[feature] === Infinity
  }

  const getLimit = (feature: keyof typeof PLAN_LIMITS.free) => {
    const limit = limits[feature]
    return typeof limit === 'number' ? limit : (limit ? Infinity : 0)
  }

  const isAtLimit = (feature: keyof typeof PLAN_LIMITS.free, currentUsage: number) => {
    const limit = getLimit(feature)
    return currentUsage >= limit
  }

  const getUsagePercentage = (feature: keyof typeof PLAN_LIMITS.free, currentUsage: number) => {
    const limit = getLimit(feature)
    if (limit === Infinity) return 0
    return Math.min((currentUsage / limit) * 100, 100)
  }

  const getRemainingUsage = (feature: keyof typeof PLAN_LIMITS.free, currentUsage: number) => {
    const limit = getLimit(feature)
    if (limit === Infinity) return Infinity
    return Math.max(limit - currentUsage, 0)
  }

  const requiresUpgrade = (feature: keyof typeof PLAN_LIMITS.free) => {
    return !canAccess(feature)
  }

  return {
    planType,
    limits,
    canAccess,
    getLimit,
    isAtLimit,
    getUsagePercentage,
    getRemainingUsage,
    requiresUpgrade,
    isFreePlan: planType === 'free',
    isProPlan: planType === 'pro',
    isEnterprisePlan: planType === 'enterprise',
    isPaidPlan: planType !== 'free',
  }
}

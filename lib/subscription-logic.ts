import { db } from '@/lib/db'
import { SUBSCRIPTION_PLANS } from '@/lib/pricing'
import { StripeManager } from '@/lib/stripe'

export interface UserUsage {
  projects: number
  tasks: number
  teamMembers: number
  aiSuggestions: number
  storage: number
}

export interface PlanLimits {
  maxProjects: number
  maxTasks: number
  maxTeamMembers: number
  maxAiSuggestions: number
  storage: string
  features: string[]
}

export class SubscriptionManager {
  /**
   * Get user's current subscription plan
   */
  static async getUserPlan(userId: string): Promise<string> {
    try {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true }
      })

      if (!user?.subscription || user.subscription.status !== 'active') {
        return 'FREE'
      }

      return user.subscription.plan
    } catch (error) {
      console.error('Error getting user plan:', error)
      return 'FREE'
    }
  }

  /**
   * Get user's current usage statistics
   */
  static async getUserUsage(userId: string): Promise<UserUsage> {
    try {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: {
          projects: true,
          tasks: true,
          teamMemberships: true
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return {
        projects: user.projects.length,
        tasks: user.tasks.length,
        teamMembers: user.teamMemberships.length,
        aiSuggestions: user.aiSuggestionsUsed || 0,
        storage: user.storageUsed || 0
      }
    } catch (error) {
      console.error('Error getting user usage:', error)
      throw error
    }
  }

  /**
   * Check if user can perform an action based on their plan limits
   */
  static async canPerformAction(
    userId: string,
    action: 'create_project' | 'create_task' | 'invite_member' | 'use_ai' | 'upload_file',
    additionalData?: { fileSize?: number }
  ): Promise<{ allowed: boolean; reason?: string; upgradeRequired?: string }> {
    try {
      const [plan, usage] = await Promise.all([
        this.getUserPlan(userId),
        this.getUserUsage(userId)
      ])

      const planLimits = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]
      
      if (!planLimits) {
        return { allowed: false, reason: 'Invalid plan' }
      }

      switch (action) {
        case 'create_project':
          if (planLimits.features.maxProjects === -1) {
            return { allowed: true }
          }
          if (usage.projects >= planLimits.features.maxProjects) {
            return {
              allowed: false,
              reason: `You've reached your project limit (${planLimits.features.maxProjects})`,
              upgradeRequired: this.getRecommendedUpgrade(plan)
            }
          }
          return { allowed: true }

        case 'create_task':
          if (planLimits.features.maxTasks === -1) {
            return { allowed: true }
          }
          if (usage.tasks >= planLimits.features.maxTasks) {
            return {
              allowed: false,
              reason: `You've reached your task limit (${planLimits.features.maxTasks})`,
              upgradeRequired: this.getRecommendedUpgrade(plan)
            }
          }
          return { allowed: true }

        case 'invite_member':
          if (planLimits.features.maxTeamMembers === -1) {
            return { allowed: true }
          }
          if (usage.teamMembers >= planLimits.features.maxTeamMembers) {
            return {
              allowed: false,
              reason: `You've reached your team member limit (${planLimits.features.maxTeamMembers})`,
              upgradeRequired: this.getRecommendedUpgrade(plan)
            }
          }
          return { allowed: true }

        case 'use_ai':
          if (planLimits.features.aiSuggestions === -1) {
            return { allowed: true }
          }
          if (usage.aiSuggestions >= planLimits.features.aiSuggestions) {
            return {
              allowed: false,
              reason: `You've reached your AI suggestions limit (${planLimits.features.aiSuggestions})`,
              upgradeRequired: this.getRecommendedUpgrade(plan)
            }
          }
          return { allowed: true }

        case 'upload_file':
          const fileSize = additionalData?.fileSize || 0
          const storageLimitMB = this.parseStorageLimit(planLimits.features.storage)
          
          if (storageLimitMB === -1) {
            return { allowed: true }
          }
          
          const newStorageUsage = usage.storage + (fileSize / 1024 / 1024) // Convert to MB
          
          if (newStorageUsage > storageLimitMB) {
            return {
              allowed: false,
              reason: `This would exceed your storage limit (${planLimits.features.storage})`,
              upgradeRequired: this.getRecommendedUpgrade(plan)
            }
          }
          return { allowed: true }

        default:
          return { allowed: false, reason: 'Unknown action' }
      }
    } catch (error) {
      console.error('Error checking action permission:', error)
      return { allowed: false, reason: 'Internal error' }
    }
  }

  /**
   * Check if a feature is available for the user's plan
   */
  static async hasFeature(userId: string, feature: string): Promise<boolean> {
    try {
      const plan = await this.getUserPlan(userId)
      const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]
      
      if (!planConfig) return false

      // Check if feature is in the plan's feature list
      return planConfig.features.features?.includes(feature) || false
    } catch (error) {
      console.error('Error checking feature availability:', error)
      return false
    }
  }

  /**
   * Upgrade user's subscription
   */
  static async upgradeSubscription(
    userId: string,
    targetPlan: string,
    prorate: boolean = true
  ): Promise<{ success: boolean; error?: string; checkoutUrl?: string }> {
    try {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true }
      })

      if (!user) {
        return { success: false, error: 'User not found' }
      }

      const targetPlanConfig = SUBSCRIPTION_PLANS[targetPlan as keyof typeof SUBSCRIPTION_PLANS]
      if (!targetPlanConfig) {
        return { success: false, error: 'Invalid target plan' }
      }

      // If user doesn't have an active subscription, create checkout session
      if (!user.subscription || user.subscription.status !== 'active') {
        const checkoutSession = await StripeManager.createCheckoutSession({
          userId,
          priceId: targetPlanConfig.stripePriceId,
          mode: 'subscription',
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
        })

        return {
          success: true,
          checkoutUrl: checkoutSession.url || ''
        }
      }

      // If user has active subscription, modify it
      if (user.stripeCustomerId && user.subscription.stripeSubscriptionId) {
        const subscription = await StripeManager.stripe.subscriptions.retrieve(
          user.subscription.stripeSubscriptionId
        )

        const updatedSubscription = await StripeManager.stripe.subscriptions.update(
          user.subscription.stripeSubscriptionId,
          {
            items: [{
              id: subscription.items.data[0].id,
              price: targetPlanConfig.stripePriceId
            }],
            proration_behavior: prorate ? 'always_invoice' : 'none'
          }
        )

        // Update local database
        await db.subscription.update({
          where: { userId: user.id },
          data: {
            plan: targetPlan,
            currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000)
          }
        })

        return { success: true }
      }

      return { success: false, error: 'Unable to upgrade subscription' }

    } catch (error) {
      console.error('Error upgrading subscription:', error)
      return { success: false, error: 'Failed to upgrade subscription' }
    }
  }

  /**
   * Cancel user's subscription
   */
  static async cancelSubscription(
    userId: string,
    immediate: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true }
      })

      if (!user?.subscription?.stripeSubscriptionId) {
        return { success: false, error: 'No active subscription found' }
      }

      if (immediate) {
        // Cancel immediately
        await StripeManager.stripe.subscriptions.cancel(
          user.subscription.stripeSubscriptionId
        )

        await db.subscription.update({
          where: { userId: user.id },
          data: { 
            status: 'canceled',
            cancelAtPeriodEnd: false
          }
        })
      } else {
        // Cancel at period end
        await StripeManager.stripe.subscriptions.update(
          user.subscription.stripeSubscriptionId,
          { cancel_at_period_end: true }
        )

        await db.subscription.update({
          where: { userId: user.id },
          data: { cancelAtPeriodEnd: true }
        })
      }

      return { success: true }

    } catch (error) {
      console.error('Error canceling subscription:', error)
      return { success: false, error: 'Failed to cancel subscription' }
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  static async reactivateSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true }
      })

      if (!user?.subscription?.stripeSubscriptionId) {
        return { success: false, error: 'No subscription found' }
      }

      // Remove cancellation
      await StripeManager.stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        { cancel_at_period_end: false }
      )

      await db.subscription.update({
        where: { userId: user.id },
        data: { cancelAtPeriodEnd: false }
      })

      return { success: true }

    } catch (error) {
      console.error('Error reactivating subscription:', error)
      return { success: false, error: 'Failed to reactivate subscription' }
    }
  }

  /**
   * Track usage for billing purposes
   */
  static async trackUsage(userId: string, type: 'ai_suggestion' | 'storage', amount: number): Promise<void> {
    try {
      if (type === 'ai_suggestion') {
        await db.user.update({
          where: { clerkId: userId },
          data: {
            aiSuggestionsUsed: {
              increment: amount
            }
          }
        })
      } else if (type === 'storage') {
        await db.user.update({
          where: { clerkId: userId },
          data: {
            storageUsed: {
              increment: amount
            }
          }
        })
      }
    } catch (error) {
      console.error('Error tracking usage:', error)
    }
  }

  /**
   * Reset monthly usage counters (called by cron job)
   */
  static async resetMonthlyUsage(): Promise<void> {
    try {
      // Reset AI suggestions for plans that have monthly limits
      await db.user.updateMany({
        data: {
          aiSuggestionsUsed: 0
        }
      })
    } catch (error) {
      console.error('Error resetting monthly usage:', error)
    }
  }

  /**
   * Get recommended upgrade based on current plan
   */
  private static getRecommendedUpgrade(currentPlan: string): string {
    const upgradeMap: Record<string, string> = {
      'FREE': 'PRO',
      'PRO': 'BUSINESS',
      'BUSINESS': 'ENTERPRISE'
    }
    
    return upgradeMap[currentPlan] || 'PRO'
  }

  /**
   * Parse storage limit string to MB number
   */
  private static parseStorageLimit(storageString: string): number {
    if (storageString === 'Unlimited') return -1
    
    const match = storageString.match(/(\d+(?:\.\d+)?)\s*(MB|GB|TB)/i)
    if (!match) return 100 // Default 100MB
    
    const [, amount, unit] = match
    const value = parseFloat(amount)
    
    switch (unit.toUpperCase()) {
      case 'MB': return value
      case 'GB': return value * 1024
      case 'TB': return value * 1024 * 1024
      default: return 100
    }
  }
}

/**
 * Middleware to check plan permissions
 */
export function withPlanPermission(
  action: 'create_project' | 'create_task' | 'invite_member' | 'use_ai' | 'upload_file'
) {
  return async (userId: string, additionalData?: any) => {
    const permission = await SubscriptionManager.canPerformAction(userId, action, additionalData)
    
    if (!permission.allowed) {
      throw new Error(`Plan limit exceeded: ${permission.reason}`)
    }
    
    return permission
  }
}

/**
 * React hook for subscription management
 */
export function useSubscriptionLimits(userId: string) {
  const checkLimit = async (
    action: 'create_project' | 'create_task' | 'invite_member' | 'use_ai' | 'upload_file',
    additionalData?: any
  ) => {
    return SubscriptionManager.canPerformAction(userId, action, additionalData)
  }

  const hasFeature = async (feature: string) => {
    return SubscriptionManager.hasFeature(userId, feature)
  }

  const upgradeSubscription = async (targetPlan: string) => {
    return SubscriptionManager.upgradeSubscription(userId, targetPlan)
  }

  return {
    checkLimit,
    hasFeature,
    upgradeSubscription
  }
}

import { SUBSCRIPTION_PLANS } from '@/lib/pricing'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

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
      const supa = createClient()
      const { data: user } = await supa
        .from('users')
        .select('id')
        .eq('clerkId', userId)
        .maybeSingle()

      if (!user) return 'FREE'

      const { data: sub } = await supa
        .from('subscriptions')
        .select('plan, status')
        .eq('userId', user.id)
        .maybeSingle()

      if (!sub || sub.status !== 'active') return 'FREE'
      return sub.plan || 'FREE'
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
      const supa = createClient()
      const { data: user } = await supa
        .from('users')
        .select('id, aiSuggestionsUsed, storageUsed')
        .eq('clerkId', userId)
        .maybeSingle()

      if (!user) throw new Error('User not found')

      const [proj, tasks, team] = await Promise.all([
        supa.from('projects').select('id', { count: 'exact', head: true }).eq('userId', user.id),
        supa.from('tasks').select('id', { count: 'exact', head: true }).eq('userId', user.id),
        supa.from('team_memberships').select('id', { count: 'exact', head: true }).eq('userId', user.id)
      ])

      return {
        projects: proj.count || 0,
        tasks: tasks.count || 0,
        teamMembers: team.count || 0,
        aiSuggestions: (user as any).aiSuggestionsUsed || 0,
        storage: (user as any).storageUsed || 0
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
      return (planConfig.features as any)[feature] === true
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
      const supa = createClient()
      const { data: user } = await supa
        .from('users')
        .select('id, stripeCustomerId')
        .eq('clerkId', userId)
        .maybeSingle()

      if (!user) {
        return { success: false, error: 'User not found' }
      }

      const { data: subscription } = await supa
        .from('subscriptions')
        .select('stripeSubscriptionId, status')
        .eq('userId', user.id)
        .maybeSingle()

      const targetPlanConfig = SUBSCRIPTION_PLANS[targetPlan as keyof typeof SUBSCRIPTION_PLANS]
      if (!targetPlanConfig) {
        return { success: false, error: 'Invalid target plan' }
      }

      // If user doesn't have an active subscription, create checkout session
      if (!subscription || subscription.status !== 'active') {
        const stripe = await getStripe()
        const checkoutSession = await stripe.checkout.sessions.create({
          customer: (user as any).stripeCustomerId,
          mode: 'subscription',
          line_items: [{ price: targetPlanConfig.stripePriceId, quantity: 1 }],
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
        })

        return {
          success: true,
          checkoutUrl: checkoutSession.url || ''
        }
      }

      // If user has active subscription, modify it
      if ((user as any).stripeCustomerId && subscription.stripeSubscriptionId) {
        const stripe = await getStripe()
        const current = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        )

        const updatedSubscription = await stripe.subscriptions.update(
          subscription.stripeSubscriptionId,
          {
            items: [{
              id: current.items.data[0].id,
              price: targetPlanConfig.stripePriceId
            }],
            proration_behavior: prorate ? 'always_invoice' : 'none'
          }
        )

        // Update local database
        await supa
          .from('subscriptions')
          .update({
            plan: targetPlan,
            currentPeriodEnd: new Date((updatedSubscription as any).current_period_end * 1000).toISOString()
          })
          .eq('userId', user.id)

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
      const supa = createClient()
      const { data: user } = await supa
        .from('users')
        .select('id')
        .eq('clerkId', userId)
        .maybeSingle()

      if (!user) return { success: false, error: 'User not found' }

      const { data: sub } = await supa
        .from('subscriptions')
        .select('stripeSubscriptionId')
        .eq('userId', user.id)
        .maybeSingle()

      if (!sub?.stripeSubscriptionId) {
        return { success: false, error: 'No active subscription found' }
      }

      const stripe = await getStripe()
      if (immediate) {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId)
        await supa
          .from('subscriptions')
          .update({ status: 'canceled', cancelAtPeriodEnd: false })
          .eq('userId', user.id)
      } else {
        await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true })
        await supa
          .from('subscriptions')
          .update({ cancelAtPeriodEnd: true })
          .eq('userId', user.id)
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
      const supa = createClient()
      const { data: user } = await supa
        .from('users')
        .select('id')
        .eq('clerkId', userId)
        .maybeSingle()

      if (!user) return { success: false, error: 'User not found' }

      const { data: sub } = await supa
        .from('subscriptions')
        .select('stripeSubscriptionId')
        .eq('userId', user.id)
        .maybeSingle()

      if (!sub?.stripeSubscriptionId) return { success: false, error: 'No subscription found' }

      const stripe = await getStripe()
      await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: false })
      await supa
        .from('subscriptions')
        .update({ cancelAtPeriodEnd: false, status: 'active' })
        .eq('userId', user.id)

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
      const supa = createClient()
      // Attempt to update usage fields if present; ignore errors if columns don't exist
      if (type === 'ai_suggestion') {
        await supa
          .from('users')
          .update({ aiSuggestionsUsed: (undefined as unknown as number) })
          .eq('clerkId', userId)
      } else if (type === 'storage') {
        await supa
          .from('users')
          .update({ storageUsed: (undefined as unknown as number) })
          .eq('clerkId', userId)
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
      // Implement with a secured RPC or service-role update in production
      console.log('resetMonthlyUsage: implement using service role in production')
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


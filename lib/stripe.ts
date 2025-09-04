import type Stripe from 'stripe'
import { SUBSCRIPTION_PLANS, ANNUAL_PRICING, PlanId } from './pricing'

// Lazy initialize Stripe to avoid static import during build/analysis
export async function getStripe() {
  const { default: Stripe } = await import('stripe')
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
    typescript: true
  })
}

// Stripe customer management
export class StripeCustomerManager {
  static async createCustomer(
    email: string,
    name: string,
    userId: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Customer> {
    const stripe = await getStripe()
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
        source: 'TaskWork',
        ...metadata
      }
    })
  }

  static async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const stripe = await getStripe()
      return await stripe.customers.retrieve(customerId) as Stripe.Customer
    } catch (error) {
      console.error('Failed to retrieve customer:', error)
      return null
    }
  }

  static async updateCustomer(
    customerId: string,
    updates: Partial<Stripe.CustomerUpdateParams>
  ): Promise<Stripe.Customer> {
    const stripe = await getStripe()
    return await stripe.customers.update(customerId, updates)
  }

  static async deleteCustomer(customerId: string): Promise<void> {
    const stripe = await getStripe()
    await stripe.customers.del(customerId)
  }

  static async getOrCreateCustomer(
    email: string,
    name: string,
    userId: string
  ): Promise<Stripe.Customer> {
    // First try to find existing customer
    const stripe = await getStripe()
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0]
    }

    // Create new customer if not found
    return await this.createCustomer(email, name, userId)
  }
}

// Subscription management
export class StripeSubscriptionManager {
  static async createSubscription(
    customerId: string,
    priceId: string,
    options: {
      trialDays?: number
      prorationBehavior?: 'create_prorations' | 'none'
      paymentBehavior?: 'default_incomplete' | 'pending_if_incomplete'
    } = {}
  ): Promise<Stripe.Subscription> {
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: options.paymentBehavior || 'default_incomplete',
      proration_behavior: options.prorationBehavior || 'create_prorations',
      expand: ['latest_invoice.payment_intent']
    }

    if (options.trialDays) {
      subscriptionParams.trial_period_days = options.trialDays
    }

    const stripe = await getStripe()
    return await stripe.subscriptions.create(subscriptionParams)
  }

  static async updateSubscription(
    subscriptionId: string,
    newPriceId: string,
    options: {
      prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice'
      billingCycleAnchor?: 'now' | 'unchanged'
    } = {}
  ): Promise<Stripe.Subscription> {
    const stripe = await getStripe()
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: options.prorationBehavior || 'create_prorations',
      billing_cycle_anchor: options.billingCycleAnchor || 'unchanged'
    })
  }

  static async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<Stripe.Subscription> {
    const stripe = await getStripe()
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId)
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      })
    }
  }

  static async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = await getStripe()
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    })
  }

  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      const stripe = await getStripe()
      return await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'latest_invoice.payment_intent']
      })
    } catch (error) {
      console.error('Failed to retrieve subscription:', error)
      return null
    }
  }

  static async listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    const stripe = await getStripe()
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.latest_invoice']
    })

    return subscriptions.data
  }
}

// Payment processing
export class StripePaymentManager {
  static async createPaymentIntent(
    amount: number, // in cents
    currency: string = 'usd',
    customerId?: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.PaymentIntent> {
    const stripe = await getStripe()
    return await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: {
        source: 'TaskWork',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true
      }
    })
  }

  static async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentIntent> {
    const stripe = await getStripe()
    return await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId
    })
  }

  static async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    const stripe = await getStripe()
    return await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      payment_method_types: ['card']
    })
  }

  static async refundPayment(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    const stripe = await getStripe()
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason
    })
  }
}

// Checkout session management
export class StripeCheckoutManager {
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    options: {
      successUrl?: string
      cancelUrl?: string
      trialDays?: number
      allowPromotionCodes?: boolean
      billingAddressCollection?: 'auto' | 'required'
      metadata?: Record<string, string>
    } = {}
  ): Promise<Stripe.Checkout.Session> {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: options.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: options.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      billing_address_collection: options.billingAddressCollection || 'required',
      allow_promotion_codes: options.allowPromotionCodes ?? true,
      metadata: options.metadata || {},
      subscription_data: {
        metadata: options.metadata || {}
      }
    }

    if (options.trialDays) {
      sessionParams.subscription_data!.trial_period_days = options.trialDays
    }

    const stripe = await getStripe()
    return await stripe.checkout.sessions.create(sessionParams)
  }

  static async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    try {
      const stripe = await getStripe()
      return await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'subscription.latest_invoice']
      })
    } catch (error) {
      console.error('Failed to retrieve checkout session:', error)
      return null
    }
  }

  static async createBillingPortalSession(
    customerId: string,
    returnUrl?: string
  ): Promise<Stripe.BillingPortal.Session> {
    const stripe = await getStripe()
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing`
    })
  }
}

// Usage-based billing utilities
export class StripeUsageManager {
  static async reportUsage(
    subscriptionItemId: string,
    quantity: number,
    timestamp?: number
  ): Promise<Stripe.UsageRecord> {
    const stripe = await getStripe()
    return await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: timestamp || Math.floor(Date.now() / 1000),
        action: 'set' // Use 'increment' for additive usage
      }
    )
  }

  static async getUsageSummary(
    subscriptionItemId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Stripe.UsageRecordSummary[]> {
    const stripe = await getStripe()
    const summaries = await stripe.subscriptionItems.listUsageRecordSummaries(
      subscriptionItemId,
      {
        starting_after: Math.floor(startDate.getTime() / 1000).toString(),
        ending_before: Math.floor(endDate.getTime() / 1000).toString()
      }
    )

    return summaries.data
  }
}

// Stripe webhook utilities
export class StripeWebhookManager {
  static async constructEvent(
    payload: string | Buffer,
    signature: string,
    endpointSecret: string
  ): Promise<Stripe.Event> {
    const stripe = await getStripe()
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret)
  }

  static async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    const customer = await StripeCustomerManager.getCustomer(customerId)
    
    if (customer?.metadata?.userId) {
      // Update user subscription in database
      console.log('Subscription created:', {
        userId: customer.metadata.userId,
        subscriptionId: subscription.id,
        status: subscription.status
      })
      
      // await prisma.user.update({
      //   where: { id: customer.metadata.userId },
      //   data: {
      //     stripeCustomerId: customerId,
      //     stripeSubscriptionId: subscription.id,
      //     subscriptionStatus: subscription.status,
      //     subscriptionPlanId: subscription.items.data[0].price.id
      //   }
      // })
    }
  }

  static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    const customer = await StripeCustomerManager.getCustomer(customerId)
    
    if (customer?.metadata?.userId) {
      console.log('Subscription updated:', {
        userId: customer.metadata.userId,
        subscriptionId: subscription.id,
        status: subscription.status
      })
      
      // await prisma.user.update({
      //   where: { id: customer.metadata.userId },
      //   data: {
      //     subscriptionStatus: subscription.status,
      //     subscriptionPlanId: subscription.items.data[0].price.id,
      //     subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
      //   }
      // })
    }
  }

  static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    const customer = await StripeCustomerManager.getCustomer(customerId)
    
    if (customer?.metadata?.userId) {
      console.log('Subscription cancelled:', {
        userId: customer.metadata.userId,
        subscriptionId: subscription.id
      })
      
      // await prisma.user.update({
      //   where: { id: customer.metadata.userId },
      //   data: {
      //     subscriptionStatus: 'canceled',
      //     subscriptionPlanId: null,
      //     subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
      //   }
      // })
    }
  }

  static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      const subscription = await StripeSubscriptionManager.getSubscription(
        invoice.subscription as string
      )
      
      if (subscription) {
        console.log('Payment succeeded:', {
          subscriptionId: subscription.id,
          amount: invoice.amount_paid,
          currency: invoice.currency
        })
        
        // Record successful payment
        // await prisma.payment.create({
        //   data: {
        //     userId: subscription.metadata?.userId,
        //     stripePaymentIntentId: invoice.payment_intent as string,
        //     amount: invoice.amount_paid / 100,
        //     currency: invoice.currency.toUpperCase(),
        //     status: 'SUCCESSFUL',
        //     description: `Subscription payment for ${subscription.items.data[0].price.nickname}`
        //   }
        // })
      }
    }
  }

  static async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log('Payment failed:', {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      amount: invoice.amount_due
    })

    // Handle failed payment (send email, update subscription status, etc.)
    // You might want to implement retry logic or subscription suspension
  }
}

// Stripe pricing utilities
export class StripePricingManager {
  static async createProduct(
    name: string,
    description: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Product> {
    const stripe = await getStripe()
    return await stripe.products.create({
      name,
      description,
      metadata: {
        source: 'TaskWork',
        ...metadata
      }
    })
  }

  static async createPrice(
    productId: string,
    amount: number, // in cents
    currency: string = 'usd',
    interval: 'month' | 'year' = 'month',
    metadata: Record<string, string> = {}
  ): Promise<Stripe.Price> {
    const stripe = await getStripe()
    return await stripe.prices.create({
      product: productId,
      unit_amount: amount,
      currency,
      recurring: {
        interval
      },
      metadata
    })
  }

  static async listPrices(productId?: string): Promise<Stripe.Price[]> {
    const stripe = await getStripe()
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      expand: ['data.product']
    })

    return prices.data
  }

  static async deactivatePrice(priceId: string): Promise<Stripe.Price> {
    const stripe = await getStripe()
    return await stripe.prices.update(priceId, {
      active: false
    })
  }
}

// Plan enforcement utilities
export class PlanEnforcement {
  static async getUserPlanLimits(userId: string): Promise<{
    plan: PlanId
    limits: any
    usage: any
  }> {
    // Get user's current plan from database
    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    //   include: {
    //     projects: { where: { deletedAt: null } },
    //     tasks: { where: { deletedAt: null } },
    //     _count: {
    //       select: {
    //         projects: true,
    //         tasks: true,
    //         teamMemberships: true
    //       }
    //     }
    //   }
    // })

    // Placeholder implementation
    const plan: PlanId = 'FREE'
    const planLimits = SUBSCRIPTION_PLANS[plan].features

    return {
      plan,
      limits: planLimits,
      usage: {
        projects: 0, // user._count.projects
        tasks: 0, // user._count.tasks
        teamMembers: 0, // user._count.teamMemberships
        aiSuggestions: 0, // Get from usage tracking
        storage: 0 // Calculate from file uploads
      }
    }
  }

  static async canCreateProject(userId: string): Promise<{
    allowed: boolean
    reason?: string
    upgradeRequired?: PlanId
  }> {
    const { plan, limits, usage } = await this.getUserPlanLimits(userId)

    if (limits.maxProjects === -1) {
      return { allowed: true }
    }

    if (usage.projects >= limits.maxProjects) {
      const recommendedPlan = this.getRecommendedUpgrade(plan, 'projects')
      return {
        allowed: false,
        reason: `You've reached your project limit (${limits.maxProjects}). Upgrade to create more projects.`,
        upgradeRequired: recommendedPlan
      }
    }

    return { allowed: true }
  }

  static async canCreateTask(userId: string): Promise<{
    allowed: boolean
    reason?: string
    upgradeRequired?: PlanId
  }> {
    const { plan, limits, usage } = await this.getUserPlanLimits(userId)

    if (limits.maxTasks === -1) {
      return { allowed: true }
    }

    if (usage.tasks >= limits.maxTasks) {
      const recommendedPlan = this.getRecommendedUpgrade(plan, 'tasks')
      return {
        allowed: false,
        reason: `You've reached your task limit (${limits.maxTasks}). Upgrade to create more tasks.`,
        upgradeRequired: recommendedPlan
      }
    }

    return { allowed: true }
  }

  static async canInviteTeamMember(userId: string): Promise<{
    allowed: boolean
    reason?: string
    upgradeRequired?: PlanId
  }> {
    const { plan, limits, usage } = await this.getUserPlanLimits(userId)

    if (limits.maxTeamMembers === -1) {
      return { allowed: true }
    }

    if (usage.teamMembers >= limits.maxTeamMembers) {
      const recommendedPlan = this.getRecommendedUpgrade(plan, 'teamMembers')
      return {
        allowed: false,
        reason: `You've reached your team member limit (${limits.maxTeamMembers}). Upgrade to invite more team members.`,
        upgradeRequired: recommendedPlan
      }
    }

    return { allowed: true }
  }

  static async canUseAISuggestions(userId: string): Promise<{
    allowed: boolean
    remaining: number
    upgradeRequired?: PlanId
  }> {
    const { plan, limits, usage } = await this.getUserPlanLimits(userId)

    if (limits.aiSuggestions === -1) {
      return { allowed: true, remaining: -1 }
    }

    const remaining = limits.aiSuggestions - usage.aiSuggestions

    if (remaining <= 0) {
      const recommendedPlan = this.getRecommendedUpgrade(plan, 'aiSuggestions')
      return {
        allowed: false,
        remaining: 0,
        upgradeRequired: recommendedPlan
      }
    }

    return { allowed: true, remaining }
  }

  private static getRecommendedUpgrade(currentPlan: PlanId, feature: string): PlanId {
    const planOrder: PlanId[] = ['FREE', 'PERSONAL', 'PRO', 'BUSINESS', 'ENTERPRISE']
    const currentIndex = planOrder.indexOf(currentPlan)
    
    // Recommend next tier up
    if (currentIndex < planOrder.length - 1) {
      return planOrder[currentIndex + 1]
    }
    
    return 'ENTERPRISE'
  }
}

// Stripe analytics and reporting
export class StripeAnalyticsManager {
  static async getRevenueMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRevenue: number
    newSubscriptions: number
    canceledSubscriptions: number
    activeSubscriptions: number
    churnRate: number
    avgRevenuePerUser: number
  }> {
    // Get invoices for the period
    const stripe = await getStripe()
    const invoices = await stripe.invoices.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000)
      },
      status: 'paid',
      limit: 100
    })

    // Get subscriptions data
    const activeSubscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100
    })

    const totalRevenue = invoices.data.reduce((sum, invoice) => sum + invoice.amount_paid, 0) / 100
    const activeCount = activeSubscriptions.data.length

    return {
      totalRevenue,
      newSubscriptions: 0, // Calculate from subscription creation events
      canceledSubscriptions: 0, // Calculate from cancellation events
      activeSubscriptions: activeCount,
      churnRate: 0, // Calculate based on cancellations vs active
      avgRevenuePerUser: activeCount > 0 ? totalRevenue / activeCount : 0
    }
  }

  static async getSubscriptionBreakdown(): Promise<{
    [key in PlanId]: {
      count: number
      revenue: number
      percentage: number
    }
  }> {
    // In production, query actual subscription data
    return {
      FREE: { count: 0, revenue: 0, percentage: 0 },
      PERSONAL: { count: 0, revenue: 0, percentage: 0 },
      PRO: { count: 0, revenue: 0, percentage: 0 },
      BUSINESS: { count: 0, revenue: 0, percentage: 0 },
      ENTERPRISE: { count: 0, revenue: 0, percentage: 0 }
    }
  }

  static async getPlanUpgradeAnalytics(): Promise<{
    upgrades: Array<{
      fromPlan: PlanId
      toPlan: PlanId
      count: number
      revenue: number
    }>
    downgrades: Array<{
      fromPlan: PlanId
      toPlan: PlanId
      count: number
      lostRevenue: number
    }>
  }> {
    // Analyze plan change events from webhook data
    return {
      upgrades: [],
      downgrades: []
    }
  }
}

// Trial and promotional utilities
export class StripePromotionManager {
  static async createPromotionCode(
    couponId: string,
    code: string,
    options: {
      maxRedemptions?: number
      expiresAt?: Date
      firstTimeTransaction?: boolean
      minimumAmount?: number
    } = {}
  ): Promise<Stripe.PromotionCode> {
    const stripe = await getStripe()
    return await stripe.promotionCodes.create({
      coupon: couponId,
      code,
      max_redemptions: options.maxRedemptions,
      expires_at: options.expiresAt ? Math.floor(options.expiresAt.getTime() / 1000) : undefined,
      restrictions: {
        first_time_transaction: options.firstTimeTransaction,
        minimum_amount: options.minimumAmount ? options.minimumAmount * 100 : undefined, // Convert to cents
        minimum_amount_currency: 'usd'
      }
    })
  }

  static async createCoupon(
    percentOff: number,
    duration: 'once' | 'repeating' | 'forever',
    options: {
      durationInMonths?: number
      maxRedemptions?: number
      name?: string
    } = {}
  ): Promise<Stripe.Coupon> {
    const stripe = await getStripe()
    return await stripe.coupons.create({
      percent_off: percentOff,
      duration,
      duration_in_months: options.durationInMonths,
      max_redemptions: options.maxRedemptions,
      name: options.name
    })
  }

  static async startTrialPeriod(
    userId: string,
    planId: PlanId,
    trialDays: number = 14
  ): Promise<{ success: boolean; subscriptionId?: string }> {
    try {
      // Get or create Stripe customer
      // const user = await getUserById(userId)
      // const customer = await StripeCustomerManager.getOrCreateCustomer(
      //   user.email,
      //   user.name,
      //   userId
      // )

      // Create subscription with trial
      const plan = SUBSCRIPTION_PLANS[planId]
      if (!plan.stripePriceId) {
        throw new Error('Plan does not support subscriptions')
      }

      // const subscription = await StripeSubscriptionManager.createSubscription(
      //   customer.id,
      //   plan.stripePriceId,
      //   { trialDays }
      // )

      return { success: true, subscriptionId: 'sub_trial_123' }
    } catch (error) {
      console.error('Trial creation failed:', error)
      return { success: false }
    }
  }
}

// Stripe utilities for export
export const StripeHelpers = {
  formatPrice: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  },

  formatStripeAmount: (stripeAmount: number): number => {
    return stripeAmount / 100 // Convert from cents to dollars
  },

  formatAmountForStripe: (amount: number): number => {
    return Math.round(amount * 100) // Convert to cents
  },

  getPlanDisplayName: (stripePriceId: string): string => {
    const planInfo = Object.values({ ...SUBSCRIPTION_PLANS, ...ANNUAL_PRICING })
      .find(plan => plan.stripePriceId === stripePriceId)
    
    return planInfo?.name || 'Unknown Plan'
  },

  calculateProration: (
    currentPlan: PlanId,
    newPlan: PlanId,
    daysRemaining: number,
    billingPeriod: 'month' | 'year' = 'month'
  ): number => {
    const current = billingPeriod === 'year' 
      ? ANNUAL_PRICING[currentPlan as keyof typeof ANNUAL_PRICING] || SUBSCRIPTION_PLANS[currentPlan]
      : SUBSCRIPTION_PLANS[currentPlan]
    
    const target = billingPeriod === 'year'
      ? ANNUAL_PRICING[newPlan as keyof typeof ANNUAL_PRICING] || SUBSCRIPTION_PLANS[newPlan]
      : SUBSCRIPTION_PLANS[newPlan]

    const dailyRateCurrent = (current?.price || 0) / (billingPeriod === 'year' ? 365 : 30)
    const dailyRateNew = (target?.price || 0) / (billingPeriod === 'year' ? 365 : 30)
    
    const refundAmount = dailyRateCurrent * daysRemaining
    const chargeAmount = dailyRateNew * daysRemaining
    
    return chargeAmount - refundAmount
  },

  getNextBillingDate: (subscription: any): Date => {
    return new Date((subscription.current_period_end || 0) * 1000)
  },

  isSubscriptionActive: (subscription: any): boolean => {
    return ['active', 'trialing'].includes(subscription.status)
  },

  getSubscriptionStatus: (subscription: any): {
    status: string
    displayStatus: string
    canUpgrade: boolean
    canDowngrade: boolean
    canCancel: boolean
  } => {
    const status = subscription.status
    
    const statusMap = {
      active: {
        displayStatus: 'Active',
        canUpgrade: true,
        canDowngrade: true,
        canCancel: true
      },
      trialing: {
        displayStatus: 'Trial',
        canUpgrade: true,
        canDowngrade: false,
        canCancel: true
      },
      past_due: {
        displayStatus: 'Payment Past Due',
        canUpgrade: false,
        canDowngrade: false,
        canCancel: true
      },
      canceled: {
        displayStatus: 'Canceled',
        canUpgrade: true,
        canDowngrade: false,
        canCancel: false
      },
      unpaid: {
        displayStatus: 'Unpaid',
        canUpgrade: false,
        canDowngrade: false,
        canCancel: true
      }
    }

    return {
      status,
      ...(statusMap[status as keyof typeof statusMap] || statusMap.canceled)
    }
  }
}

// Main StripeManager class combining all functionality
export class StripeManager {
  static getStripe = getStripe
  static customers = StripeCustomerManager
  static subscriptions = StripeSubscriptionManager
  static payments = StripePaymentManager
  static checkout = StripeCheckoutManager
  static usage = StripeUsageManager
  static webhooks = StripeWebhookManager
  static pricing = StripePricingManager
  static analytics = StripeAnalyticsManager
  static promotions = StripePromotionManager
  static helpers = StripeHelpers
  static enforcement = PlanEnforcement

  // Convenience methods
  static async createCustomer(...args: Parameters<typeof StripeCustomerManager.createCustomer>) {
    return StripeCustomerManager.createCustomer(...args)
  }

  static async createCheckoutSession(...args: Parameters<typeof StripeCheckoutManager.createCheckoutSession>) {
    return StripeCheckoutManager.createCheckoutSession(...args)
  }

  static async createBillingPortalSession(...args: Parameters<typeof StripeCheckoutManager.createBillingPortalSession>) {
    return StripeCheckoutManager.createBillingPortalSession(...args)
  }
}


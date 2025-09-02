// TaskGrid Competitive Pricing Strategy
// Based on analysis of Asana, Notion, ClickUp, Monday.com, Trello pricing

export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for individuals getting started',
    price: 0,
    billingPeriod: 'forever',
    stripeProductId: null,
    stripePriceId: null,
    features: {
      maxProjects: 3,
      maxTasks: 50,
      maxTeamMembers: 1,
      aiSuggestions: 5, // per month
      storage: '100MB',
      integrations: false,
      analytics: false,
      customFields: false,
      timeTracking: false,
      advancedReporting: false,
      prioritySupport: false,
      automation: false,
      guestAccess: false
    },
    popular: false
  },

  PERSONAL: {
    id: 'personal',
    name: 'Personal',
    description: 'For individuals and freelancers',
    price: 6.99,
    originalPrice: 8.99, // Show discount
    billingPeriod: 'month',
    stripeProductId: 'prod_personal', // Replace with actual Stripe product ID
    stripePriceId: 'price_personal_monthly', // Replace with actual Stripe price ID
    features: {
      maxProjects: 20,
      maxTasks: 1000,
      maxTeamMembers: 1,
      aiSuggestions: 100, // per month
      storage: '5GB',
      integrations: true,
      analytics: true,
      customFields: true,
      timeTracking: true,
      advancedReporting: false,
      prioritySupport: false,
      automation: true,
      guestAccess: false
    },
    popular: false
  },

  PRO: {
    id: 'pro',
    name: 'Pro',
    description: 'For small teams and growing businesses',
    price: 12.99,
    originalPrice: 15.99,
    billingPeriod: 'month',
    stripeProductId: 'prod_pro', // Replace with actual Stripe product ID
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: {
      maxProjects: 100,
      maxTasks: 10000,
      maxTeamMembers: 10,
      aiSuggestions: 500, // per month
      storage: '50GB',
      integrations: true,
      analytics: true,
      customFields: true,
      timeTracking: true,
      advancedReporting: true,
      prioritySupport: true,
      automation: true,
      guestAccess: true
    },
    popular: true // Most popular plan
  },

  BUSINESS: {
    id: 'business',
    name: 'Business',
    description: 'For larger teams and organizations',
    price: 24.99,
    originalPrice: 29.99,
    billingPeriod: 'month',
    stripeProductId: 'prod_business', // Replace with actual Stripe product ID
    stripePriceId: 'price_business_monthly', // Replace with actual Stripe price ID
    features: {
      maxProjects: 500,
      maxTasks: 50000,
      maxTeamMembers: 50,
      aiSuggestions: 2000, // per month
      storage: '200GB',
      integrations: true,
      analytics: true,
      customFields: true,
      timeTracking: true,
      advancedReporting: true,
      prioritySupport: true,
      automation: true,
      guestAccess: true,
      adminDashboard: true,
      sso: true,
      auditLogs: true
    },
    popular: false
  },

  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with advanced needs',
    price: 49.99,
    originalPrice: 59.99,
    billingPeriod: 'month',
    stripeProductId: 'prod_enterprise', // Replace with actual Stripe product ID
    stripePriceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    features: {
      maxProjects: -1, // Unlimited
      maxTasks: -1, // Unlimited
      maxTeamMembers: -1, // Unlimited
      aiSuggestions: -1, // Unlimited
      storage: '1TB',
      integrations: true,
      analytics: true,
      customFields: true,
      timeTracking: true,
      advancedReporting: true,
      prioritySupport: true,
      automation: true,
      guestAccess: true,
      adminDashboard: true,
      sso: true,
      auditLogs: true,
      customIntegrations: true,
      dedicatedSupport: true,
      onPremise: true
    },
    popular: false,
    contactSales: true
  }
} as const

// Annual pricing with 20% discount
export const ANNUAL_PRICING = {
  PERSONAL: {
    ...SUBSCRIPTION_PLANS.PERSONAL,
    price: 5.59, // 20% off monthly
    originalPrice: 7.19,
    billingPeriod: 'year',
    stripePriceId: 'price_personal_yearly',
    annualSavings: 16.80 // $6.99 * 12 - $5.59 * 12
  },
  PRO: {
    ...SUBSCRIPTION_PLANS.PRO,
    price: 10.39, // 20% off monthly
    originalPrice: 12.79,
    billingPeriod: 'year',
    stripePriceId: 'price_pro_yearly',
    annualSavings: 31.20
  },
  BUSINESS: {
    ...SUBSCRIPTION_PLANS.BUSINESS,
    price: 19.99, // 20% off monthly
    originalPrice: 23.99,
    billingPeriod: 'year',
    stripePriceId: 'price_business_yearly',
    annualSavings: 60.00
  },
  ENTERPRISE: {
    ...SUBSCRIPTION_PLANS.ENTERPRISE,
    price: 39.99, // 20% off monthly
    originalPrice: 47.99,
    billingPeriod: 'year',
    stripePriceId: 'price_enterprise_yearly',
    annualSavings: 120.00
  }
} as const

// Competitive comparison data
export const COMPETITOR_PRICING = {
  asana: {
    free: 0,
    premium: 10.99,
    business: 24.99,
    enterprise: 'Contact Sales'
  },
  notion: {
    free: 0,
    plus: 8.00,
    business: 15.00,
    enterprise: 'Contact Sales'
  },
  clickup: {
    free: 0,
    unlimited: 7.00,
    business: 12.00,
    enterprise: 19.00
  },
  monday: {
    free: 0,
    basic: 8.00,
    standard: 10.00,
    pro: 16.00,
    enterprise: 'Contact Sales'
  }
}

// Plan comparison utilities
export const PlanUtils = {
  getPlanByStripeId(stripePriceId: string) {
    const allPlans = { ...SUBSCRIPTION_PLANS, ...ANNUAL_PRICING }
    
    for (const [key, plan] of Object.entries(allPlans)) {
      if (plan.stripePriceId === stripePriceId) {
        return { planKey: key, plan }
      }
    }
    
    return null
  },

  canUserAccess(userPlan: keyof typeof SUBSCRIPTION_PLANS, feature: string): boolean {
    const plan = SUBSCRIPTION_PLANS[userPlan]
    return plan?.features[feature as keyof typeof plan.features] === true
  },

  hasFeatureLimit(userPlan: keyof typeof SUBSCRIPTION_PLANS, feature: string): boolean {
    const plan = SUBSCRIPTION_PLANS[userPlan]
    const featureValue = plan?.features[feature as keyof typeof plan.features]
    return typeof featureValue === 'number' && featureValue > 0
  },

  getFeatureLimit(userPlan: keyof typeof SUBSCRIPTION_PLANS, feature: string): number {
    const plan = SUBSCRIPTION_PLANS[userPlan]
    const featureValue = plan?.features[feature as keyof typeof plan.features]
    
    if (typeof featureValue === 'number') {
      return featureValue === -1 ? Infinity : featureValue
    }
    
    return 0
  },

  calculateUpgradeCost(
    currentPlan: keyof typeof SUBSCRIPTION_PLANS,
    targetPlan: keyof typeof SUBSCRIPTION_PLANS,
    billingPeriod: 'month' | 'year' = 'month'
  ): number {
    const current = billingPeriod === 'year' 
      ? ANNUAL_PRICING[currentPlan] || SUBSCRIPTION_PLANS[currentPlan]
      : SUBSCRIPTION_PLANS[currentPlan]
    
    const target = billingPeriod === 'year'
      ? ANNUAL_PRICING[targetPlan] || SUBSCRIPTION_PLANS[targetPlan]
      : SUBSCRIPTION_PLANS[targetPlan]

    return (target?.price || 0) - (current?.price || 0)
  },

  getRecommendedPlan(
    projectCount: number,
    taskCount: number,
    teamSize: number
  ): keyof typeof SUBSCRIPTION_PLANS {
    if (projectCount <= 3 && taskCount <= 50 && teamSize <= 1) {
      return 'FREE'
    }
    
    if (projectCount <= 20 && taskCount <= 1000 && teamSize <= 1) {
      return 'PERSONAL'
    }
    
    if (projectCount <= 100 && taskCount <= 10000 && teamSize <= 10) {
      return 'PRO'
    }
    
    if (projectCount <= 500 && taskCount <= 50000 && teamSize <= 50) {
      return 'BUSINESS'
    }
    
    return 'ENTERPRISE'
  }
}

// Feature descriptions for marketing
export const FEATURE_DESCRIPTIONS = {
  maxProjects: 'Number of active projects you can manage',
  maxTasks: 'Total tasks across all projects',
  maxTeamMembers: 'Team members who can collaborate',
  aiSuggestions: 'AI-powered task suggestions and insights',
  storage: 'File storage for attachments and documents',
  integrations: 'Connect with external tools and services',
  analytics: 'Detailed performance and productivity analytics',
  customFields: 'Create custom task and project fields',
  timeTracking: 'Built-in time tracking and reporting',
  advancedReporting: 'Custom reports and data exports',
  prioritySupport: '24/7 priority customer support',
  automation: 'Automated workflows and task routing',
  guestAccess: 'Invite external collaborators',
  adminDashboard: 'Advanced admin control panel',
  sso: 'Single sign-on integration',
  auditLogs: 'Comprehensive audit trails',
  customIntegrations: 'Custom API integrations',
  dedicatedSupport: 'Dedicated customer success manager',
  onPremise: 'On-premise deployment option'
}

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  successUrl: process.env.NEXT_PUBLIC_APP_URL + '/payment/success',
  cancelUrl: process.env.NEXT_PUBLIC_APP_URL + '/pricing',
  customerPortalUrl: process.env.NEXT_PUBLIC_APP_URL + '/billing'
}

// Plan upgrade/downgrade rules
export const PLAN_CHANGE_RULES = {
  // Immediate upgrades (prorated)
  immediateUpgrades: ['FREE', 'PERSONAL', 'PRO'],
  
  // Downgrades effective at end of billing period
  endOfPeriodDowngrades: ['PRO', 'BUSINESS', 'ENTERPRISE'],
  
  // Plans that require sales contact
  salesContactRequired: ['ENTERPRISE'],
  
  // Plans that allow self-service cancellation
  selfServiceCancellation: ['PERSONAL', 'PRO'],
  
  // Minimum commitment periods
  minimumCommitment: {
    PERSONAL: 0, // No minimum
    PRO: 0,
    BUSINESS: 1, // 1 month
    ENTERPRISE: 12 // 12 months
  }
}

export type PlanId = keyof typeof SUBSCRIPTION_PLANS
export type PlanFeatures = typeof SUBSCRIPTION_PLANS[PlanId]['features']

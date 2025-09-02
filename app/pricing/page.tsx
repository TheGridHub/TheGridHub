'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Check, Star, Zap, Shield, Users, BarChart3, Crown } from 'lucide-react'
import { SUBSCRIPTION_PLANS, ANNUAL_PRICING, FEATURE_DESCRIPTIONS } from '@/lib/pricing'
import { StripeHelpers } from '@/lib/stripe'

export default function PricingPage() {
  const { user } = useUser()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const plans = billingPeriod === 'yearly' ? 
    { ...SUBSCRIPTION_PLANS, ...ANNUAL_PRICING } : 
    SUBSCRIPTION_PLANS

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') return

    setIsLoading(planId)

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
          userId: user?.id
        })
      })

      const { url, error } = await response.json()

      if (error) {
        console.error('Checkout error:', error)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your productivity needs. Start free, upgrade anytime.
          </p>

          {/* Billing Period Toggle */}
          <div className="inline-flex bg-slate-200 rounded-lg p-1 mb-8">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {Object.entries(plans).map(([key, plan]) => (
            <PricingCard
              key={key}
              plan={plan}
              planKey={key}
              isLoading={isLoading === key}
              onSelect={() => handlePlanSelect(key)}
              currentUserPlan={user?.publicMetadata?.subscription || 'free'}
              billingPeriod={billingPeriod}
            />
          ))}
        </div>

        {/* Feature Comparison Table */}
        <FeatureComparisonTable plans={plans} />

        {/* FAQ Section */}
        <FAQSection />

        {/* Competitive Comparison */}
        <CompetitiveComparison />
      </div>
    </div>
  )
}

function PricingCard({ 
  plan, 
  planKey, 
  isLoading, 
  onSelect, 
  currentUserPlan,
  billingPeriod 
}: {
  plan: any
  planKey: string
  isLoading: boolean
  onSelect: () => void
  currentUserPlan: string
  billingPeriod: 'monthly' | 'yearly'
}) {
  const isCurrentPlan = currentUserPlan === planKey
  const isUpgrade = getPlanOrder().indexOf(planKey) > getPlanOrder().indexOf(currentUserPlan)
  const isEnterprise = planKey === 'enterprise'

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@taskgrid.com?subject=Enterprise Plan Inquiry'
  }

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
      plan.popular 
        ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50 scale-105' 
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}

      {/* Plan Icon */}
      <div className="pt-8 pb-6 px-6">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
          planKey === 'free' ? 'bg-slate-100' :
          planKey === 'personal' ? 'bg-emerald-100' :
          planKey === 'pro' ? 'bg-blue-100' :
          planKey === 'business' ? 'bg-purple-100' :
          'bg-orange-100'
        }`}>
          {planKey === 'free' && <Users className="w-6 h-6 text-slate-600" />}
          {planKey === 'personal' && <Zap className="w-6 h-6 text-emerald-600" />}
          {planKey === 'pro' && <BarChart3 className="w-6 h-6 text-blue-600" />}
          {planKey === 'business' && <Shield className="w-6 h-6 text-purple-600" />}
          {planKey === 'enterprise' && <Crown className="w-6 h-6 text-orange-600" />}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
        <p className="text-slate-600 text-sm mb-6">{plan.description}</p>

        {/* Pricing */}
        <div className="mb-6">
          {plan.price === 0 ? (
            <div className="text-3xl font-bold text-slate-900">Free</div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {StripeHelpers.formatPrice(plan.price)}
                </span>
                <span className="text-slate-600">
                  /{billingPeriod === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              
              {plan.originalPrice && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500 line-through">
                    {StripeHelpers.formatPrice(plan.originalPrice)}
                  </span>
                  <span className="text-sm text-emerald-600 font-medium">
                    Save {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
                  </span>
                </div>
              )}

              {billingPeriod === 'yearly' && plan.annualSavings && (
                <div className="text-sm text-emerald-600 font-medium mt-1">
                  Save {StripeHelpers.formatPrice(plan.annualSavings)} annually
                </div>
              )}
            </>
          )}
        </div>

        {/* CTA Button */}
        {isCurrentPlan ? (
          <div className="w-full py-2 px-4 bg-slate-100 text-slate-600 rounded-lg text-center font-medium">
            Current Plan
          </div>
        ) : isEnterprise ? (
          <button
            onClick={handleContactSales}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Contact Sales
          </button>
        ) : (
          <button
            onClick={onSelect}
            disabled={isLoading}
            className={`w-full font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              plan.popular
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <>
                {plan.price === 0 ? 'Get Started' : isUpgrade ? 'Upgrade Now' : 'Downgrade'}
              </>
            )}
          </button>
        )}
      </div>

      {/* Features */}
      <div className="px-6 pb-6">
        <div className="space-y-3">
          {/* Key Features */}
          <FeatureItem 
            included={true}
            text={plan.features.maxProjects === -1 
              ? 'Unlimited projects' 
              : `${plan.features.maxProjects} projects`}
          />
          <FeatureItem 
            included={true}
            text={plan.features.maxTasks === -1 
              ? 'Unlimited tasks' 
              : `${plan.features.maxTasks} tasks`}
          />
          <FeatureItem 
            included={true}
            text={plan.features.maxTeamMembers === -1 
              ? 'Unlimited team members' 
              : `${plan.features.maxTeamMembers} team member${plan.features.maxTeamMembers !== 1 ? 's' : ''}`}
          />
          <FeatureItem 
            included={plan.features.aiSuggestions !== false}
            text={plan.features.aiSuggestions === -1 
              ? 'Unlimited AI suggestions' 
              : `${plan.features.aiSuggestions} AI suggestions/month`}
          />
          <FeatureItem 
            included={true}
            text={`${plan.features.storage} storage`}
          />
          <FeatureItem 
            included={plan.features.integrations}
            text="Third-party integrations"
          />
          <FeatureItem 
            included={plan.features.analytics}
            text="Analytics & reporting"
          />
          <FeatureItem 
            included={plan.features.timeTracking}
            text="Time tracking"
          />
          
          {/* Premium Features */}
          {(planKey !== 'free' && planKey !== 'personal') && (
            <>
              <FeatureItem 
                included={plan.features.advancedReporting}
                text="Advanced reporting"
              />
              <FeatureItem 
                included={plan.features.prioritySupport}
                text="Priority support"
              />
            </>
          )}

          {/* Enterprise Features */}
          {(planKey === 'business' || planKey === 'enterprise') && (
            <>
              <FeatureItem 
                included={plan.features.adminDashboard}
                text="Admin dashboard"
              />
              <FeatureItem 
                included={plan.features.sso}
                text="Single sign-on (SSO)"
              />
              <FeatureItem 
                included={plan.features.auditLogs}
                text="Audit logs"
              />
            </>
          )}

          {/* Enterprise Only */}
          {planKey === 'enterprise' && (
            <>
              <FeatureItem 
                included={plan.features.customIntegrations}
                text="Custom integrations"
              />
              <FeatureItem 
                included={plan.features.dedicatedSupport}
                text="Dedicated support"
              />
              <FeatureItem 
                included={plan.features.onPremise}
                text="On-premise deployment"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ included, text }: { included: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
        included ? 'bg-emerald-100' : 'bg-slate-100'
      }`}>
        {included ? (
          <Check className="w-3 h-3 text-emerald-600" />
        ) : (
          <div className="w-2 h-2 bg-slate-400 rounded-full" />
        )}
      </div>
      <span className={`text-sm ${included ? 'text-slate-700' : 'text-slate-400'}`}>
        {text}
      </span>
    </div>
  )
}

function FeatureComparisonTable({ plans }: { plans: any }) {
  const features = [
    { key: 'maxProjects', name: 'Projects', category: 'Core Features' },
    { key: 'maxTasks', name: 'Tasks', category: 'Core Features' },
    { key: 'maxTeamMembers', name: 'Team Members', category: 'Core Features' },
    { key: 'storage', name: 'Storage', category: 'Core Features' },
    { key: 'aiSuggestions', name: 'AI Suggestions', category: 'AI Features' },
    { key: 'integrations', name: 'Integrations', category: 'Productivity' },
    { key: 'analytics', name: 'Analytics', category: 'Productivity' },
    { key: 'customFields', name: 'Custom Fields', category: 'Productivity' },
    { key: 'timeTracking', name: 'Time Tracking', category: 'Productivity' },
    { key: 'automation', name: 'Automation', category: 'Advanced' },
    { key: 'advancedReporting', name: 'Advanced Reporting', category: 'Advanced' },
    { key: 'prioritySupport', name: 'Priority Support', category: 'Support' },
    { key: 'guestAccess', name: 'Guest Access', category: 'Collaboration' },
    { key: 'adminDashboard', name: 'Admin Dashboard', category: 'Enterprise' },
    { key: 'sso', name: 'Single Sign-On', category: 'Enterprise' },
    { key: 'auditLogs', name: 'Audit Logs', category: 'Enterprise' }
  ]

  const categories = [...new Set(features.map(f => f.category))]

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
      <div className="px-6 py-8 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
          Compare All Features
        </h2>
        <p className="text-slate-600 text-center">
          See exactly what's included in each plan
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-4 px-6 font-medium text-slate-900">Features</th>
              {Object.entries(plans).map(([key, plan]) => (
                <th key={key} className="text-center py-4 px-4 font-medium text-slate-900 min-w-[120px]">
                  <div className="flex flex-col">
                    <span>{plan.name}</span>
                    <span className="text-sm font-normal text-slate-600">
                      {plan.price === 0 ? 'Free' : StripeHelpers.formatPrice(plan.price)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <React.Fragment key={category}>
                <tr>
                  <td colSpan={Object.keys(plans).length + 1} className="bg-slate-50 py-3 px-6 text-sm font-medium text-slate-700 border-t">
                    {category}
                  </td>
                </tr>
                {features.filter(f => f.category === category).map(feature => (
                  <tr key={feature.key} className="border-b border-slate-100">
                    <td className="py-4 px-6 text-sm text-slate-700">
                      <div>
                        {feature.name}
                        <div className="text-xs text-slate-500 mt-1">
                          {FEATURE_DESCRIPTIONS[feature.key as keyof typeof FEATURE_DESCRIPTIONS]}
                        </div>
                      </div>
                    </td>
                    {Object.entries(plans).map(([key, plan]) => (
                      <td key={key} className="py-4 px-4 text-center">
                        <FeatureCell 
                          value={plan.features[feature.key]} 
                          featureKey={feature.key}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FeatureCell({ value, featureKey }: { value: any; featureKey: string }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-emerald-600 mx-auto" />
  }
  
  if (value === false) {
    return <div className="w-2 h-2 bg-slate-300 rounded-full mx-auto" />
  }
  
  if (value === -1) {
    return <span className="text-sm font-medium text-slate-900">Unlimited</span>
  }
  
  if (typeof value === 'number') {
    return <span className="text-sm text-slate-700">{value.toLocaleString()}</span>
  }
  
  if (typeof value === 'string') {
    return <span className="text-sm text-slate-700">{value}</span>
  }
  
  return <div className="w-2 h-2 bg-slate-300 rounded-full mx-auto" />
}

function FAQSection() {
  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer: "Yes! You can upgrade your plan immediately and the change will be prorated. Downgrades take effect at the end of your current billing cycle."
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data remains accessible for 30 days after cancellation. You can export your data at any time or reactivate your subscription to restore full access."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all paid plans. Contact support if you're not satisfied within the first 14 days."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial."
    },
    {
      question: "How secure is my data?",
      answer: "We use enterprise-grade encryption, regular security audits, and comply with SOC 2 Type II, GDPR, and other security standards."
    },
    {
      question: "Can I get a custom plan for my organization?",
      answer: "Absolutely! Contact our sales team for custom Enterprise plans with specific feature requirements and volume discounts."
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
        Frequently Asked Questions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {faqs.map((faq, index) => (
          <div key={index} className="space-y-3">
            <h3 className="font-semibold text-slate-900">{faq.question}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CompetitiveComparison() {
  const competitors = [
    { name: 'Asana', personal: '$10.99', business: '$24.99', features: 'Basic automation' },
    { name: 'Notion', personal: '$8.00', business: '$15.00', features: 'Wiki + tasks' },
    { name: 'ClickUp', personal: '$7.00', business: '$12.00', features: 'All-in-one workspace' },
    { name: 'Monday.com', personal: '$8.00', business: '$16.00', features: 'Visual project management' },
    { name: 'TaskGrid', personal: '$6.99', business: '$12.99', features: 'AI-powered + security' }
  ]

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-xl p-8 text-white">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">How We Compare</h2>
        <p className="text-slate-300">
          TaskGrid offers the best value with enterprise-grade security and AI features
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-200">Platform</th>
              <th className="text-center py-3 px-4 text-slate-200">Personal</th>
              <th className="text-center py-3 px-4 text-slate-200">Business</th>
              <th className="text-left py-3 px-4 text-slate-200">Key Features</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((competitor, index) => (
              <tr 
                key={competitor.name} 
                className={`border-b border-slate-700 ${
                  competitor.name === 'TaskGrid' ? 'bg-slate-700/50' : ''
                }`}
              >
                <td className="py-3 px-4 font-medium">
                  {competitor.name === 'TaskGrid' && (
                    <span className="inline-flex items-center gap-1">
                      <Crown className="w-4 h-4 text-yellow-400" />
                    </span>
                  )}
                  {competitor.name}
                </td>
                <td className="py-3 px-4 text-center">{competitor.personal}</td>
                <td className="py-3 px-4 text-center">{competitor.business}</td>
                <td className="py-3 px-4 text-slate-300">{competitor.features}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-6">
        <p className="text-slate-300 text-sm">
          * Pricing comparison as of {new Date().toLocaleDateString()}. Competitor pricing may vary.
        </p>
      </div>
    </div>
  )
}

function getPlanOrder(): string[] {
  return ['free', 'personal', 'pro', 'business', 'enterprise']
}

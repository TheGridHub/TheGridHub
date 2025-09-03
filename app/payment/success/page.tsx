'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { CheckCircle, Loader2, ArrowRight, Crown, Gift, Calendar } from 'lucide-react'
import Link from 'next/link'
// import { StripeHelpers } from '@/lib/stripe'

// Temporary helper function
const formatPrice = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount)
}

interface SessionData {
  id: string
  status: string
  customerEmail: string
  subscription: any
  amountTotal: number
  currency: string
  metadata: {
    planId: string
    billingPeriod: string
    userId: string
  }
}

function PaymentSuccessPageContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionId = searchParams?.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setLoading(false)
      return
    }

    fetchSessionData()
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/stripe/create-checkout?session_id=${sessionId}`)
      const data = await response.json()

      if (response.ok) {
        setSessionData(data)
      } else {
        setError(data.error || 'Failed to retrieve session')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  if (!sessionData) {
    return <ErrorState error="Session data not found" />
  }

  return <SuccessState sessionData={sessionData} user={user} />
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentSuccessPageContent />
    </Suspense>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Processing Your Payment
        </h1>
        <p className="text-slate-600">
          Please wait while we confirm your subscription...
        </p>
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-red-600 text-2xl">×</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Payment Error
        </h1>
        <p className="text-slate-600 mb-6">
          {error}
        </p>
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Back to Pricing
          </Link>
          <Link
            href="/contact"
            className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}

function SuccessState({ sessionData, user }: { sessionData: SessionData; user: any }) {
  const { planId, billingPeriod } = sessionData.metadata
  const isYearly = billingPeriod === 'yearly'
  const amount = sessionData.amountTotal ? sessionData.amountTotal / 100 : 0

  const planNames = {
    personal: 'Personal',
    pro: 'Pro',
    business: 'Business',
    enterprise: 'Enterprise'
  }

  const planName = planNames[planId as keyof typeof planNames] || 'Unknown'

  const benefits = {
    personal: [
      '20 projects and 1,000 tasks',
      '100 AI suggestions per month',
      '5GB storage',
      'Integrations & analytics'
    ],
    pro: [
      '100 projects and 10,000 tasks',
      '500 AI suggestions per month',
      '50GB storage',
      'Team collaboration (up to 10 members)',
      'Advanced reporting',
      'Priority support'
    ],
    business: [
      '500 projects and 50,000 tasks',
      '2,000 AI suggestions per month',
      '200GB storage',
      'Large team support (up to 50 members)',
      'Admin dashboard',
      'SSO and audit logs'
    ],
    enterprise: [
      'Unlimited everything',
      'Custom integrations',
      'Dedicated support',
      'On-premise deployment',
      'Advanced security features'
    ]
  }

  const planBenefits = benefits[planId as keyof typeof benefits] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to TaskWork {planName}!
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your subscription has been activated successfully. You now have access to all {planName} plan features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Subscription Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Subscription Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Plan</span>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-slate-900">{planName}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Billing</span>
                <span className="font-medium text-slate-900">
                  {formatPrice(amount)} {isYearly ? 'yearly' : 'monthly'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Customer</span>
                <span className="font-medium text-slate-900">{user?.fullName || user?.firstName}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Email</span>
                <span className="font-medium text-slate-900">{sessionData.customerEmail}</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <span className="text-slate-600">Status</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Active
                </span>
              </div>
            </div>

            {/* Trial Information */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    14-Day Free Trial
                  </h3>
                  <p className="text-blue-700 text-sm">
                    You're currently in your free trial period. Your first charge will be on{' '}
                    {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Benefits */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              What's Included
            </h2>
            
            <div className="space-y-4">
              {planBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>

            {isYearly && (
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-emerald-900 mb-1">
                      Annual Savings
                    </h3>
                    <p className="text-emerald-700 text-sm">
                      You're saving 20% with the annual plan. That's{' '}
                      {formatPrice(amount * 0.2)} saved per year!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Your TaskWork {planName} subscription is now active. Start creating projects, 
            managing tasks, and boosting your productivity with AI-powered suggestions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/billing"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Manage Subscription
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-slate-600 text-sm mb-4">
            Need help getting started? Our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  )
}


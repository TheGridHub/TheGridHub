'use client'

import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Personal',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for individuals getting started',
      features: [
        'Up to 3 team members',
        '2 active projects',
        'Basic task management',
        'AI task suggestions (10/day)',
        'Basic analytics',
        'Mobile app access',
        'Email support'
      ],
      cta: 'Start Free',
      popular: false,
      href: '/sign-up'
    },
    {
      name: 'Pro',
      price: { monthly: 12, yearly: 10 },
      description: 'For growing teams and businesses',
      features: [
        'Unlimited team members',
        'Unlimited projects',
        'Advanced task management',
        'Unlimited AI suggestions',
        'Advanced analytics & reports',
        'Time tracking',
        'Custom workflows',
        'Priority support',
        'Integration with 50+ apps'
      ],
      cta: 'Start Pro Trial',
      popular: true,
      href: '/sign-up'
    },
    {
      name: 'Enterprise',
      price: { monthly: 25, yearly: 20 },
      description: 'For large organizations with advanced needs',
      features: [
        'Everything in Pro',
        'Advanced security & compliance',
        'Custom integrations',
        'Dedicated account manager',
        'On-premise deployment',
        'Custom AI training',
        'SLA guarantee',
        'Phone support',
        'Custom contracts'
      ],
      cta: 'Contact Sales',
      popular: false,
      href: '/contact'
    }
  ]

  const PRO_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
  const PRO_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY
  const ENT_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY
  const ENT_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY

  const handleCheckout = async (planKey: 'PRO' | 'ENTERPRISE') => {
    try {
      const priceId = planKey === 'PRO'
        ? (billingCycle === 'monthly' ? PRO_MONTHLY : PRO_YEARLY)
        : (billingCycle === 'monthly' ? ENT_MONTHLY : ENT_YEARLY)

      const planName = `${planKey} ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, planName })
      })
      const json = await res.json()
      if (json.url) window.location.href = json.url
    } catch (e) {
      console.error('Checkout failed', e)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/logo.svg" 
                alt="TheGridHub" 
                className="h-8 w-auto"
              />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</Link>
              <Link href="/pricing" className="text-purple-600 font-medium">Pricing</Link>
              <Link href="/why-thegridhub" className="text-gray-600 hover:text-purple-600 transition-colors">Why TheGridHub?</Link>
              <Link href="/login" className="text-gray-600 hover:text-purple-600 transition-colors">Sign In</Link>
              <Link href="/login" className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30">
                Start for Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20 bg-white/70 backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Start free, upgrade when you need more. No hidden fees.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <span className={`font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
                <span className="ml-1 text-green-600 text-sm">(Save 20%)</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border-2 p-8 border border-white/20 ${
                  plan.popular ? 'border-purple-500' : 'border-white/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-600">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.name === 'Pro' ? (
                  <button
                    onClick={() => handleCheckout('PRO')}
                    className={`block w-full text-center py-3 px-4 rounded-xl font-semibold transition-colors bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 shadow-lg shadow-purple-500/25`}
                  >
                    {billingCycle === 'monthly' ? 'Upgrade to Pro (Monthly)' : 'Upgrade to Pro (Yearly)'}
                  </button>
                ) : plan.name === 'Enterprise' ? (
                  <button
                    onClick={() => handleCheckout('ENTERPRISE')}
                    className={`block w-full text-center py-3 px-4 rounded-xl font-semibold transition-colors bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 shadow-lg shadow-purple-500/25`}
                  >
                    {billingCycle === 'monthly' ? 'Upgrade to Enterprise (Monthly)' : 'Upgrade to Enterprise (Yearly)'}
                  </button>
                ) : (
                  <Link
                    href={plan.href}
                    className={`block w-full text-center py-3 px-4 rounded-xl font-semibold transition-colors bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I change plans anytime?
                  </h3>
                  <p className="text-gray-600">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Is there a free trial for Pro and Enterprise plans?
                  </h3>
                  <p className="text-gray-600">
                    Yes! Pro plans come with a 14-day free trial. Enterprise plans include a 30-day trial with full support from our team.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-gray-600">
                    We accept all major credit cards, PayPal, and wire transfers for Enterprise plans. All payments are processed securely through Stripe.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Do you offer discounts for non-profits?
                  </h3>
                  <p className="text-gray-600">
                    Yes! We offer 50% discounts for registered non-profit organizations. Contact our support team with your non-profit documentation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-500 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your productivity?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of teams already using TheGridHub to achieve more.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login" className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 flex items-center shadow-lg hover:shadow-xl transition-all">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/contact" className="text-white px-8 py-4 rounded-xl text-lg font-semibold hover:text-purple-100 border border-white/20 hover:border-white/40 transition-all">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/images/logo.svg" 
                  alt="TheGridHub" 
                  className="h-8 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 max-w-md">
                AI-powered task management that helps teams stay organized and productive. 
                Built for the modern workplace.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/#features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/sign-up" className="text-gray-400 hover:text-white">Free Trial</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/why-thegridhub" className="text-gray-400 hover:text-white">Why TheGridHub?</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TheGridHub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm">Privacy</Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-white text-sm">Terms</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

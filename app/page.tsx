'use client'

import { useState } from 'react'
import { Check, Star, ArrowRight, Users, Zap, Shield, Brain, BarChart3, Clock, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import CurrencyConverter from '@/components/CurrencyConverter'

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  // Base prices in USD
  const basePrices = {
    personal: 0,
    pro: 12,
    enterprise: 25
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Task Suggestions',
      description: 'Get intelligent task recommendations based on your project context and history.',
      free: true,
      pro: true,
      enterprise: true
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time performance metrics, team productivity insights, and progress tracking.',
      free: 'Limited',
      pro: true,
      enterprise: true
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless team coordination with task assignments, comments, and real-time updates.',
      free: '3 members',
      pro: 'Unlimited',
      enterprise: 'Unlimited'
    },
    {
      icon: CheckSquare,
      title: 'Project Management',
      description: 'Organize tasks into projects with custom workflows, templates, and automation.',
      free: '2 projects',
      pro: 'Unlimited',
      enterprise: 'Unlimited'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Built-in time tracking with detailed reports for accurate project billing.',
      free: false,
      pro: true,
      enterprise: true
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Advanced security features, SSO, audit logs, and compliance tools.',
      free: false,
      pro: 'Basic',
      enterprise: 'Advanced'
    }
  ]

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TheGridHub</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/sign-up" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Start Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Task Management
              <br />
              <span className="text-blue-600">That Actually Works</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Stop juggling spreadsheets and sticky notes. TheGridHub combines intelligent AI with beautiful design 
              to help teams get more done with less stress.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link href="/sign-up" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="text-gray-600 px-8 py-4 rounded-lg text-lg font-semibold hover:text-gray-900 flex items-center">
                Watch Demo
                <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Free forever plan
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Free AI features
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to help individuals and teams accomplish their goals faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-green-600 font-medium">
                    {feature.free === true ? '✓ Free' : feature.free === false ? '✗ Pro only' : `✓ ${feature.free}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start free, upgrade when you need more. No hidden fees.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <span className={`font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600"
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

          {/* Currency Converter */}
          <div className="flex justify-center mb-8">
            <CurrencyConverter
              basePrices={basePrices}
              onCurrencyChange={setSelectedCurrency}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-sm border-2 p-8 ${
                  plan.popular ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
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

                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to supercharge your productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using TheGridHub to get more done.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/sign-up" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 flex items-center">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/sign-in" className="text-white px-8 py-4 rounded-lg text-lg font-semibold hover:text-blue-100 border border-white/20 hover:border-white/40">
              Sign In
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
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">TheGridHub</span>
              </div>
              <p className="text-gray-400 max-w-md">
                AI-powered task management that helps teams stay organized and productive. 
                Built for the modern workplace.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="/sign-up" className="text-gray-400 hover:text-white">Free Trial</a></li>
                <li><a href="/api" className="text-gray-400 hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TheGridHub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm">Terms</a>
              <a href="/security" className="text-gray-400 hover:text-white text-sm">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

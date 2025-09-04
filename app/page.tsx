'use client'

import { useState, useEffect } from 'react'
import { Check, Star, ArrowRight, Users, Zap, Shield, Brain, BarChart3, Clock, CheckSquare, Briefcase, Home, TrendingUp, MessageSquare, Timer, Layers, GitBranch, Slack, Chrome, Figma, Calendar, CreditCard } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [convertedPrices, setConvertedPrices] = useState({
    personal: 0,
    pro: 12,
    enterprise: 25
  })

  // Base prices in USD
  const basePrices = {
    personal: 0,
    pro: 12,
    enterprise: 25
  }

  // Handle currency conversion
  const handleCurrencyChange = (currency: string, prices: any) => {
    setSelectedCurrency(currency)
    if (prices) {
      setConvertedPrices(prices)
    }
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
      href: '/login'
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
      href: '/login'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/logo.svg" 
                alt="TheGridHub" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">TheGridHub</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</a>
              <Link href="/why-thegridhub" className="text-gray-600 hover:text-purple-600 transition-colors">Why TheGridHub?</Link>
              <Link href="/login" className="text-gray-600 hover:text-purple-600 transition-colors">Sign In</Link>
              <Link href="/login" className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30">
                Start for Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-purple-100/80 backdrop-blur-sm rounded-full text-sm font-medium text-purple-700 mb-6">
                👑 FREE for 10 Users • Unlimited Everything
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Empowering teams to 
                <span className="block text-gray-800">grow without limits.</span>
              </h1>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <CheckSquare className="h-5 w-5 text-purple-600 mt-1" />
                  <span className="text-lg text-gray-600">Task & Project Management</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Timer className="h-5 w-5 text-purple-600 mt-1" />
                  <span className="text-lg text-purple-600 font-medium">Built-in Time Tracking</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-purple-600 mt-1" />
                  <span className="text-lg text-gray-600">Real-time Team Collaboration and More.</span>
                </div>
              </div>
              
              <p className="text-gray-500 italic mb-8">
                Loved by 100+ agencies, remote teams & startups.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="flex-1 px-4 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Link 
                    href="/login"
                    className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-3 rounded-r-xl hover:from-purple-700 hover:to-purple-600 transition-all font-semibold shadow-lg shadow-purple-500/25"
                  >
                    Start for Free
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  No credit card
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  No time limit
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Full API access
                </div>
              </div>
            </div>
            
            {/* Right side - Illustration */}
            <div className="relative lg:block hidden">
              <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                {/* Octopus-like illustration placeholder */}
                <div className="w-full h-96 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-purple-300/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Layers className="w-16 h-16 text-purple-600" />
                    </div>
                    <p className="text-purple-600 font-medium">Interactive Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom text */}
          <div className="text-center mt-20">
            <p className="text-gray-600 text-lg">
              Teams around the world are switching to <span className="font-semibold text-purple-600">TheGridHub</span>
            </p>
          </div>
        </div>
      </section>

      {/* Turn Chaos Into Clarity Section */}
      <section className="py-20 bg-white/60 backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Your Workflow, Reimagined
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform how your team works with intuitive tools designed for the modern workplace.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 mb-16">
            {/* Streamlined Task Creation */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Streamlined Task Creation</h3>
              <p className="text-gray-600 mb-6">
                From idea to action in seconds. Our intelligent grid system adapts to your unique workflow patterns.
              </p>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 shadow-lg">
                <div className="space-y-4">
                  <div className="text-sm text-gray-500 font-medium mb-4">Intuitive boards</div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="font-medium text-purple-800 mb-2">To Do</div>
                      <div className="space-y-2">
                        <div className="bg-white p-2 rounded border border-purple-200">
                          <div className="text-purple-600 text-xs">WEBSITE</div>
                          <div className="font-medium">Performance Audit for the pricing page...</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-medium text-blue-800 mb-2">In Progress</div>
                      <div className="bg-white p-2 rounded border border-blue-200">
                        <div className="text-blue-600 text-xs">TO DESIGN</div>
                        <div className="font-medium">Design hero section for users page...</div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-medium text-green-800 mb-2">Done</div>
                      <div className="bg-white p-2 rounded border border-green-200">
                        <div className="text-green-600 text-xs">TO SALES</div>
                        <div className="font-medium">Connect Sales CRM with new website...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team-Centric Collaboration */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team-Centric Collaboration</h3>
              <p className="text-gray-600 mb-6">
                Bridge the gap between remote and in-office teams with integrated communication and instant sync.
              </p>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 shadow-lg">
                <div className="space-y-4">
                  <div className="text-sm text-gray-500 font-medium mb-4">Built-in chat & comments</div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">A</span>
                      </div>
                      <div className="flex-1 bg-purple-50 p-3 rounded-lg">
                        <div className="font-medium text-sm">Comments · Activity</div>
                        <div className="text-sm text-gray-600 mt-1">Keep all communication contextual with task-specific discussions and file sharing.</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-purple-600 mb-2">Track every minute</div>
                    <div className="text-sm text-gray-600">Built-in time tracking helps you understand where time goes and bill clients accurately.</div>
                    <div className="mt-3 bg-white p-2 rounded border">
                      <div className="text-xs text-gray-500">Time tracking</div>
                      <div className="font-medium">2h 30m</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Integrations */}
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Data-Driven Performance</h3>
                <p className="text-gray-600 mb-6">
                  Turn your productivity data into actionable insights that help your team perform at its best.
                </p>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Team Performance</span>
                      <span className="text-sm text-green-600">+12%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Integrations</h3>
                <p className="text-gray-600 mb-6">
                  Connect your favorite tools, set up automated workflows, and keep everything in sync — no more switching tabs.
                </p>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 shadow-lg">
                  <div className="grid grid-cols-5 gap-4 items-center justify-center">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Chrome className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-600">Google</span>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Slack className="w-6 h-6 text-purple-600" />
                      </div>
                      <span className="text-xs text-gray-600">Slack</span>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Figma className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="text-xs text-gray-600">Figma</span>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-600">Outlook</span>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <CreditCard className="w-6 h-6 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-600">Stripe</span>
                    </div>
                  </div>
                </div>
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
                <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
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
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600"
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
                  plan.popular ? 'border-primary-500' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
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
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
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
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to supercharge your productivity?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of teams already using TheGridHub to get more done.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login" className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 flex items-center">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/login" className="text-white px-8 py-4 rounded-lg text-lg font-semibold hover:text-primary-100 border border-white/20 hover:border-white/40">
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
                <img 
                  src="/images/logo.svg" 
                  alt="TheGridHub" 
                  className="h-8 w-auto brightness-0 invert"
                />
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
                <li><a href="/login" className="text-gray-400 hover:text-white">Free Trial</a></li>
                <li><a href="/api" className="text-gray-400 hover:text-white">API</a></li>
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

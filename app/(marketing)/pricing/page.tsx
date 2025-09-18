'use client'

import Link from 'next/link'
import { useState } from 'react'

export const dynamic = 'force-dynamic'

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.07 7.071a1 1 0 01-1.415 0L3.296 9.85a1 1 0 011.415-1.415l4.08 4.08 6.364-6.364a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annually'>('monthly')

  const plans = [
    {
      name: '🆓 Personal',
      price: { monthly: 0, annually: 0 },
      tag: 'Free',
      features: [
        'Up to 10 team members',
        '5 active projects',
        'Basic task management',
        'AI task suggestions (10/day)',
        'Basic analytics',
        'Basic time tracking',
        '1GB file storage',
        'Slack, Jira, Google Workspace integrations',
        'Email support',
      ],
      cta: { label: 'Get Started', href: '/admin-internal/login' },
    },
    {
      name: '🚀 Pro',
      price: { monthly: 25, annually: 20 },
      tag: 'Most Popular',
      features: [
        'Unlimited team members',
        'Unlimited projects',
        'Advanced task management',
        'Unlimited AI suggestions',
        'Advanced analytics & reports',
        'Team time tracking with reports',
        'Unlimited file storage',
        'Custom fields and automation rules',
        'Priority support',
      ],
      cta: { label: 'Start Pro', href: '/admin-internal/login' },
    },
    {
      name: '🏢 Enterprise',
      price: { monthly: 50, annually: 40 },
      tag: 'For Big Corporations',
      features: [
        'Everything in Pro, plus:',
        'Advanced security & compliance',
        'Custom integrations',
        'Dedicated account manager',
        'On-premise deployment option',
        'Custom AI training',
        'SLA guarantee (99.9% uptime)',
        'Phone support',
        'SSO/SAML authentication',
      ],
      cta: { label: 'Contact Sales', href: 'mailto:hello@thegridhub.co' },
    },
  ] as const

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex flex-col items-center justify-center gap-5 px-6 py-16 bg-[#f9f9f9] relative overflow-hidden">
        <h1 className="text-4xl md:text-5xl font-bold text-black text-center">From Startup to Enterprise.</h1>
        <p className="text-gray-600 text-center text-lg md:text-xl">Perfectly tailored for every stage of your growth. Get started today, no credit card needed.</p>
      </header>

      {/* Billing Toggle */}
      <section className="flex items-center justify-center py-10">
        <div className="inline-flex items-center gap-2 p-1 bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-md text-sm transition ${billing === 'monthly' ? 'bg-[#873bff] text-white shadow' : 'text-black hover:bg-gray-50'}`}
          >
            Billed Monthly
          </button>
          <button
            onClick={() => setBilling('annually')}
            className={`px-4 py-2 rounded-md text-sm transition ${billing === 'annually' ? 'bg-[#873bff] text-white shadow' : 'text-black hover:bg-gray-50'}`}
          >
            Billed Annually <span className="ml-1 text-xs opacity-80">(Save 20%)</span>
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <div key={i} className="group rounded-2xl border border-gray-200 bg-white p-6 hover:bg-[#873bff] transition-colors">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="text-sm text-gray-500 group-hover:text-white/80">{plan.tag}</div>
                <h3 className="text-2xl font-semibold text-black group-hover:text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-black group-hover:text-white">
                    ${plan.price[billing]}
                  </div>
                  <div className="text-gray-500 group-hover:text-white/80 text-sm">{plan.price[billing] === 0 ? 'forever' : 'per month'}{billing === 'annually' && plan.price[billing] !== 0 ? ', billed yearly' : ''}</div>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-800 group-hover:text-white">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={plan.cta.href}
                  className="inline-flex w-full items-center justify-center rounded-md border border-black group-hover:border-white bg-white group-hover:bg-white px-4 py-2 font-medium text-black hover:shadow"
                >
                  {plan.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#873bff] p-10 text-white">
          <h2 className="text-3xl font-semibold">Built for the New Generation of Makers</h2>
          <p className="mt-3 text-white/90 text-lg">TheGridHub is a modern project management and team collaboration platform for builders and small teams.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/sign-up" className="rounded-md bg-white text-black px-5 py-2 font-medium hover:bg-gray-100">Get Started</Link>
            <a href="mailto:hello@thegridhub.co" className="rounded-md border border-white/40 px-5 py-2 font-medium hover:bg-white/10">Request a Demo</a>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Check, X, Crown, Zap } from 'lucide-react'
import { getUserLocation, convertPrice, formatPrice } from '@/lib/location-currency'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
}

export default function PricingModal({ isOpen, onClose, feature }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [userCurrency, setUserCurrency] = useState('USD')
  const [convertedPrices, setConvertedPrices] = useState({
    pro: { monthly: 12, yearly: 10 },
    enterprise: { monthly: 25, yearly: 20 }
  })

  useEffect(() => {
    async function detectAndConvertPrices() {
      try {
        const location = await getUserLocation()
        if (location && location.currency !== 'USD') {
          setUserCurrency(location.currency)
          
          const [proMonthly, proYearly, entMonthly, entYearly] = await Promise.all([
            convertPrice(12, 'USD', location.currency),
            convertPrice(10, 'USD', location.currency),
            convertPrice(25, 'USD', location.currency),
            convertPrice(20, 'USD', location.currency)
          ])
          
          setConvertedPrices({
            pro: {
              monthly: proMonthly?.amount || 12,
              yearly: proYearly?.amount || 10
            },
            enterprise: {
              monthly: entMonthly?.amount || 25,
              yearly: entYearly?.amount || 20
            }
          })
        }
      } catch (error) {
        console.error('Failed to convert prices:', error)
      }
    }

    if (isOpen) {
      detectAndConvertPrices()
    }
  }, [isOpen])

  if (!isOpen) return null

  const plans = [
    {
      name: 'Personal',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for individuals',
      features: {
        'Team Members': '3',
        'Projects': '2',
        'AI Suggestions': '10/day',
        'Analytics': 'Basic',
        'Time Tracking': false,
        'Custom Workflows': false,
        'Priority Support': false
      },
      cta: 'Current Plan',
      current: true,
      color: 'gray'
    },
    {
      name: 'Pro',
      price: convertedPrices.pro,
      description: 'For growing teams',
      features: {
        'Team Members': 'Unlimited',
        'Projects': 'Unlimited',
        'AI Suggestions': 'Unlimited',
        'Analytics': 'Advanced',
        'Time Tracking': true,
        'Custom Workflows': true,
        'Priority Support': true
      },
      cta: 'Upgrade to Pro',
      current: false,
      color: 'blue'
    },
    {
      name: 'Enterprise',
      price: convertedPrices.enterprise,
      description: 'For large organizations',
      features: {
        'Team Members': 'Unlimited',
        'Projects': 'Unlimited',
        'AI Suggestions': 'Unlimited',
        'Analytics': 'Advanced',
        'Time Tracking': true,
        'Custom Workflows': true,
        'Priority Support': true
      },
      cta: 'Contact Sales',
      current: false,
      color: 'purple'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Unlock More Features</h2>
              <p className="text-gray-600 mt-1">
                You've reached the limit for <span className="font-medium">{feature}</span> on the Personal plan
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-centers rounded-full bg-blue-600"
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

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative border-2 rounded-xl p-6 ${
                  plan.current 
                    ? 'border-gray-300 bg-gray-50' 
                    : plan.color === 'blue' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-purple-500 bg-purple-50'
                }`}
              >
                {plan.color === 'blue' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      Recommended
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.name === 'Personal' 
                        ? 'Free' 
                        : formatPrice(plan.price[billingCycle], userCurrency)
                      }
                    </span>
                    <span className="text-gray-600 text-sm">
                      {plan.name !== 'Personal' && `/${billingCycle === 'monthly' ? 'mo' : 'yr'}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {Object.entries(plan.features).map(([feature, value]) => (
                    <div key={feature} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{feature}</span>
                      <span className={`font-medium ${
                        value === false ? 'text-gray-400' : 
                        typeof value === 'string' && value.includes('Unlimited') ? 'text-green-600' :
                        'text-gray-900'
                      }`}>
                        {value === false ? (
                          <X className="w-4 h-4" />
                        ) : value === true ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          value
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.current
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : plan.color === 'blue'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  disabled={plan.current}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              All plans include free AI features powered by Puter.js • No setup required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

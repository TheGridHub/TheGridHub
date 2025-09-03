'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Crown } from 'lucide-react'
import PricingModal from './PricingModal'

interface AISuggestionsProps {
  onSuggestionSelect: (suggestion: any) => void
  projectId?: string
  userPlan: 'personal' | 'pro' | 'enterprise'
  aiSuggestionsUsedToday: number
}

const AI_LIMITS = {
  personal: 10,
  pro: Infinity,
  enterprise: Infinity
}

export default function AISuggestions({ 
  onSuggestionSelect, 
  projectId, 
  userPlan = 'personal',
  aiSuggestionsUsedToday = 0
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

  const limit = AI_LIMITS[userPlan]
  const canUseAI = aiSuggestionsUsedToday < limit

  const generateSuggestions = async () => {
    if (!canUseAI) {
      setShowPricing(true)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          projectDescription: 'Generate helpful task suggestions for project management'
        }),
      })

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Error generating suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">AI Task Suggestions</h3>
            {userPlan === 'personal' && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {aiSuggestionsUsedToday}/{limit} today
              </span>
            )}
          </div>
          <button
            onClick={generateSuggestions}
            disabled={loading || !canUseAI}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
              !canUseAI
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Generating...' : canUseAI ? 'Generate Ideas' : 'Upgrade for More'}</span>
            {!canUseAI && <Crown className="w-4 h-4 text-yellow-500" />}
          </button>
        </div>

        {!canUseAI && userPlan === 'personal' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You've used all {limit} AI suggestions today. 
              <button 
                onClick={() => setShowPricing(true)}
                className="font-medium underline hover:no-underline ml-1"
              >
                Upgrade to Pro
              </button>
              {' '}for unlimited AI suggestions.
            </p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((suggestion: any, index: number) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => onSuggestionSelect(suggestion)}
              >
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {suggestion.title}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {suggestion.description}
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    suggestion.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    suggestion.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {suggestion.priority}
                  </span>
                  <span className="text-gray-500">
                    ~{suggestion.estimatedHours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        feature="AI Suggestions"
      />
    </>
  )
}

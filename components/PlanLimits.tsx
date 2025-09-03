'use client'

import { useState } from 'react'
import { Plus, Crown } from 'lucide-react'
import CreateTaskModal from './CreateTaskModal'
import PricingModal from './PricingModal'

interface PlanLimitsProps {
  currentPlan: 'personal' | 'pro' | 'enterprise'
  tasksUsed: number
  projectsUsed: number
  teamMembersUsed: number
}

const planLimits = {
  personal: {
    tasks: 50,
    projects: 2,
    teamMembers: 3,
    aiSuggestions: 10
  },
  pro: {
    tasks: Infinity,
    projects: Infinity,
    teamMembers: Infinity,
    aiSuggestions: Infinity
  },
  enterprise: {
    tasks: Infinity,
    projects: Infinity,
    teamMembers: Infinity,
    aiSuggestions: Infinity
  }
}

export default function PlanLimits({ 
  currentPlan, 
  tasksUsed, 
  projectsUsed, 
  teamMembersUsed 
}: PlanLimitsProps) {
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [limitedFeature, setLimitedFeature] = useState('')

  const limits = planLimits[currentPlan]

  const handleCreateTask = () => {
    if (currentPlan === 'personal' && tasksUsed >= limits.tasks) {
      setLimitedFeature('tasks')
      setShowPricing(true)
    } else {
      setShowCreateTask(true)
    }
  }

  const getProgressPercentage = (used: number, limit: number) => {
    if (limit === Infinity) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (currentPlan === 'pro' || currentPlan === 'enterprise') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 capitalize">{currentPlan} Plan</h3>
            <p className="text-sm text-gray-600">Unlimited access to all features</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-gray-900">Personal Plan</h3>
            <p className="text-sm text-gray-600">Upgrade to unlock unlimited features</p>
          </div>
          <button
            onClick={() => setShowPricing(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Upgrade
          </button>
        </div>

        <div className="space-y-3">
          {/* Tasks Usage */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tasks</span>
              <span className="font-medium">{tasksUsed}/{limits.tasks}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(getProgressPercentage(tasksUsed, limits.tasks))}`}
                style={{ width: `${getProgressPercentage(tasksUsed, limits.tasks)}%` }}
              />
            </div>
          </div>

          {/* Projects Usage */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Projects</span>
              <span className="font-medium">{projectsUsed}/{limits.projects}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(getProgressPercentage(projectsUsed, limits.projects))}`}
                style={{ width: `${getProgressPercentage(projectsUsed, limits.projects)}%` }}
              />
            </div>
          </div>

          {/* Team Members Usage */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Team Members</span>
              <span className="font-medium">{teamMembersUsed}/{limits.teamMembers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(getProgressPercentage(teamMembersUsed, limits.teamMembers))}`}
                style={{ width: `${getProgressPercentage(teamMembersUsed, limits.teamMembers)}%` }}
              />
            </div>
          </div>
        </div>

        {(tasksUsed >= limits.tasks * 0.8 || projectsUsed >= limits.projects * 0.8 || teamMembersUsed >= limits.teamMembers * 0.8) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              You're approaching your plan limits. 
              <button 
                onClick={() => setShowPricing(true)}
                className="font-medium underline ml-1 hover:no-underline"
              >
                Upgrade to Pro
              </button> 
              for unlimited access.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={handleCreateTask}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
            {tasksUsed >= limits.tasks && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
          </button>
        </div>
      </div>

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={(task) => {
          console.log('Creating task:', task)
          setShowCreateTask(false)
        }}
      />

      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        feature={limitedFeature}
      />
    </>
  )
}

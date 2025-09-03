'use client'

import { MoreHorizontal, User } from 'lucide-react'

interface Goal {
  id: string
  title: string
  quarter: string
  progress: number
  status: string
  owner: string
}

interface GoalsSectionProps {
  goals: Goal[]
}

export default function GoalsSection({ goals }: GoalsSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on track':
        return 'text-green-600 bg-green-50'
      case 'off track':
        return 'text-red-600 bg-red-50'
      case 'at risk':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex px-6">
          <nav className="-mb-px flex space-x-8">
            <button className="py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
              Team goals
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              My goals
            </button>
          </nav>
        </div>
      </div>

      {/* Goals List */}
      <div className="p-6 space-y-6">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                ● {goal.status}
              </span>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{goal.progress}%</span>
              </div>
            </div>

            {/* Goal Title */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {goal.title}
              </h4>
              <p className="text-xs text-gray-600">{goal.quarter} • FY25</p>
            </div>

            {/* Owner */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {goal.owner.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-900">Owner</div>
                <div className="text-xs text-gray-600">{goal.owner}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

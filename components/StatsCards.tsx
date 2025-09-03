'use client'

import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react'
import PerformanceChart from './PerformanceChart'

interface StatsCardsProps {
  stats: {
    teamPerformance: {
      value: number
      change: number
      trend: string
      chartData: Array<{ name: string; value: number }>
    }
    upcomingDeadlines: {
      value: number
      change: number
      trend: string
      chartData: Array<{ name: string; value: number }>
    }
    taskCompleted: {
      value: number
      change: number
      trend: string
      breakdown: Array<{ name: string; count: number; color: string }>
    }
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <>
      {/* Team Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Team performance</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-3xl font-bold text-gray-900">{stats.teamPerformance.value}%</span>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{stats.teamPerformance.change} Increased vs last week</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">vs last: 76.55%</div>
        </div>
        <div className="h-16">
          <PerformanceChart data={stats.teamPerformance.chartData} color="#06b6d4" />
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Upcoming deadlines</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-3xl font-bold text-gray-900">{stats.upcomingDeadlines.value}</span>
          <div className="flex items-center text-sm">
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-600">{Math.abs(stats.upcomingDeadlines.change)} Decreased vs last week</span>
          </div>
        </div>
        <div className="h-16">
          <PerformanceChart data={stats.upcomingDeadlines.chartData} color="#8b5cf6" />
        </div>
      </div>

      {/* Task Completed */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Task completed</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-3xl font-bold text-gray-900">{stats.taskCompleted.value}</span>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">{stats.taskCompleted.change} Increased vs last week</span>
          </div>
        </div>
        <div className="space-y-2">
          {stats.taskCompleted.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="font-medium">{item.count} Tasks</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

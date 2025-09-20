"use client"

import React, { useEffect, useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  FileText,
  Activity,
  Download,
  Filter,
  ChevronDown,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Building2,
  Contact,
  StickyNote,
} from 'lucide-react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useWorkspace } from '@/hooks/useWorkspace'
import { LazyViewportWrapper } from '@/components/ui/lazy-wrapper'

interface TimeseriesPoint { date: string; count: number }
interface Summary {
  projects: number
  tasks: { total: number; completed: number }
  companies: number
  contacts: number
  notes: number
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  color: string
  loading?: boolean
}

function StatCard({ title, value, change, icon: Icon, color, loading }: StatCardProps) {
  const isPositive = change === undefined || change >= 0
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function EnhancedMiniBars({ data, color = "bg-gradient-to-t from-[#873bff] to-[#7a35e6]", height = "h-20" }: { data: TimeseriesPoint[], color?: string, height?: string }) {
  const max = Math.max(1, ...data.map(d => d.count))
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  
  return (
    <div>
      <div className={`flex items-end gap-1 ${height} mb-2`}>
        {data.map((d, i) => {
          const date = new Date(d.date)
          const dayIndex = date.getDay()
          const percentage = (d.count / max) * 100
          
          return (
            <div key={i} className="relative flex-1 group">
              <div 
                className={`${color} rounded-t transition-all hover:opacity-80`} 
                style={{ height: `${Math.max(5, percentage)}%` }}
                title={`${d.date}: ${d.count}`}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {d.count} on {new Date(d.date).toLocaleDateString()}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1">
        {data.map((d, i) => {
          const date = new Date(d.date)
          const dayIndex = date.getDay()
          return (
            <div key={i} className="flex-1 text-center text-xs text-gray-400">
              {days[dayIndex]}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TaskDistributionChart({ completed, total }: { completed: number; total: number }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const remaining = total - completed
  
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="#e5e7eb"
            strokeWidth="16"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="url(#gradient)"
            strokeWidth="16"
            fill="none"
            strokeDasharray={`${percentage * 3.52} 352`}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#873bff" />
              <stop offset="100%" stopColor="#7a35e6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
            <p className="text-xs text-gray-500">Complete</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gradient-to-r from-[#873bff] to-[#7a35e6] rounded" />
          <span className="text-sm text-gray-700">Completed</span>
          <span className="text-sm font-medium text-gray-900 ml-auto">{completed}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gray-200 rounded" />
          <span className="text-sm text-gray-700">Remaining</span>
          <span className="text-sm font-medium text-gray-900 ml-auto">{remaining}</span>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsClient() {
  const { profile, isFreePlan } = useUserProfile()
  const { workspace } = useWorkspace()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [created, setCreated] = useState<TimeseriesPoint[]>([])
  const [completed, setCompleted] = useState<TimeseriesPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState('14')
  const [showDateDropdown, setShowDateDropdown] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/analytics?days=${dateRange}`)
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to load analytics')
      setSummary(json.summary)
      setCreated(json.timeseries?.tasksCreated || [])
      setCompleted(json.timeseries?.tasksCompleted || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [dateRange])

  const exportReport = () => {
    const data = {
      workspace: workspace?.name,
      dateRange: `Last ${dateRange} days`,
      summary,
      timeseries: { created, completed },
      exportDate: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '14', label: 'Last 14 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
  ]

  const completionRate = summary && summary.tasks.total > 0 
    ? Math.round((summary.tasks.completed / summary.tasks.total) * 100)
    : 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">
              Track your team's performance and productivity
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {dateRanges.find(r => r.value === dateRange)?.label}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showDateDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {dateRanges.map(range => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setDateRange(range.value)
                        setShowDateDropdown(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                        dateRange === range.value ? 'bg-[#873bff]/10 text-[#873bff]' : 'text-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button 
              onClick={load} 
              disabled={loading}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Export Button */}
            <button
              onClick={exportReport}
              disabled={!summary}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Projects"
          value={summary?.projects || 0}
          icon={FileText}
          color="bg-blue-100 text-blue-600"
          loading={loading && !summary}
        />
        <StatCard
          title="Total Tasks"
          value={summary?.tasks.total || 0}
          icon={CheckCircle2}
          color="bg-purple-100 text-purple-600"
          loading={loading && !summary}
        />
        <StatCard
          title="Completed Tasks"
          value={summary?.tasks.completed || 0}
          icon={Target}
          color="bg-green-100 text-green-600"
          loading={loading && !summary}
        />
        <StatCard
          title="Companies"
          value={summary?.companies || 0}
          icon={Building2}
          color="bg-orange-100 text-orange-600"
          loading={loading && !summary}
        />
        <StatCard
          title="Contacts"
          value={summary?.contacts || 0}
          icon={Contact}
          color="bg-pink-100 text-pink-600"
          loading={loading && !summary}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tasks Created */}
        <LazyViewportWrapper className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tasks Created</h2>
              <p className="text-sm text-gray-500">
                Total: {created.reduce((a, b) => a + b.count, 0)}
              </p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          {loading && !created.length ? (
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
          ) : created.length > 0 ? (
            <EnhancedMiniBars data={created} />
          ) : (
            <div className="h-20 flex items-center justify-center text-gray-500">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </LazyViewportWrapper>

        {/* Tasks Completed */}
        <LazyViewportWrapper className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tasks Completed</h2>
              <p className="text-sm text-gray-500">
                Total: {completed.reduce((a, b) => a + b.count, 0)}
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-gray-400" />
          </div>
          {loading && !completed.length ? (
            <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
          ) : completed.length > 0 ? (
            <EnhancedMiniBars data={completed} color="bg-gradient-to-t from-green-600 to-green-500" />
          ) : (
            <div className="h-20 flex items-center justify-center text-gray-500">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </LazyViewportWrapper>

        {/* Task Completion Rate */}
        <LazyViewportWrapper className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Task Completion Rate</h2>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          {loading && !summary ? (
            <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ) : summary ? (
            <TaskDistributionChart 
              completed={summary.tasks.completed} 
              total={summary.tasks.total} 
            />
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-500">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </LazyViewportWrapper>

        {/* Productivity Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Productivity Insights</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Completion Rate</p>
                  <p className="text-xs text-gray-500">Tasks completed on time</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">{completionRate}%</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Average Daily Tasks</p>
                  <p className="text-xs text-gray-500">Tasks created per day</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {created.length > 0 ? Math.round(created.reduce((a, b) => a + b.count, 0) / created.length) : 0}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <StickyNote className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Notes</p>
                  <p className="text-xs text-gray-500">Knowledge base items</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900">{summary?.notes || 0}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}


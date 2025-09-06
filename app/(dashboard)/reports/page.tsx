'use client'

import { useUser } from '@/hooks/useUser'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { 
  BarChart3, 
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  PieChart,
  Activity,
  Filter,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  FileText,
  Users,
  Zap
} from 'lucide-react'
import { SubscriptionGate } from '@/components/dashboard'
import type { Plan } from '@/types/db'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

interface Task {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  projectId?: string
  userId: string
}

interface Goal {
  id: string
  title: string
  target: number
  current: number
  type: 'TASK' | 'PROJECT' | 'CUSTOM'
  createdAt: Date
  updatedAt: Date
  deadline?: Date
  userId: string
}

interface Project {
  id: string
  name: string
  description?: string
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD'
  createdAt: Date
  userId: string
}

interface AnalyticsData {
  tasks: Task[]
  goals: Goal[]
  projects: Project[]
  tasksByDate: { [key: string]: number }
  completedTasksByDate: { [key: string]: number }
  goalProgressByDate: { [key: string]: number }
}

export default function ReportsPage() {
  const { user, isLoaded } = useUser()
  const supabase = useMemo(()=>createClient(),[])
  const [plan, setPlan] = useState<Plan>('FREE')
  const [internalUserId, setInternalUserId] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedView, setSelectedView] = useState<'overview' | 'tasks' | 'goals' | 'productivity'>('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return
      try {
        setLoading(true)
        // Resolve internal user id
        const { data: u } = await supabase.from('users').select('id').eq('supabaseId', user.id).maybeSingle()
        const uid = u?.id as string | undefined
        setInternalUserId(uid || null)
        // Resolve plan via view with fallback
        try {
          const { data: v } = await supabase.from('user_effective_plan').select('plan').eq('userId', uid || '').maybeSingle()
          const p = (v?.plan || 'FREE').toString().toUpperCase()
          if (p==='FREE'||p==='PRO'||p==='TEAM'||p==='ENTERPRISE') setPlan(p as Plan)
        } catch {}

        // Calculate date range
        const endDate = new Date()
        let startDate = new Date()
        switch (dateRange) {
          case '7d': startDate = subDays(endDate, 7); break
          case '30d': startDate = subDays(endDate, 30); break
          case '90d': startDate = subDays(endDate, 90); break
          case '1y': startDate = subDays(endDate, 365); break
        }

        // Fetch all data in parallel
        const [tasksResult, goalsResult, projectsResult] = await Promise.all([
          supabase
            .from('tasks')
            .select('*')
            .eq('userId', uid || '')
            .gte('createdAt', startDate.toISOString())
            .lte('createdAt', endDate.toISOString())
            .order('createdAt', { ascending: false }),
          
          supabase
            .from('goals')
            .select('*')
            .eq('userId', uid || '')
            .gte('createdAt', startDate.toISOString())
            .lte('createdAt', endDate.toISOString())
            .order('createdAt', { ascending: false }),
          
          supabase
            .from('projects')
            .select('*')
            .eq('userId', uid || '')
            .gte('createdAt', startDate.toISOString())
            .lte('createdAt', endDate.toISOString())
            .order('createdAt', { ascending: false })
        ])

        if (tasksResult.error) throw tasksResult.error
        if (goalsResult.error) throw goalsResult.error
        if (projectsResult.error) throw projectsResult.error

        const tasks = tasksResult.data || []
        const goals = goalsResult.data || []
        const projects = projectsResult.data || []

        // Process data for charts
        const dateInterval = eachDayOfInterval({ start: startDate, end: endDate })
        const tasksByDate: { [key: string]: number } = {}
        const completedTasksByDate: { [key: string]: number } = {}
        const goalProgressByDate: { [key: string]: number } = {}

        // Initialize all dates with 0
        dateInterval.forEach(date => {
          const dateKey = format(date, 'yyyy-MM-dd')
          tasksByDate[dateKey] = 0
          completedTasksByDate[dateKey] = 0
          goalProgressByDate[dateKey] = 0
        })

        // Count tasks by date
        tasks.forEach(task => {
          const dateKey = format(new Date(task.createdAt), 'yyyy-MM-dd')
          if (Object.prototype.hasOwnProperty.call(tasksByDate, dateKey)) {
            tasksByDate[dateKey]++
            if (task.status === 'COMPLETED') {
              completedTasksByDate[dateKey]++
            }
          }
        })

        // Calculate goal progress by date
        goals.forEach(goal => {
          const dateKey = format(new Date(goal.createdAt), 'yyyy-MM-dd')
          if (goalProgressByDate.hasOwnProperty(dateKey)) {
            const progress = (goal.current / goal.target) * 100
            goalProgressByDate[dateKey] += progress
          }
        })

        setData({
          tasks,
          goals,
          projects,
          tasksByDate,
          completedTasksByDate,
          goalProgressByDate
        })

      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    fetchAnalytics()
  }, [user, dateRange])

  const refreshData = async () => {
    setRefreshing(true)
    // Trigger useEffect by updating a dependency or manually call fetchAnalytics
    const currentRange = dateRange
    setDateRange('7d')
    setTimeout(() => setDateRange(currentRange), 100)
  }

  // Calculate metrics
  const calculateMetrics = () => {
    if (!data) return null

    const { tasks, goals, projects } = data
    
    // Task metrics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Goal metrics
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.current >= g.target).length
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
    const averageGoalProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, goal) => sum + (goal.current / goal.target * 100), 0) / goals.length)
      : 0

    // Project metrics
    const totalProjects = projects.length
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length

    // Priority breakdown
    const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH').length
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'MEDIUM').length
    const lowPriorityTasks = tasks.filter(t => t.priority === 'LOW').length

    // Recent performance (last 7 days vs previous 7 days)
    const last7Days = subDays(new Date(), 7)
    const previous7Days = subDays(new Date(), 14)
    
    const recentTasks = tasks.filter(t => new Date(t.createdAt) >= last7Days)
    const previousTasks = tasks.filter(t => new Date(t.createdAt) >= previous7Days && new Date(t.createdAt) < last7Days)
    
    const recentCompletedTasks = recentTasks.filter(t => t.status === 'DONE').length
    const previousCompletedTasks = previousTasks.filter(t => t.status === 'DONE').length
    
    const taskTrend = recentCompletedTasks - previousCompletedTasks

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      taskCompletionRate,
      totalGoals,
      completedGoals,
      goalCompletionRate,
      averageGoalProgress,
      totalProjects,
      completedProjects,
      activeProjects,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      taskTrend
    }
  }

  const metrics = calculateMetrics()

  // Generate chart data
  const generateChartData = () => {
    if (!data) return { dates: [], taskData: [], completionData: [] }

    const { tasksByDate, completedTasksByDate } = data
    const dates = Object.keys(tasksByDate).sort()
    const taskData = dates.map(date => tasksByDate[date])
    const completionData = dates.map(date => completedTasksByDate[date])

    return { dates, taskData, completionData }
  }

  const chartData = generateChartData()

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionGate plan={plan}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">
                Track your productivity and performance insights
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Export Button */}
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: BarChart3 },
                  { id: 'tasks', name: 'Tasks', icon: CheckCircle },
                  { id: 'goals', name: 'Goals', icon: Target },
                  { id: 'productivity', name: 'Productivity', icon: TrendingUp }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedView(tab.id as any)}
                      className={`inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                        selectedView === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {selectedView === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.totalTasks || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className={`flex items-center text-sm ${
                    metrics?.taskTrend && metrics.taskTrend > 0 
                      ? 'text-green-600' 
                      : metrics?.taskTrend && metrics.taskTrend < 0 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                  }`}>
                    {metrics?.taskTrend && metrics.taskTrend > 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : metrics?.taskTrend && metrics.taskTrend < 0 ? (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    ) : (
                      <Minus className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(metrics?.taskTrend || 0)} vs last week
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.taskCompletionRate || 0}%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${metrics?.taskCompletionRate || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Goals</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.totalGoals || 0}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {metrics?.averageGoalProgress || 0}% average progress
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                    <p className="text-2xl font-bold text-red-600">{metrics?.overdueTasks || 0}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Requires immediate attention
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Task Creation Chart */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Task Activity</h3>
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {chartData.dates.slice(-14).map((date, index) => {
                    const taskCount = chartData.taskData[chartData.dates.indexOf(date)]
                    const completedCount = chartData.completionData[chartData.dates.indexOf(date)]
                    const maxHeight = Math.max(...chartData.taskData)
                    
                    return (
                      <div key={date} className="flex-1 flex flex-col items-center">
                        <div className="flex flex-col justify-end h-48 w-full space-y-1">
                          <div
                            className="bg-purple-500 rounded-t"
                            style={{ 
                              height: maxHeight > 0 ? `${(taskCount / maxHeight) * 100}%` : '0%',
                              minHeight: taskCount > 0 ? '4px' : '0px'
                            }}
                          />
                          <div
                            className="bg-green-500 rounded-t"
                            style={{ 
                              height: maxHeight > 0 ? `${(completedCount / maxHeight) * 100}%` : '0%',
                              minHeight: completedCount > 0 ? '4px' : '0px'
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 transform -rotate-45">
                          {format(new Date(date), 'M/d')}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                    <span>Created</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Completed</span>
                  </div>
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Priority Distribution</h3>
                  <PieChart className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                      <span className="text-sm font-medium">High Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{metrics?.highPriorityTasks || 0}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ 
                            width: metrics?.totalTasks ? `${(metrics.highPriorityTasks / metrics.totalTasks) * 100}%` : '0%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                      <span className="text-sm font-medium">Medium Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{metrics?.mediumPriorityTasks || 0}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ 
                            width: metrics?.totalTasks ? `${(metrics.mediumPriorityTasks / metrics.totalTasks) * 100}%` : '0%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                      <span className="text-sm font-medium">Low Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{metrics?.lowPriorityTasks || 0}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ 
                            width: metrics?.totalTasks ? `${(metrics.lowPriorityTasks / metrics.totalTasks) * 100}%` : '0%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {data?.tasks?.slice(0, 5).map((task, index) => (
                  <div key={task.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      task.status === 'DONE' ? 'bg-green-100' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <CheckCircle className={`h-4 w-4 ${
                        task.status === 'DONE' ? 'text-green-600' :
                        task.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {task.status === 'DONE' ? 'Completed' : 
                         task.status === 'IN_PROGRESS' ? 'In Progress' : 'Todo'} • 
                        {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                
                {(!data?.tasks || data.tasks.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No recent activity to display</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {selectedView === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{metrics?.totalTasks || 0}</div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{metrics?.completedTasks || 0}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{metrics?.inProgressTasks || 0}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'goals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{metrics?.totalGoals || 0}</div>
                  <div className="text-sm text-gray-600">Total Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{metrics?.completedGoals || 0}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{metrics?.averageGoalProgress || 0}%</div>
                  <div className="text-sm text-gray-600">Average Progress</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'productivity' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Daily Completion Rate</h4>
                  <div className="text-2xl font-bold text-green-600">{metrics?.taskCompletionRate || 0}%</div>
                  <p className="text-sm text-gray-600">Tasks completed on time</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Focus Areas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">High Priority Tasks</span>
                      <span className="text-sm font-medium">{metrics?.highPriorityTasks || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Overdue Items</span>
                      <span className="text-sm font-medium text-red-600">{metrics?.overdueTasks || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </SubscriptionGate>
    </div>
  )
}

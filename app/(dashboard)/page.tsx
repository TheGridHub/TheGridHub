'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import StatsCards from '@/components/StatsCards'
import TaskTable from '@/components/TaskTable'
import GoalsSection from '@/components/GoalsSection'
import PlanLimits from '@/components/PlanLimits'
import AISuggestions from '@/components/AISuggestions'
import { 
  calculateTeamPerformance,
  generatePerformanceChartData,
  calculateUpcomingDeadlines,
  calculateTaskCompletionBreakdown,
  generateSmartGoals
} from '@/lib/dashboard-utils'

export default function Dashboard() {
  const { user } = useUser()
  const [selectedTab, setSelectedTab] = useState('upcoming')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock user plan data (in real app, this would come from your database)
  const userPlan = {
    type: 'personal' as const,
    tasksUsed: 35,
    projectsUsed: 2,
    teamMembersUsed: 3
  }

  // Sample realistic task data (in real app, this would come from your API)
  const sampleTasks = [
    {
      id: '1',
      name: 'Create wireframes for the new dashboard',
      dueDate: '2025-01-14T10:00:00Z',
      progress: 20,
      priority: 'Low',
      status: 'upcoming' as const,
      createdAt: '2025-01-10T09:00:00Z',
      projectId: '1',
      projectName: 'Aerotech Web Design'
    },
    {
      id: '2',
      name: 'Redesign navigation menu for improved UX',
      dueDate: '2025-01-14T15:00:00Z',
      progress: 50,
      priority: 'Medium',
      status: 'in-progress' as const,
      createdAt: '2025-01-11T11:00:00Z',
      completedAt: '2025-01-13T14:30:00Z',
      projectId: '1',
      projectName: 'Aerotech Web Design'
    },
    {
      id: '3',
      name: 'Finalize the interactive data visualization',
      dueDate: '2025-01-16T12:00:00Z',
      progress: 100,
      priority: 'High',
      status: 'completed' as const,
      createdAt: '2025-01-09T08:00:00Z',
      completedAt: '2025-01-15T16:20:00Z',
      projectId: '2',
      projectName: 'Clintown App Redesign'
    },
    {
      id: '4',
      name: 'Review and optimize image assets',
      dueDate: '2025-01-13T17:00:00Z',
      progress: 100,
      priority: 'Low',
      status: 'completed' as const,
      createdAt: '2025-01-08T10:30:00Z',
      completedAt: '2025-01-12T15:45:00Z',
      projectId: '2',
      projectName: 'Clintown App Redesign'
    },
    {
      id: '5',
      name: 'Conduct user testing on prototype',
      dueDate: '2025-01-15T14:00:00Z',
      progress: 30,
      priority: 'Medium',
      status: 'upcoming' as const,
      createdAt: '2025-01-12T13:00:00Z',
      projectId: '3',
      projectName: 'Uvo App Redesign'
    },
    {
      id: '6',
      name: 'Develop a color scheme and typography',
      dueDate: '2025-01-13T11:00:00Z',
      progress: 100,
      priority: 'Low',
      status: 'completed' as const,
      createdAt: '2025-01-07T09:15:00Z',
      completedAt: '2025-01-11T10:30:00Z',
      projectId: '3',
      projectName: 'Uvo App Redesign'
    },
    {
      id: '7',
      name: 'Implement dark mode for the entire application',
      dueDate: '2025-01-17T16:00:00Z',
      progress: 70,
      priority: 'Medium',
      status: 'in-progress' as const,
      createdAt: '2025-01-11T14:20:00Z',
      projectId: '1',
      projectName: 'Aerotech Web Design'
    },
    {
      id: '8',
      name: 'Create a responsive layout for mobile devices',
      dueDate: '2025-01-12T18:00:00Z',
      progress: 100,
      priority: 'High',
      status: 'completed' as const,
      createdAt: '2025-01-06T16:45:00Z',
      completedAt: '2025-01-11T17:30:00Z',
      projectId: '2',
      projectName: 'Clintown App Redesign'
    }
  ]

  // Sample projects data
  const sampleProjects = [
    { id: '1', name: 'Aerotech Web Design', color: '#10b981' },
    { id: '2', name: 'Clintown App Redesign', color: '#06b6d4' },
    { id: '3', name: 'Uvo App Redesign', color: '#8b5cf6' }
  ]

  // Calculate dashboard metrics on component mount
  useEffect(() => {
    const calculateDashboardData = () => {
      // Calculate team performance
      const teamPerformance = calculateTeamPerformance(sampleTasks)
      
      // Generate chart data for the last 7 days
      const chartData = generatePerformanceChartData(sampleTasks, 7)
      
      // Calculate upcoming deadlines
      const upcomingDeadlines = calculateUpcomingDeadlines(sampleTasks)
      
      // Calculate task completion breakdown
      const taskBreakdown = calculateTaskCompletionBreakdown(sampleTasks, sampleProjects)
      
      // Generate smart goals
      const goals = generateSmartGoals(sampleTasks, teamPerformance)
      
      // Build stats object similar to original structure
      const stats = {
        teamPerformance: {
          value: teamPerformance.completionRate,
          change: teamPerformance.weeklyComparison,
          trend: teamPerformance.weeklyComparison >= 0 ? 'increase' : 'decrease',
          chartData: chartData
        },
        upcomingDeadlines: {
          value: upcomingDeadlines.count,
          change: upcomingDeadlines.trend,
          trend: upcomingDeadlines.trend >= 0 ? 'increase' : 'decrease',
          chartData: [
            { name: 'Mon', value: Math.floor(Math.random() * 20) + 5 },
            { name: 'Tue', value: Math.floor(Math.random() * 20) + 5 },
            { name: 'Wed', value: Math.floor(Math.random() * 20) + 5 },
            { name: 'Thu', value: Math.floor(Math.random() * 20) + 5 },
            { name: 'Fri', value: Math.floor(Math.random() * 20) + 5 },
            { name: 'Sat', value: Math.floor(Math.random() * 20) + 5 },
            { name: 'Sun', value: Math.floor(Math.random() * 20) + 5 },
          ]
        },
        taskCompleted: {
          value: taskBreakdown.reduce((sum, item) => sum + item.count, 0),
          change: teamPerformance.productivityTrend,
          trend: teamPerformance.productivityTrend >= 0 ? 'increase' : 'decrease',
          breakdown: taskBreakdown
        }
      }
      
      setDashboardData({ stats, goals, teamPerformance })
      setIsLoading(false)
    }

    calculateDashboardData()
  }, [])

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Convert tasks to display format
  const displayTasks = sampleTasks.map(task => ({
    id: task.id,
    name: task.name,
    dueDate: new Date(task.dueDate).toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    progress: task.progress,
    priority: task.priority
  }))

  const userName = user?.firstName || 'User'
  const pendingTasksCount = sampleTasks.filter(t => t.status !== 'completed').length
  const projectCount = sampleProjects.length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Dynamic Welcome Message */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Let's start today, {userName}!
              </h1>
              <p className="text-gray-600">
                {pendingTasksCount} pending tasks across {projectCount} projects today!
              </p>
            </div>

            {/* Dynamic Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <StatsCards stats={dashboardData.stats} />
            </div>

            {/* Tasks and Goals Section */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* My Tasks - Takes 2/4 width */}
              <div className="xl:col-span-2">
                <TaskTable 
                  tasks={displayTasks} 
                  selectedTab={selectedTab}
                  onTabChange={setSelectedTab}
                />
              </div>

              {/* Goals - Takes 1/4 width */}
              <div className="xl:col-span-1">
                <GoalsSection goals={dashboardData.goals} />
              </div>

              {/* Plan Limits - Takes 1/4 width */}
              <div className="xl:col-span-1">
                <PlanLimits 
                  currentPlan={userPlan.type}
                  tasksUsed={userPlan.tasksUsed}
                  projectsUsed={userPlan.projectsUsed}
                  teamMembersUsed={userPlan.teamMembersUsed}
                />
                
                {/* AI Suggestions */}
                <AISuggestions
                  userPlan={userPlan.type}
                  aiSuggestionsUsedToday={7}
                  onSuggestionSelect={(suggestion) => {
                    console.log('Selected suggestion:', suggestion)
                    // In a real app, you would create a new task from the suggestion
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
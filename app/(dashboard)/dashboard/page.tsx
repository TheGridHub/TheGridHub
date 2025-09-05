'use client'

import { useUser } from '@/hooks/useUser'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useI18n } from '@/components/i18n/I18nProvider'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Calendar,
  TrendingUp,
  Plus,
  Bell,
  Search,
  Settings,
  Filter,
  Target,
  BarChart3,
  Clock,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { t } = useI18n()
  const [greeting, setGreeting] = useState('')
  const [tasks, setTasks] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', project: '' })
  const [newGoal, setNewGoal] = useState({ title: '', target: 100, current: 0 })

  // Fetch user data from database
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    const fetchUserData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const supabase = createClient()

        const [
          { data: tasksData },
          { data: goalsData },
          { data: projectsData },
          { data: notificationsData }
        ] = await Promise.all([
          supabase
            .from('tasks')
            .select(`
              *,
              project:projects(id, name, color)
            `)
            .eq('userId', user.id)
            .order('createdAt', { ascending: false }),
          supabase
            .from('goals')
            .select('*')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false }),
          supabase
            .from('projects')
            .select('id, name, color')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false }),
          supabase
            .from('notifications')
            .select('*')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false })
        ])

        // Transform and set data
        if (tasksData) {
          const formattedTasks = tasksData.map(task => ({
            id: task.id,
            title: task.title,
            project: task.project?.name || '',
            priority: task.priority.toLowerCase(),
            status: task.status.toLowerCase().replace('_', '-'),
            progress: task.progress,
            dueDate: task.dueDate ? format(new Date(task.dueDate), 'EEE, dd MMM yyyy') : ''
          }))
          setTasks(formattedTasks)
        }

        if (goalsData) {
          const formattedGoals = goalsData.map(goal => ({
            id: goal.id,
            title: goal.title,
            progress: Math.round((goal.current / goal.target) * 100),
            target: goal.target,
            current: goal.current,
            quarter: Math.ceil(new Date().getMonth() / 3),
            year: new Date().getFullYear(),
            owner: (user as any)?.email || ''
          }))
          setGoals(formattedGoals)
        }

        if (projectsData) {
          const formattedProjects = projectsData.map(project => ({
            id: project.id,
            name: project.name,
            tasks: 0,
            color: 'bg-purple-100 text-purple-700' // Use project.color if available
          }))
          setProjects(formattedProjects)
        }

        if (notificationsData) {
          const formattedNotifications = notificationsData.map(notification => ({
            id: notification.id,
            type: notification.type,
            message: notification.message,
            time: format(new Date(notification.createdAt), 'MMM dd, yyyy'),
            read: notification.read
          }))
          setNotifications(formattedNotifications)
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Helper functions
  const handleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'completed', progress: 100 } : task
    ))
  }

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        title: newTask.title,
        project: newTask.project,
        priority: newTask.priority,
        status: 'upcoming',
        progress: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toDateString()
      }
      setTasks([...tasks, task])
      setNewTask({ title: '', priority: 'medium', project: '' })
      setShowTaskForm(false)
    }
  }

  const handleInviteTeamMember = () => {
    setShowInviteForm(true)
  }

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
  }

  const handleSettingsClick = () => {
    router.push('/dashboard/settings')
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
    } catch {}
    setNotifications(notifications.filter(n => n.id !== notificationId))
  }

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ))
  }

  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'upcoming') return task.status === 'upcoming'
    if (selectedFilter === 'overdue') return task.status === 'overdue'
    if (selectedFilter === 'completed') return task.status === 'completed'
    return true
  }).filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.project.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 relative">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-md shadow-lg border-r border-white/20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b">
            <img src="/images/logo.svg" alt="TheGridHub" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-bold text-purple-600">TheGridHub</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-purple-600 bg-purple-50 rounded-lg">
              <LayoutDashboard className="h-5 w-5 mr-3" />
              {t('nav.dashboard')}
            </Link>
            <Link href="/dashboard/tasks" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <CheckSquare className="h-5 w-5 mr-3" />
              {t('nav.tasks')}
            </Link>
            <Link href="/dashboard/reports" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <BarChart3 className="h-5 w-5 mr-3" />
              {t('nav.reports')}
            </Link>
            <Link href="/dashboard/workspace" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 mr-3" />
              {t('nav.workspace')}
            </Link>
            <Link href="/dashboard/goals" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <Target className="h-5 w-5 mr-3" />
              {t('nav.goals')}
            </Link>
            <Link href="/dashboard/settings" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <Settings className="h-5 w-5 mr-3" />
              {t('nav.settings')}
            </Link>
          </nav>
          
          {/* User Profile */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <img 
                src={user?.imageUrl || `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}&background=0D9488&color=fff`}
                alt={user?.firstName || 'User'}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {t('dashboard.greeting', { name: user?.firstName || 'User' })}
                </h1>
                <p className="text-gray-600">
                  {tasks.filter(t => t.status !== 'completed').length} pending tasks across {projects.length} projects today!
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('dashboard.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                {/* Weekly button */}
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  {t('dashboard.weekly')}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {/* Customize button */}
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                  {t('dashboard.customize')}
                </button>
                
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={handleNotificationClick}
                    className="p-2 text-gray-600 hover:text-gray-900 relative"
>
                    <Bell className="h-5 w-5" aria-label={t('dashboard.notifications')} />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.notifications')}</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="cursor-pointer flex-1" onClick={async () => {
                                try {
                                  await fetch(`/api/notifications/${notification.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isRead: true }) })
                                } catch {}
                                markNotificationAsRead(notification.id)
                              }}>
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                              <button
                                className="ml-3 text-xs text-red-600 hover:text-red-700"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                {t('common.delete')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Settings */}
                <button 
                  onClick={handleSettingsClick}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

      <main className="px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Team Performance */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Team performance</h3>
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </div>
                {tasks.length > 0 ? (
                  <>
                    <div className="flex items-end space-x-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900">{Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%</span>
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        ↗ Completion rate
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Tasks completed this week</p>
                    {/* Mini Chart Placeholder */}
                    <div className="h-16 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg flex items-end justify-between px-2 py-2">
                      {[40, 45, 35, 50, 45, 55, 60].map((height, index) => (
                        <div key={index} className={`bg-purple-400 rounded-sm w-3`} style={{height: `${height}%`}}></div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500 mt-2">No performance data yet</p>
                    <p className="text-xs text-gray-400">Complete some tasks to see your performance</p>
                  </div>
                )}
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Upcoming deadlines</h3>
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </div>
                {tasks.length > 0 ? (
                  <>
                    <div className="flex items-end space-x-2 mb-4">
                      <span className="text-3xl font-bold text-gray-900">{tasks.filter(t => t.dueDate && new Date(t.dueDate) > new Date()).length}</span>
                      <span className="text-sm font-medium text-blue-600 flex items-center">
                        Tasks with deadlines
                      </span>
                    </div>
                    {/* Calendar Visualization */}
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div key={day} className="text-center p-1 text-gray-500">{day}</div>
                      ))}
                      {Array.from({length: 21}, (_, i) => (
                        <div key={i} className={`aspect-square rounded text-center p-1 text-gray-700`}>
                          {i + 8}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500 mt-2">No upcoming deadlines</p>
                    <p className="text-xs text-gray-400">Create tasks with due dates to track deadlines</p>
                  </div>
                )}
              </div>

              {/* Tasks Completed */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium">Task completed</h3>
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </div>
                {tasks.length > 0 ? (
                  <>
                    <div className="flex items-end space-x-2 mb-4">
                      <span className="text-3xl font-bold text-gray-900">{tasks.filter(t => t.status === 'completed').length}</span>
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        ↗ Total completed
                      </span>
                    </div>
                    {/* Project Progress Bars */}
                    <div className="space-y-3">
                      {projects.slice(0, 3).map((project, index) => (
                        <div key={project.id} className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-purple-400' : index === 1 ? 'bg-green-400' : 'bg-pink-400'
                          }`}></div>
                          <span className="text-sm text-gray-600 flex-1">{project.name}</span>
                          <span className="text-sm font-medium text-gray-900">{project.tasks} Tasks</span>
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No projects yet</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500 mt-2">No tasks completed yet</p>
                    <p className="text-xs text-gray-400">Start creating and completing tasks</p>
                  </div>
                )}
              </div>
            </div>

        {/* Tasks and Goals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tasks Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.yourTasks')}</h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t('common.all')}
                </button>
                <button 
                  onClick={() => setSelectedFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === 'upcoming' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t('dashboard.upcoming')}
                </button>
                <button 
                  onClick={() => setSelectedFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === 'completed' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t('dashboard.done')}
                </button>
              </div>
            </div>
            
            {filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.slice(0, 6).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleTaskComplete(task.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.project && `${task.project} • `}{task.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-400' :
                        'bg-green-400'
                      }`}></span>
                      <div className="w-12 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-purple-400 h-1.5 rounded-full" 
                          style={{width: `${task.progress}%`}}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{task.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first task.</p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/tasks"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('dashboard.createTask')}
                  </Link>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Link href="/dashboard/tasks" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                {t('dashboard.viewAllTasks')}
              </Link>
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.yourGoals')}</h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                {t('dashboard.addGoal')}
              </button>
            </div>
            
            {goals.length > 0 ? (
              <div className="space-y-6">
                {goals.map((goal) => (
                  <div key={goal.id} className="">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{goal.title}</h4>
                        <p className="text-xs text-gray-500">Q{goal.quarter} {goal.year} • {goal.owner}</p>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">{goal.current}</span>
                      <span className="text-sm text-gray-500">/ {goal.target}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full" 
                        style={{width: `${goal.progress}%`}}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{goal.progress}% completed</span>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-purple-600">
                          <Edit className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No goals yet</h3>
                <p className="mt-1 text-sm text-gray-500">Set your first goal to track your progress.</p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/goals"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Link>
                </div>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Link href="/dashboard/goals" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View all goals
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-white/20">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    New Task
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {tasks.filter(t => t.status === 'in-progress').slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-500">{task.project || 'No project'}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/dashboard/tasks" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View all tasks →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center">
                  <Plus className="h-5 w-5 mr-3" />
                  Create New Task
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                  <Calendar className="h-5 w-5 mr-3" />
                  Schedule Meeting
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                  <Users className="h-5 w-5 mr-3" />
                  Invite Team Member
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium mb-2">Upgrade to Pro</h3>
              <p className="text-sm mb-4 opacity-90">Get unlimited projects, advanced analytics, and priority support.</p>
              <Link href="/pricing" className="inline-flex items-center text-sm font-medium bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Upgrade Now
                <Plus className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
          </>
        )}
      </main>
      </div>
    </div>
  )
}

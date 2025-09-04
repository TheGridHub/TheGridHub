'use client'

import { useUser } from '@/hooks/useUser'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [greeting, setGreeting] = useState('')
  const [tasks, setTasks] = useState([])
  const [goals, setGoals] = useState([])
  const [projects, setProjects] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', project: '' })
  const [newGoal, setNewGoal] = useState({ title: '', target: 100, current: 0 })
  const [teamPerformance, setTeamPerformance] = useState({ current: 85, change: 2.55 })
  const [upcomingDeadlines, setUpcomingDeadlines] = useState(96)
  const [tasksCompleted, setTasksCompleted] = useState({ count: 48, change: 8 })
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'task', message: 'New task assigned: Website redesign', time: '2 min ago', read: false },
    { id: 2, type: 'team', message: 'John joined your workspace', time: '1 hour ago', read: false },
    { id: 3, type: 'deadline', message: 'Project deadline approaching', time: '3 hours ago', read: true }
  ])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // Initialize sample data for demo
    setTasks([
      { id: 1, title: 'Create wireframes for the new dashboard', project: 'Aerotech Web Design', priority: 'medium', status: 'upcoming', progress: 20, dueDate: 'Wed, 14 Jan 2025' },
      { id: 2, title: 'Redesign navigation menu for improved UX', project: 'Climtown App Redesign', priority: 'medium', status: 'in-progress', progress: 50, dueDate: 'Wed, 14 Jan 2025' },
      { id: 3, title: 'Finalize the interactive data visualization', project: 'Uwo App Redesign', priority: 'high', status: 'in-progress', progress: 30, dueDate: 'Fri, 16 Jan 2025' },
      { id: 4, title: 'Review and optimize image assets', project: '', priority: 'low', status: 'in-progress', progress: 60, dueDate: 'Tue, 13 Jan 2025' },
      { id: 5, title: 'Conduct user testing on prototype', project: '', priority: 'medium', status: 'upcoming', progress: 30, dueDate: 'Thu, 15 Jan 2025' },
      { id: 6, title: 'Develop a color scheme and typography', project: '', priority: 'low', status: 'upcoming', progress: 40, dueDate: 'Tue, 13 Jan 2025' },
      { id: 7, title: 'Implement dark mode for the entire app', project: '', priority: 'medium', status: 'upcoming', progress: 70, dueDate: 'Sat, 17 Jan 2025' },
      { id: 8, title: 'Create a responsive layout for tablets', project: '', priority: 'high', status: 'completed', progress: 50, dueDate: 'Mon, 12 Jan 2025' }
    ])

    setGoals([
      { id: 1, title: 'Completing 80 task every month', progress: 60, target: 80, current: 48, quarter: 1, year: 2025, owner: 'Platama Adi Pangestu' },
      { id: 2, title: 'Finishing 12 project together', progress: 70, target: 12, current: 8.4, quarter: 2, year: 2025, owner: 'Dwi Ayu Putri Permatasari' }
    ])

    setProjects([
      { id: 1, name: 'Aerotech Web Design', tasks: 12, color: 'bg-purple-100 text-purple-700' },
      { id: 2, name: 'Climtown App Redesign', tasks: 8, color: 'bg-blue-100 text-blue-700' },
      { id: 3, name: 'Uwo App Redesign', tasks: 4, color: 'bg-pink-100 text-pink-700' }
    ])
  }, [])

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
    router.push('/settings')
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r">
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
              Dashboard
            </Link>
            <Link href="/tasks" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <CheckSquare className="h-5 w-5 mr-3" />
              My tasks
            </Link>
            <Link href="/reports" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <BarChart3 className="h-5 w-5 mr-3" />
              Reports
            </Link>
            <Link href="/workspace" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 mr-3" />
              My workspace
            </Link>
            <Link href="/goals" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <Target className="h-5 w-5 mr-3" />
              Goals
            </Link>
            <Link href="/settings" className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg">
              <Settings className="h-5 w-5 mr-3" />
              Settings
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
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Let's start today, {user?.firstName || 'Bagus'}!
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
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                {/* Weekly button */}
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Weekly
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {/* Customize button */}
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                  Customize
                </button>
                
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={handleNotificationClick}
                    className="p-2 text-gray-600 hover:text-gray-900 relative"
                  >
                    <Bell className="h-5 w-5" />
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
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
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
        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Team Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Team performance</h3>
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">{teamPerformance.current}%</span>
              <span className="text-sm font-medium text-green-600 flex items-center">
                ↗ {teamPerformance.change} Increased vs last week
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">vs 76.55%</p>
            {/* Mini Chart Placeholder */}
            <div className="h-16 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg flex items-end justify-between px-2 py-2">
              {[40, 45, 35, 50, 45, 55, 60].map((height, index) => (
                <div key={index} className={`bg-purple-400 rounded-sm w-3`} style={{height: `${height}%`}}></div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Upcoming deadlines</h3>
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-end space-x-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">{upcomingDeadlines}</span>
              <span className="text-sm font-medium text-red-600 flex items-center">
                ↘ 12 Decreased vs last week
              </span>
            </div>
            {/* Calendar Visualization */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center p-1 text-gray-500">{day}</div>
              ))}
              {Array.from({length: 21}, (_, i) => (
                <div key={i} className={`aspect-square rounded text-center p-1 ${
                  [13, 14, 17].includes(i + 8) ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'
                }`}>
                  {i + 8}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Completed */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Task completed</h3>
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-end space-x-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">{tasksCompleted.count}</span>
              <span className="text-sm font-medium text-green-600 flex items-center">
                ↗ {tasksCompleted.change} Increased vs last week
              </span>
            </div>
            {/* Project Progress Bars */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-sm text-gray-600 flex-1">Aerotech Web Design</span>
                <span className="text-sm font-medium text-gray-900">{projects[0]?.tasks || 12} Tasks</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600 flex-1">Climtown App Redesign</span>
                <span className="text-sm font-medium text-gray-900">{projects[1]?.tasks || 8} Tasks</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                <span className="text-sm text-gray-600 flex-1">Uwo App Redesign</span>
                <span className="text-sm font-medium text-gray-900">{projects[2]?.tasks || 4} Tasks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks and Goals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tasks Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your task</h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setSelectedFilter('upcoming')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === 'upcoming' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Upcoming
                </button>
                <button 
                  onClick={() => setSelectedFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === 'completed' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
            
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
            
            <div className="mt-4 text-center">
              <Link href="/tasks" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View all tasks
              </Link>
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your goals</h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Add goal
              </button>
            </div>
            
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
            
            <div className="mt-6 text-center">
              <Link href="/goals" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View all goals
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
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
                  <Link href="/tasks" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View all tasks →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
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
      </main>
      </div>
    </div>
  )
}

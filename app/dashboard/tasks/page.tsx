"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Clock,
  User,
  Calendar,
  Flag,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
  ArrowRight,
  FileText,
  Tag,
  Users,
  Star,
  StarOff,
  Copy,
  Archive,
  Bot,
  MessageSquare,
} from 'lucide-react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useWorkspace } from '@/hooks/useWorkspace'
import { generateTaskSuggestions } from '@/lib/ai'
import { TasksChatbot } from '@/components/ai/TasksChatbot'

interface Task { 
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  progress?: number
  dueDate?: string | null
  assignedTo?: string
  projectId?: string
  tags: string[]
  created_at: string
  updated_at: string
  starred: boolean
}

interface Column {
  id: string
  title: string
  status: Task['status']
  color: string
  bgColor: string
  count: number
}

interface CreateTaskData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  assignedTo?: string
  projectId?: string
  status: Task['status']
  tags: string[]
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-red-100 text-red-700 border-red-200',
}

const statusColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    status: 'todo',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    count: 0,
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in-progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    count: 0,
  },
  {
    id: 'review',
    title: 'Review',
    status: 'review',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    count: 0,
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    count: 0,
  },
]

export default function TasksPage() {
  const { profile, isFreePlan } = useUserProfile()
  const { workspace } = useWorkspace()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [suggesting, setSuggesting] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [newTask, setNewTask] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    projectId: '',
    status: 'todo',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/tasks')
      const data = await res.json()
      
      // Transform API data to match our interface with enhancements
      const enhancedTasks = (data.tasks || []).map((task: any) => ({
        ...task,
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        tags: task.tags || [],
        starred: Math.random() > 0.8,
        assignedTo: task.assignedTo || profile?.id,
        dueDate: task.dueDate || (Math.random() > 0.6 ? 
          new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
          : null),
      }))
      
      setTasks(enhancedTasks)
    } catch (e: any) {
      setError(e?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTasks() }, [])

  const createTask = async () => {
    if (!newTask.title.trim()) return
    
    setCreating(true)
    setError(null)
    
    try {
      const res = await fetch('/api/tasks', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(newTask) 
      })
      const data = await res.json()
      
      if (res.ok && data.task) {
        const enhancedTask: Task = {
          ...data.task,
          status: newTask.status,
          priority: newTask.priority,
          tags: newTask.tags,
          starred: false,
          assignedTo: newTask.assignedTo || profile?.id,
          dueDate: newTask.dueDate || null,
        }
        
        setTasks([enhancedTask, ...tasks])
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          assignedTo: '',
          projectId: '',
          status: 'todo',
          tags: [],
        })
        setTagInput('')
        setShowCreateModal(false)
      } else {
        setError(data.error || 'Failed to create task')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    const previousTasks = tasks
    setTasks(tasks.filter(t => t.id !== id))
    
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setTasks(previousTasks)
        setError('Failed to delete task')
      }
    } catch (error) {
      setTasks(previousTasks)
      setError('Failed to delete task')
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const toggleStarred = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, starred: !task.starred } : task
    ))
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (draggedTask && draggedTask.status !== columnId) {
      await updateTaskStatus(draggedTask.id, columnId as Task['status'])
    }
    
    setDraggedTask(null)
  }

  // Tag management
  const addTag = (tag: string) => {
    if (tag.trim() && !newTask.tags.includes(tag.trim())) {
      setNewTask({ ...newTask, tags: [...newTask.tags, tag.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewTask({ ...newTask, tags: newTask.tags.filter(tag => tag !== tagToRemove) })
  }

  const generateSuggestions = async () => {
    setSuggesting(true)
    setError(null)
    try {
      const gen = await generateTaskSuggestions('General productivity improvements', tasks.map(t => t.title))
      setSuggestions(gen || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to generate suggestions')
    } finally {
      setSuggesting(false)
    }
  }

  // Handle tasks created by AI chatbot
  const handleChatbotTaskCreate = async (aiTasks: any[]) => {
    try {
      const createdTasks = []
      
      for (const aiTask of aiTasks) {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: aiTask.title,
            description: aiTask.description || '',
            priority: aiTask.priority || 'medium',
            status: 'todo'
          })
        })
        
        const data = await res.json()
        if (data.task) {
          const enhancedTask: Task = {
            ...data.task,
            status: 'todo',
            priority: aiTask.priority || 'medium',
            tags: [],
            starred: false,
            assignedTo: profile?.id,
            dueDate: null,
          }
          createdTasks.push(enhancedTask)
        }
      }
      
      // Add all created tasks to the beginning of the tasks list
      if (createdTasks.length > 0) {
        setTasks([...createdTasks, ...tasks])
      }
    } catch (error) {
      setError('Failed to create AI-suggested tasks')
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesAssignee = assigneeFilter === 'all' || task.assignedTo === assigneeFilter
    
    return matchesSearch && matchesPriority && matchesAssignee
  })

  // Group tasks by status with counts
  const columns = statusColumns.map(column => ({
    ...column,
    count: filteredTasks.filter(task => task.status === column.status).length,
    tasks: filteredTasks.filter(task => task.status === column.status)
  }))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${showChatbot ? 'mr-96' : ''}`}>
        <div className="p-6 max-w-6xl mx-auto h-full overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">
              Organize and track your tasks with our Kanban board
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showChatbot 
                  ? 'bg-[#873bff] text-white' 
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Assistant
              {showChatbot && <X className="w-4 h-4 ml-1" />}
            </button>
            
            <button
              onClick={generateSuggestions}
              disabled={suggesting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {suggesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Suggestions
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
            >
              <option value="all">All Assignees</option>
              <option value={profile?.id || 'me'}>Me</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            {error.toLowerCase().includes('upgrade') && (
              <a href="/dashboard/billing" className="text-sm font-medium text-red-700 hover:text-red-900 underline mt-1 inline-block">
                View pricing plans →
              </a>
            )}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Task Suggestions
            </h2>
            <button
              onClick={() => setSuggestions([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{suggestion.title || 'AI Task'}</p>
                  {suggestion.description && (
                    <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: suggestion.title,
                          description: suggestion.description || ''
                        })
                      })
                      const data = await res.json()
                      
                      if (data.task) {
                        const enhancedTask: Task = {
                          ...data.task,
                          status: 'todo',
                          priority: 'medium',
                          tags: [],
                          starred: false,
                          assignedTo: profile?.id,
                          dueDate: null,
                        }
                        setTasks([enhancedTask, ...tasks])
                        setSuggestions(suggestions.filter((_, i) => i !== index))
                      }
                    } catch (error) {
                      setError('Failed to create task from suggestion')
                    }
                  }}
                  className="ml-3 px-3 py-1.5 text-sm bg-[#873bff] text-white rounded hover:bg-[#7a35e6] transition-colors"
                >
                  Add Task
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-50 rounded-xl p-4">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-20 bg-white rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div
              key={column.id}
              className={`rounded-xl p-4 min-h-96 transition-colors ${
                dragOverColumn === column.id ? 'bg-[#873bff]/5 border-2 border-[#873bff] border-dashed' : column.bgColor
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${column.color}`}>
                  {column.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full bg-white ${column.color}`}>
                  {column.count}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    ref={el => { if (el) taskRefs.current[task.id] = el }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className={`bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-all cursor-move ${
                      draggedTask?.id === task.id ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[task.priority]}`}>
                          <Flag className="w-3 h-3 mr-1" />
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <button
                          onClick={() => toggleStarred(task.id)}
                          className="text-gray-400 hover:text-yellow-500 transition-colors"
                        >
                          {task.starred ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      <div className="relative">
                        <button
                          onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {selectedTask === task.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Edit2 className="w-4 h-4" />
                              Edit Task
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Task Title */}
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {task.title}
                    </h4>
                    
                    {/* Task Description */}
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Task Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Me</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(task.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State */}
                {column.tasks.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckSquare className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  />
                </div>
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newTask.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(tagInput)
                      }
                    }}
                    placeholder="Add tags (press Enter)"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 text-sm"
                  />
                  <button
                    onClick={() => addTag(tagInput)}
                    type="button"
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewTask({
                    title: '',
                    description: '',
                    priority: 'medium',
                    dueDate: '',
                    assignedTo: '',
                    projectId: '',
                    status: 'todo',
                    tags: [],
                  })
                  setTagInput('')
                  setError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                disabled={creating || !newTask.title.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
      
      {/* AI Chatbot Panel */}
      {showChatbot && (
        <div className="fixed right-0 top-0 w-96 h-full bg-white border-l border-gray-200 shadow-xl z-40">
          <TasksChatbot 
            className="h-full" 
            onTaskCreate={handleChatbotTaskCreate}
          />
        </div>
      )}
    </div>
  )
}

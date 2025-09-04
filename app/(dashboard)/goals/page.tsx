'use client'

import { useUser } from '@/hooks/useUser'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { 
  Target, 
  Plus, 
  Search, 
  Calendar,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Flag,
  BarChart3,
  ArrowUpDown,
  Filter,
  X,
  Trophy,
  Zap
} from 'lucide-react'
import Link from 'next/link'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

interface Goal {
  id: string
  title: string
  description?: string
  target: number
  current: number
  type: 'TASK' | 'PROJECT' | 'CUSTOM'
  deadline?: Date
  createdAt: Date
  updatedAt: Date
  userId: string
}

export default function GoalsPage() {
  const { user, isLoaded } = useUser()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('deadline')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 100,
    current: 0,
    type: 'CUSTOM' as const,
    deadline: ''
  })

  // Fetch goals from database
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const supabase = createClient()
        
        const { data: goalsData, error } = await supabase
          .from('goals')
          .select('*')
          .eq('userId', user.id)
          .order('createdAt', { ascending: false })

        if (error) throw error

        setGoals(goalsData || [])

      } catch (error) {
        console.error('Error fetching goals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [user])

  // Filter and sort goals
  const filteredGoals = goals
    .filter(goal => {
      // Search filter
      if (searchQuery && !goal.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !goal.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Type filter
      if (selectedType !== 'all' && goal.type !== selectedType) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'deadline':
          aValue = a.deadline ? new Date(a.deadline).getTime() : 0
          bValue = b.deadline ? new Date(b.deadline).getTime() : 0
          break
        case 'progress':
          aValue = (a.current / a.target) * 100
          bValue = (b.current / b.target) * 100
          break
        case 'target':
          aValue = a.target
          bValue = b.target
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  // CRUD Functions
  const handleCreateGoal = async () => {
    if (!user || !newGoal.title.trim()) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .insert({
          title: newGoal.title,
          description: newGoal.description || null,
          target: newGoal.target,
          current: newGoal.current,
          type: newGoal.type,
          deadline: newGoal.deadline || null,
          userId: user.id
        })
        .select()
        .single()

      if (error) throw error

      setGoals([data, ...goals])
      setNewGoal({
        title: '',
        description: '',
        target: 100,
        current: 0,
        type: 'CUSTOM',
        deadline: ''
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const handleEditGoal = async () => {
    if (!editingGoal) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .update({
          title: editingGoal.title,
          description: editingGoal.description,
          target: editingGoal.target,
          current: editingGoal.current,
          type: editingGoal.type,
          deadline: editingGoal.deadline
        })
        .eq('id', editingGoal.id)
        .select()
        .single()

      if (error) throw error

      setGoals(goals.map(goal => goal.id === editingGoal.id ? data : goal))
      setEditingGoal(null)
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error

      setGoals(goals.filter(goal => goal.id !== goalId))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleUpdateProgress = async (goal: Goal, newCurrent: number) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .update({ current: newCurrent })
        .eq('id', goal.id)
        .select()
        .single()

      if (error) throw error

      setGoals(goals.map(g => g.id === goal.id ? data : g))
    } catch (error) {
      console.error('Error updating goal progress:', error)
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TASK': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PROJECT': return 'bg-green-100 text-green-800 border-green-200'
      case 'CUSTOM': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TASK': return CheckCircle
      case 'PROJECT': return BarChart3
      case 'CUSTOM': return Target
      default: return Target
    }
  }

  // Calculate stats
  const totalGoals = goals.length
  const completedGoals = goals.filter(goal => goal.current >= goal.target).length
  const averageProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + getProgressPercentage(goal.current, goal.target), 0) / goals.length)
    : 0
  const overdue = goals.filter(goal => 
    goal.deadline && new Date(goal.deadline) < new Date() && goal.current < goal.target
  ).length

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 relative">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20 relative z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Goals</h1>
              <p className="text-gray-600 mt-1">
                Track your progress and achieve your objectives
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Create Goal Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{overdue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm border rounded-xl p-4 mb-6 shadow-lg border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="TASK">Task Goals</option>
                <option value="PROJECT">Project Goals</option>
                <option value="CUSTOM">Custom Goals</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="title">Sort by Title</option>
                <option value="progress">Sort by Progress</option>
                <option value="target">Sort by Target</option>
                <option value="createdAt">Sort by Created Date</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No goals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedType !== 'all'
                ? 'Try adjusting your filters or search term.'
                : 'Get started by creating your first goal.'
              }
            </p>
            {!searchQuery && selectedType === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Goals Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Showing {filteredGoals.length} of {goals.length} goals
              </p>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGoals.map((goal) => {
                const progress = getProgressPercentage(goal.current, goal.target)
                const isCompleted = goal.current >= goal.target
                const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !isCompleted
                const TypeIcon = getTypeIcon(goal.type)

                return (
                  <div key={goal.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-5 w-5 text-purple-600" />
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(goal.type)}`}>
                          {goal.type}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingGoal(goal)
                            setShowEditModal(true)
                          }}
                          className="p-1 text-gray-400 hover:text-purple-600 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {goal.title}
                      {isCompleted && <Trophy className="inline h-5 w-5 text-yellow-500 ml-2" />}
                    </h3>

                    {goal.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{goal.description}</p>
                    )}

                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className={`h-3 rounded-full ${
                            isCompleted ? 'bg-green-500' : 
                            isOverdue ? 'bg-red-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{goal.current} of {goal.target}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateProgress(goal, Math.max(0, goal.current - 1))}
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold"
                            disabled={goal.current <= 0}
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleUpdateProgress(goal, Math.min(goal.target, goal.current + 1))}
                            className="w-6 h-6 rounded bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center text-xs font-bold"
                            disabled={goal.current >= goal.target}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center justify-between text-sm">
                      {goal.deadline && (
                        <div className={`flex items-center ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          {isOverdue ? 'Overdue' : format(new Date(goal.deadline), 'MMM dd, yyyy')}
                        </div>
                      )}
                      
                      {isCompleted && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateProgress(goal, goal.target)}
                          disabled={isCompleted}
                          className="flex-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => {
                            setEditingGoal(goal)
                            setShowEditModal(true)
                          }}
                          className="flex-1 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                          Edit Goal
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Goal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter goal title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter goal description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Progress
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={newGoal.target}
                    value={newGoal.current}
                    onChange={(e) => setNewGoal({ ...newGoal, current: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type
                </label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as 'TASK' | 'PROJECT' | 'CUSTOM' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="CUSTOM">Custom Goal</option>
                  <option value="TASK">Task Goal</option>
                  <option value="PROJECT">Project Goal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateGoal}
                disabled={!newGoal.title.trim() || newGoal.target < 1}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && editingGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Goal</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter goal title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingGoal.description || ''}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter goal description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingGoal.target}
                    onChange={(e) => setEditingGoal({ ...editingGoal, target: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Progress
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editingGoal.target}
                    value={editingGoal.current}
                    onChange={(e) => setEditingGoal({ ...editingGoal, current: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type
                </label>
                <select
                  value={editingGoal.type}
                  onChange={(e) => setEditingGoal({ ...editingGoal, type: e.target.value as 'TASK' | 'PROJECT' | 'CUSTOM' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="CUSTOM">Custom Goal</option>
                  <option value="TASK">Task Goal</option>
                  <option value="PROJECT">Project Goal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={editingGoal.deadline ? format(new Date(editingGoal.deadline), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEditingGoal({ ...editingGoal, deadline: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleEditGoal}
                disabled={!editingGoal.title.trim() || editingGoal.target < 1}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

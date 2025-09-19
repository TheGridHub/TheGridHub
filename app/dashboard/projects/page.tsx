"use client"

import React, { useEffect, useState, useRef } from 'react'
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  Calendar,
  CheckSquare,
  Paperclip,
  Upload,
  Download,
  Eye,
  EyeOff,
  Star,
  StarOff,
  FolderOpen,
  Clock,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  Loader2,
  FileText,
  Image,
  File,
} from 'lucide-react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useWorkspace } from '@/hooks/useWorkspace'

interface Project { 
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'on-hold' | 'archived'
  progress: number
  team_members: string[]
  created_at: string
  updated_at: string
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  starred: boolean
}

interface Attachment { 
  id: string
  key: string
  url?: string | null
  size_bytes: number
  created_at: string
  type: string
}

interface CreateProjectData {
  name: string
  description: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
}

const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  'on-hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  archived: 'bg-gray-100 text-gray-700 border-gray-200',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-red-100 text-red-700 border-red-200',
}

export default function ProjectsPage() {
  const { profile, isFreePlan } = useUserProfile()
  const { workspace } = useWorkspace()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'due_date' | 'progress'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [files, setFiles] = useState<Record<string, Attachment[]>>({})
  const [filesLoading, setFilesLoading] = useState<Record<string, boolean>>({})
  const [newProject, setNewProject] = useState<CreateProjectData>({
    name: '',
    description: '',
    priority: 'medium',
    due_date: '',
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProjects = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const res = await fetch('/api/projects')
      const data = await res.json()
      
      // Transform API data to match our interface with mock enhancements
      const enhancedProjects = (data.projects || []).map((project: any) => ({
        ...project,
        status: project.status || 'active',
        progress: Math.floor(Math.random() * 100),
        team_members: [`${profile?.id}`],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        starred: Math.random() > 0.7,
        due_date: project.due_date || (Math.random() > 0.5 ? 
          new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
          : undefined),
      }))
      
      setProjects(enhancedProjects)
    } catch (error) {
      setMessage('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [])

  const createProject = async () => {
    if (!newProject.name.trim()) return
    
    // Check free plan limits
    if (isFreePlan && projects.length >= 5) {
      setUpgradeRequired(true)
      setMessage('Free plan is limited to 5 projects. Upgrade to Pro for unlimited projects.')
      return
    }

    setCreating(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/projects', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(newProject) 
      })
      const data = await res.json()
      
      if (res.ok && data.project) {
        const enhancedProject = {
          ...data.project,
          status: 'active' as const,
          progress: 0,
          team_members: [`${profile?.id}`],
          priority: newProject.priority,
          starred: false,
          due_date: newProject.due_date,
        }
        
        setProjects([enhancedProject, ...projects])
        setNewProject({ name: '', description: '', priority: 'medium', due_date: '' })
        setShowCreateModal(false)
        setUpgradeRequired(false)
      } else if (data.upgradeRequired) {
        setUpgradeRequired(true)
        setMessage(data.reason || 'Upgrade required to create more projects.')
      } else {
        setMessage(data.error || 'Failed to create project')
      }
    } catch (error) {
      setMessage('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const loadFiles = async (projectId: string) => {
    setFilesLoading(x => ({ ...x, [projectId]: true }))
    try {
      const res = await fetch(`/api/projects/${projectId}/files`)
      const data = await res.json()
      setFiles(x => ({ ...x, [projectId]: data || [] }))
    } finally {
      setFilesLoading(x => ({ ...x, [projectId]: false }))
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }
    
    const previousProjects = projects
    setProjects(projects.filter(p => p.id !== id))
    
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setProjects(previousProjects)
        setMessage('Failed to delete project')
      }
    } catch (error) {
      setProjects(previousProjects)
      setMessage('Failed to delete project')
    }
  }

  const toggleStar = async (id: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, starred: !p.starred } : p))
  }

  const updateProjectStatus = async (id: string, status: Project['status']) => {
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p))
  }

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      let aVal: any, bVal: any
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'created_at':
          aVal = new Date(a.created_at)
          bVal = new Date(b.created_at)
          break
        case 'due_date':
          aVal = a.due_date ? new Date(a.due_date) : new Date('9999-12-31')
          bVal = b.due_date ? new Date(b.due_date) : new Date('9999-12-31')
          break
        case 'progress':
          aVal = a.progress
          bVal = b.progress
          break
        default:
          aVal = a.created_at
          bVal = b.created_at
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    const gb = mb / 1024
    return `${gb.toFixed(2)} GB`
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.includes('pdf') || type.includes('document')) return FileText
    return File
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage your projects and track progress
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <Eye className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="archived">Archived</option>
            </select>
            
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
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as any)
                setSortOrder(order as 'asc' | 'desc')
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="due_date-asc">Due Date</option>
              <option value="progress-desc">Progress</option>
            </select>
          </div>
        </div>
        
        {isFreePlan && projects.length >= 4 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              You're approaching the 5 project limit for free plans. 
              <a href="/dashboard/billing" className="font-medium underline hover:no-underline">
                Upgrade to Pro for unlimited projects.
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {message && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{message}</p>
            {upgradeRequired && (
              <a href="/dashboard/billing" className="text-sm font-medium text-red-700 hover:text-red-900 underline mt-1 inline-block">
                View pricing plans →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Projects Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-2 bg-gray-200 rounded w-full mb-2" />
                <div className="h-8 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">
            {projects.length === 0 
              ? 'Get started by creating your first project'
              : 'Try adjusting your search or filters'
            }
          </p>
          {projects.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredAndSortedProjects.map(project => (
            <div key={project.id} className={`bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all ${
              viewMode === 'list' ? 'p-4' : 'p-6'
            }`}>
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <button
                      onClick={() => toggleStar(project.id)}
                      className="text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      {project.starred ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  )}
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {selectedProject === project.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit Project
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Project
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Project Meta */}
              <div className="flex items-center gap-4 mb-4 text-xs">
                <span className={`inline-flex items-center px-2 py-1 rounded-full border font-medium ${statusColors[project.status]}`}>
                  {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full border font-medium ${priorityColors[project.priority]}`}>
                  {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                </span>
                {project.due_date && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.due_date)}
                  </span>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#873bff] to-[#7a35e6] h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              
              {/* Project Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.team_members.length}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setExpanded(x => ({ ...x, [project.id]: !x[project.id] }))
                      if (!expanded[project.id]) await loadFiles(project.id)
                    }}
                    className="text-xs text-gray-500 hover:text-[#873bff] transition-colors flex items-center gap-1"
                  >
                    <Paperclip className="w-3 h-3" />
                    Files
                  </button>
                </div>
              </div>
              
              {/* Attachments Panel */}
              {expanded[project.id] && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Attachments</h4>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        try {
                          const pres = await fetch(`/api/projects/${project.id}/files/presign`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              size: file.size,
                              contentType: file.type,
                              ext: file.name.split('.').pop()
                            })
                          })
                          const pre = await pres.json()
                          
                          if (!pres.ok || pre.error) {
                            setMessage(pre.reason || pre.error || 'Upload not allowed')
                            return
                          }
                          
                          await fetch(pre.url, {
                            method: 'PUT',
                            headers: { 'Content-Type': file.type },
                            body: file
                          })
                          
                          await fetch(`/api/projects/${project.id}/files/complete`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              key: pre.key,
                              url: pre.publicUrl,
                              size: file.size
                            })
                          })
                          
                          await loadFiles(project.id)
                        } catch (error) {
                          setMessage('Failed to upload file')
                        }
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#873bff] hover:text-[#7a35e6] font-medium flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      Upload
                    </button>
                  </div>
                  
                  {filesLoading[project.id] ? (
                    <div className="text-sm text-gray-500">Loading files...</div>
                  ) : (files[project.id]?.length || 0) === 0 ? (
                    <div className="text-sm text-gray-500">No files attached</div>
                  ) : (
                    <div className="space-y-2">
                      {files[project.id]?.map(file => {
                        const FileIcon = getFileIcon(file.type)
                        return (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <FileIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 truncate">
                                {file.key.split('/').pop()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {formatFileSize(file.size_bytes)}
                              </span>
                              {file.url && (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#873bff] hover:text-[#7a35e6]"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Project description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as any })}
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
                    value={newProject.due_date}
                    onChange={(e) => setNewProject({ ...newProject, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  />
                </div>
              </div>
              
              {isFreePlan && projects.length >= 5 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Free plan is limited to 5 projects. Upgrade to Pro for unlimited projects.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewProject({ name: '', description: '', priority: 'medium', due_date: '' })
                  setMessage(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={creating || !newProject.name.trim() || (isFreePlan && projects.length >= 5)}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

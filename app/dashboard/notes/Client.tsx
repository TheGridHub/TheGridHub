'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Pin,
  PinOff,
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
  Download,
  Upload,
  X,
  Check,
  AlertCircle,
  Calendar,
  Tag,
  Folder,
  Grid,
  List,
  Loader2,
  Star,
  StarOff,
  History,
  Save,
  Copy,
  ExternalLink,
  Bold,
  Italic,
  Underline,
  Code,
  Link,
  Quote,
  ListOrdered,
  AlignLeft,
  Image as ImageIcon,
  Palette,
  Type,
  Maximize2,
  Minimize2
} from 'lucide-react'

// Types
interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  pinned: boolean
  starred: boolean
  shared: boolean
  created_at: string
  updated_at: string
  last_edited: string
  author: string
  word_count: number
  version: number
}

interface NoteForm {
  title: string
  content: string
  category: string
  tags: string[]
}

// Categories
const NOTE_CATEGORIES = [
  'General', 'Personal', 'Work', 'Ideas', 'Meeting Notes', 
  'Research', 'Documentation', 'Todo', 'Project Notes', 'Other'
]

// Mock rich text editor toolbar
const ToolbarButton = ({ icon: Icon, isActive, onClick, tooltip }: {
  icon: any, isActive?: boolean, onClick: () => void, tooltip: string
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
      isActive ? 'bg-[#873bff]/10 text-[#873bff]' : 'text-gray-600'
    }`}
    title={tooltip}
  >
    <Icon className="w-4 h-4" />
  </button>
)

export default function NotesClient() {
  // State
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [newNote, setNewNote] = useState<NoteForm>({
    title: '',
    content: '',
    category: 'General',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Mock data for demonstration
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Project Kickoff Meeting Notes',
      content: 'Meeting with the team to discuss the new project requirements and timeline. Key points:\n\n• Project deadline: March 15th\n• Team members: John, Sarah, Mike\n• Budget: $50k\n• Main deliverables: Web app, mobile app, API\n\nNext steps:\n1. Create project timeline\n2. Set up development environment\n3. Schedule weekly check-ins',
      category: 'Meeting Notes',
      tags: ['project', 'meeting', 'timeline'],
      pinned: true,
      starred: false,
      shared: false,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T14:20:00Z',
      last_edited: '2024-01-15T14:20:00Z',
      author: 'You',
      word_count: 87,
      version: 2
    },
    {
      id: '2',
      title: 'Research: React Best Practices',
      content: '# React Best Practices\n\n## Performance\n- Use React.memo for expensive components\n- Implement proper key props for lists\n- Lazy load components with React.lazy()\n\n## Code Organization\n- Keep components small and focused\n- Use custom hooks for reusable logic\n- Implement proper error boundaries\n\n## State Management\n- Use local state when possible\n- Consider Context for global state\n- Implement proper loading states',
      category: 'Research',
      tags: ['react', 'javascript', 'best-practices'],
      pinned: false,
      starred: true,
      shared: true,
      created_at: '2024-01-12T09:15:00Z',
      updated_at: '2024-01-13T16:45:00Z',
      last_edited: '2024-01-13T16:45:00Z',
      author: 'You',
      word_count: 156,
      version: 5
    },
    {
      id: '3',
      title: 'Ideas for Q2 Features',
      content: 'Brainstorming session ideas for next quarter:\n\n🚀 New Features\n- Dark mode support\n- Advanced search functionality\n- Real-time collaboration\n- Mobile app improvements\n\n💡 Improvements\n- Performance optimizations\n- Better error handling\n- Enhanced user onboarding\n- Accessibility improvements\n\n📊 Analytics\n- User behavior tracking\n- Performance metrics\n- Feature usage statistics',
      category: 'Ideas',
      tags: ['brainstorming', 'features', 'q2', 'roadmap'],
      pinned: false,
      starred: false,
      shared: false,
      created_at: '2024-01-10T11:30:00Z',
      updated_at: '2024-01-11T09:20:00Z',
      last_edited: '2024-01-11T09:20:00Z',
      author: 'You',
      word_count: 142,
      version: 3
    },
    {
      id: '4',
      title: 'Weekly Todo List',
      content: '## This Week’s Tasks\n\n### High Priority\n- [ ] Complete project proposal\n- [ ] Review team code submissions\n- [ ] Prepare presentation for client meeting\n\n### Medium Priority\n- [ ] Update documentation\n- [ ] Schedule 1:1 meetings with team\n- [ ] Research new tools and technologies\n\n### Low Priority\n- [ ] Organize workspace\n- [ ] Update profile information\n- [ ] Plan team building activities',
      category: 'Todo',
      tags: ['tasks', 'weekly', 'planning'],
      pinned: true,
      starred: false,
      shared: false,
      created_at: '2024-01-08T08:00:00Z',
      updated_at: '2024-01-08T18:30:00Z',
      last_edited: '2024-01-08T18:30:00Z',
      author: 'You',
      word_count: 98,
      version: 1
    }
  ]

  // Load notes
  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNotes(mockNotes)
    } catch (error) {
      setError('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter
    const matchesPinned = !showPinnedOnly || note.pinned

    return matchesSearch && matchesCategory && matchesPinned
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(notes.map(n => n.category))).filter(Boolean)

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Count words
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Auto-save functionality
  const autoSave = useCallback((content: string, title: string) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      if ((content.trim() || title.trim()) && (editingNote || showEditor)) {
        setSaving(true)
        try {
          // Simulate auto-save
          await new Promise(resolve => setTimeout(resolve, 500))
          // Update note in state
          if (editingNote) {
            setNotes(notes.map(n => 
              n.id === editingNote.id 
                ? { ...n, content, title: title || n.title, updated_at: new Date().toISOString(), word_count: countWords(content) }
                : n
            ))
          }
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setSaving(false)
        }
      }
    }, 1000) // Auto-save after 1 second of inactivity
  }, [editingNote, showEditor, notes])

  // Create note
  const createNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      setError('Please add a title or content')
      return
    }

    setCreating(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title || 'Untitled Note',
        content: newNote.content,
        category: newNote.category,
        tags: newNote.tags,
        pinned: false,
        starred: false,
        shared: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_edited: new Date().toISOString(),
        author: 'You',
        word_count: countWords(newNote.content),
        version: 1
      }

      setNotes([note, ...notes])
      setShowCreateModal(false)
      setNewNote({
        title: '',
        content: '',
        category: 'General',
        tags: [],
      })
      setTagInput('')
    } catch (error) {
      setError('Failed to create note')
    } finally {
      setCreating(false)
    }
  }

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setNotes(notes.filter(n => n.id !== id))
      setSelectedNote(null)
    } catch (error) {
      setError('Failed to delete note')
    }
  }

  // Toggle pin
  const togglePinned = async (id: string) => {
    try {
      setNotes(notes.map(n => 
        n.id === id ? { ...n, pinned: !n.pinned } : n
      ))
    } catch (error) {
      setError('Failed to update note')
    }
  }

  // Toggle star
  const toggleStarred = async (id: string) => {
    try {
      setNotes(notes.map(n => 
        n.id === id ? { ...n, starred: !n.starred } : n
      ))
    } catch (error) {
      setError('Failed to update note')
    }
  }

  // Add tag
  const addTag = (tag: string) => {
    if (tag.trim() && !newNote.tags.includes(tag.trim())) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, tag.trim()]
      })
      setTagInput('')
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(t => t !== tag)
    })
  }

  // Export note
  const exportNote = (note: Note, format: 'txt' | 'md' = 'md') => {
    const content = format === 'md' 
      ? `# ${note.title}\n\n${note.content}` 
      : `${note.title}\n\n${note.content}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 bg-white z-50' : 'p-6 max-w-7xl mx-auto'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            <p className="text-gray-600 mt-1">
              Create, organize, and manage your notes with rich text editing
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Note
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
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                showPinnedOnly 
                  ? 'border-[#873bff] bg-[#873bff]/10 text-[#873bff]' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Pin className="w-4 h-4" />
              Pinned Only
            </button>
            
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-[#873bff] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm border-l ${
                  viewMode === 'list' 
                    ? 'bg-[#873bff] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notes */}
      {loading ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 bg-gray-200 rounded w-16" />
                  <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || categoryFilter !== 'all' || showPinnedOnly ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || categoryFilter !== 'all' || showPinnedOnly
              ? 'Try adjusting your search or filters'
              : 'Start capturing your thoughts and ideas by creating your first note'
            }
          </p>
          {!searchQuery && categoryFilter === 'all' && !showPinnedOnly && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Your First Note
            </button>
          )}
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {filteredNotes.map(note => (
            <div key={note.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Note Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {note.pinned && <Pin className="w-4 h-4 text-[#873bff]" />}
                    {note.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    {note.shared && <Share2 className="w-4 h-4 text-blue-500" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-600">{note.category}</p>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setSelectedNote(selectedNote === note.id ? null : note.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {selectedNote === note.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={() => {
                          setEditingNote(note)
                          setShowEditor(true)
                          setSelectedNote(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Note
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(note.content)
                          setSelectedNote(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Content
                      </button>
                      <button
                        onClick={() => {
                          exportNote(note)
                          setSelectedNote(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <button
                        onClick={() => {
                          toggleStarred(note.id)
                          setSelectedNote(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        {note.starred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                        {note.starred ? 'Unstar' : 'Star'}
                      </button>
                      <button
                        onClick={() => {
                          togglePinned(note.id)
                          setSelectedNote(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        {note.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        {note.pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => {
                          deleteNote(note.id)
                          setSelectedNote(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Content Preview */}
              <div 
                className="mb-4 cursor-pointer"
                onClick={() => {
                  setEditingNote(note)
                  setShowEditor(true)
                }}
              >
                <p className="text-sm text-gray-700 line-clamp-4">
                  {note.content.replace(/[#*_`]/g, '').substring(0, 200)}
                  {note.content.length > 200 && '...'}
                </p>
              </div>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {note.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Note Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span>{note.word_count} words</span>
                  <span>v{note.version}</span>
                </div>
                <span>Updated {formatRelativeTime(note.updated_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Note</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Enter note title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                >
                  {NOTE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Start writing your note..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff] font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {countWords(newNote.content)} words
                </p>
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newNote.tags.map(tag => (
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
                  setNewNote({
                    title: '',
                    content: '',
                    category: 'General',
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
                onClick={createNote}
                disabled={creating || (!newNote.title.trim() && !newNote.content.trim())}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Create Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Editor Modal */}
      {(showEditor || editingNote) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-5xl w-full h-[90vh] flex flex-col">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingNote ? 'Edit Note' : 'New Note'}
                </h2>
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportNote(editingNote!, 'md')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Export as Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowEditor(false)
                    setEditingNote(null)
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Rich Text Toolbar */}
            <div className="flex items-center gap-1 p-3 border-b bg-gray-50">
              <ToolbarButton icon={Bold} onClick={() => {}} tooltip="Bold" />
              <ToolbarButton icon={Italic} onClick={() => {}} tooltip="Italic" />
              <ToolbarButton icon={Underline} onClick={() => {}} tooltip="Underline" />
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <ToolbarButton icon={Quote} onClick={() => {}} tooltip="Quote" />
              <ToolbarButton icon={Code} onClick={() => {}} tooltip="Code" />
              <ToolbarButton icon={Link} onClick={() => {}} tooltip="Link" />
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <ToolbarButton icon={List} onClick={() => {}} tooltip="Bullet List" />
              <ToolbarButton icon={ListOrdered} onClick={() => {}} tooltip="Numbered List" />
              <div className="w-px h-6 bg-gray-300 mx-2" />
              <ToolbarButton icon={ImageIcon} onClick={() => {}} tooltip="Insert Image" />
              <ToolbarButton icon={Type} onClick={() => {}} tooltip="Heading" />
              
              <div className="ml-auto text-sm text-gray-500">
                {editingNote && `${editingNote.word_count} words`}
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="flex-1 p-4">
              <input
                type="text"
                value={editingNote?.title || ''}
                onChange={(e) => {
                  if (editingNote) {
                    const updatedNote = { ...editingNote, title: e.target.value }
                    setEditingNote(updatedNote)
                    autoSave(updatedNote.content, e.target.value)
                  }
                }}
                placeholder="Note title"
                className="w-full text-xl font-semibold border-none outline-none mb-4 placeholder-gray-400"
              />
              
              <textarea
                ref={editorRef}
                value={editingNote?.content || ''}
                onChange={(e) => {
                  if (editingNote) {
                    const updatedNote = { ...editingNote, content: e.target.value }
                    setEditingNote(updatedNote)
                    autoSave(e.target.value, updatedNote.title)
                  }
                }}
                placeholder="Start writing your note..."
                className="w-full h-full resize-none border-none outline-none font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


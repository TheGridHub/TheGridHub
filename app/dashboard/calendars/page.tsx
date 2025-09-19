'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Filter,
  Clock,
  MapPin,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Bell,
  Repeat,
  X,
  Check,
  CheckCircle,
  AlertCircle,
  Video,
  Phone,
  FileText,
  Tag,
  Loader2,
  Download,
  Upload,
  Zap,
  Globe,
  User
} from 'lucide-react'

// Types
interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  type: 'meeting' | 'task' | 'reminder' | 'deadline' | 'personal'
  category: string
  location?: string
  attendees?: string[]
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: Date
  }
  reminder?: {
    minutes: number
    type: 'notification' | 'email'
  }
  videoUrl?: string
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  status: 'confirmed' | 'tentative' | 'cancelled'
  created_by: string
  created_at: Date
}

interface EventForm {
  title: string
  description: string
  start: string
  end: string
  type: CalendarEvent['type']
  category: string
  location: string
  attendees: string[]
  recurring: boolean
  recurringType: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurringInterval: number
  reminderMinutes: number
  videoUrl: string
  tags: string[]
  priority: 'low' | 'medium' | 'high'
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda'

const EVENT_TYPES = {
  meeting: { color: 'bg-blue-500', textColor: 'text-white', icon: Users },
  task: { color: 'bg-green-500', textColor: 'text-white', icon: CheckCircle },
  reminder: { color: 'bg-yellow-500', textColor: 'text-black', icon: Bell },
  deadline: { color: 'bg-red-500', textColor: 'text-white', icon: AlertCircle },
  personal: { color: 'bg-purple-500', textColor: 'text-white', icon: User }
}

const PRIORITY_COLORS = {
  low: 'border-l-gray-400',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500'
}

const CATEGORIES = [
  'Work', 'Personal', 'Health', 'Education', 'Travel', 'Social', 'Other'
]

export default function CalendarsPage() {
  // State
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null)
  
  const [newEvent, setNewEvent] = useState<EventForm>({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'meeting',
    category: 'Work',
    location: '',
    attendees: [],
    recurring: false,
    recurringType: 'weekly',
    recurringInterval: 1,
    reminderMinutes: 15,
    videoUrl: '',
    tags: [],
    priority: 'medium'
  })
  const [tagInput, setTagInput] = useState('')
  const [attendeeInput, setAttendeeInput] = useState('')

  // Mock events data
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Standup',
      description: 'Daily team sync meeting to discuss progress and blockers',
      start: new Date(2024, new Date().getMonth(), new Date().getDate(), 9, 0),
      end: new Date(2024, new Date().getMonth(), new Date().getDate(), 9, 30),
      type: 'meeting',
      category: 'Work',
      location: 'Conference Room A',
      attendees: ['john@company.com', 'sarah@company.com'],
      recurring: {
        type: 'daily',
        interval: 1
      },
      reminder: {
        minutes: 15,
        type: 'notification'
      },
      videoUrl: 'https://meet.google.com/abc-123',
      tags: ['standup', 'team', 'daily'],
      priority: 'high',
      status: 'confirmed',
      created_by: 'You',
      created_at: new Date()
    },
    {
      id: '2',
      title: 'Project Review',
      description: 'Quarterly project review with stakeholders',
      start: new Date(2024, new Date().getMonth(), new Date().getDate() + 1, 14, 0),
      end: new Date(2024, new Date().getMonth(), new Date().getDate() + 1, 16, 0),
      type: 'meeting',
      category: 'Work',
      location: 'Boardroom',
      attendees: ['manager@company.com', 'stakeholder@company.com'],
      tags: ['review', 'quarterly', 'stakeholders'],
      priority: 'high',
      status: 'confirmed',
      created_by: 'You',
      created_at: new Date()
    },
    {
      id: '3',
      title: 'Complete UI Design',
      description: 'Finish the user interface design for the mobile app',
      start: new Date(2024, new Date().getMonth(), new Date().getDate() + 2, 10, 0),
      end: new Date(2024, new Date().getMonth(), new Date().getDate() + 2, 17, 0),
      type: 'task',
      category: 'Work',
      tags: ['design', 'ui', 'mobile'],
      priority: 'medium',
      status: 'confirmed',
      created_by: 'You',
      created_at: new Date()
    },
    {
      id: '4',
      title: 'Dentist Appointment',
      start: new Date(2024, new Date().getMonth(), new Date().getDate() + 3, 11, 0),
      end: new Date(2024, new Date().getMonth(), new Date().getDate() + 3, 12, 0),
      type: 'personal',
      category: 'Health',
      location: 'Downtown Dental Clinic',
      reminder: {
        minutes: 60,
        type: 'notification'
      },
      tags: ['health', 'appointment'],
      priority: 'medium',
      status: 'confirmed',
      created_by: 'You',
      created_at: new Date()
    },
    {
      id: '5',
      title: 'Submit Report',
      description: 'Final deadline for quarterly report submission',
      start: new Date(2024, new Date().getMonth(), new Date().getDate() + 5, 17, 0),
      end: new Date(2024, new Date().getMonth(), new Date().getDate() + 5, 17, 30),
      type: 'deadline',
      category: 'Work',
      tags: ['deadline', 'report', 'quarterly'],
      priority: 'high',
      status: 'confirmed',
      created_by: 'You',
      created_at: new Date()
    }
  ]

  // Load events
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEvents(mockEvents)
    } catch (error) {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  // Get calendar grid for month view
  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i)
      days.push({ date: day, isCurrentMonth: false })
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Next month days to fill the grid
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Navigate calendar
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    
    setCurrentDate(newDate)
  }

  // Create event
  const createEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start || !newEvent.end) {
      setError('Please fill in all required fields')
      return
    }

    setCreating(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const event: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
        type: newEvent.type,
        category: newEvent.category,
        location: newEvent.location,
        attendees: newEvent.attendees,
        recurring: newEvent.recurring ? {
          type: newEvent.recurringType,
          interval: newEvent.recurringInterval
        } : undefined,
        reminder: {
          minutes: newEvent.reminderMinutes,
          type: 'notification'
        },
        videoUrl: newEvent.videoUrl,
        tags: newEvent.tags,
        priority: newEvent.priority,
        status: 'confirmed',
        created_by: 'You',
        created_at: new Date()
      }

      setEvents([...events, event])
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      setError('Failed to create event')
    } finally {
      setCreating(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      start: '',
      end: '',
      type: 'meeting',
      category: 'Work',
      location: '',
      attendees: [],
      recurring: false,
      recurringType: 'weekly',
      recurringInterval: 1,
      reminderMinutes: 15,
      videoUrl: '',
      tags: [],
      priority: 'medium'
    })
    setTagInput('')
    setAttendeeInput('')
  }

  // Delete event
  const deleteEvent = async (id: string) => {
    try {
      setEvents(events.filter(e => e.id !== id))
      setSelectedEvent(null)
    } catch (error) {
      setError('Failed to delete event')
    }
  }

  // Add tag
  const addTag = (tag: string) => {
    if (tag.trim() && !newEvent.tags.includes(tag.trim())) {
      setNewEvent({
        ...newEvent,
        tags: [...newEvent.tags, tag.trim()]
      })
      setTagInput('')
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setNewEvent({
      ...newEvent,
      tags: newEvent.tags.filter(t => t !== tag)
    })
  }

  // Add attendee
  const addAttendee = (email: string) => {
    if (email.trim() && !newEvent.attendees.includes(email.trim())) {
      setNewEvent({
        ...newEvent,
        attendees: [...newEvent.attendees, email.trim()]
      })
      setAttendeeInput('')
    }
  }

  // Remove attendee
  const removeAttendee = (email: string) => {
    setNewEvent({
      ...newEvent,
      attendees: newEvent.attendees.filter(a => a !== email)
    })
  }

  // Get current view title
  const getViewTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'week') {
      const weekStart = new Date(currentDate)
      weekStart.setDate(currentDate.getDate() - currentDate.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return formatDate(currentDate)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-[#873bff]" />
              Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your schedule, meetings, and important events
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900 min-w-64 text-center">
                {getViewTitle()}
              </h2>
              
              <button
                onClick={() => navigateCalendar('next')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-[#873bff] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
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

      {/* Calendar View */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#873bff] mx-auto mb-4" />
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        ) : viewMode === 'month' ? (
          <div>
            {/* Month Header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Month Grid */}
            <div className="grid grid-cols-7">
              {getMonthDays().map((day, index) => {
                const dayEvents = getEventsForDate(day.date)
                const isToday = day.date.toDateString() === new Date().toDateString()
                
                return (
                  <div
                    key={index}
                    className={`min-h-32 p-2 border-r border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    }`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-[#873bff]' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.date.getDate()}
                      {isToday && (
                        <div className="w-2 h-2 bg-[#873bff] rounded-full inline-block ml-1" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => {
                        const typeConfig = EVENT_TYPES[event.type]
                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${typeConfig.color} ${typeConfig.textColor} border-l-2 ${PRIORITY_COLORS[event.priority]}`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        )
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : viewMode === 'agenda' ? (
          <div className="p-6">
            <div className="space-y-4">
              {events
                .filter(event => {
                  const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
                  const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter
                  return matchesSearch && matchesCategory
                })
                .sort((a, b) => a.start.getTime() - b.start.getTime())
                .map(event => {
                  const typeConfig = EVENT_TYPES[event.type]
                  const TypeIcon = typeConfig.icon
                  
                  return (
                    <div key={event.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#873bff] transition-colors">
                      <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                        <TypeIcon className={`w-5 h-5 ${typeConfig.textColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                          
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.attendees.length} attendees
                            </div>
                          )}
                        </div>
                        
                        {event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                                {tag}
                              </span>
                            ))}
                            {event.tags.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                +{event.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {event.videoUrl && (
                          <a
                            href={event.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Join video call"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        )}
                        
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              }
              
              {events.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-500 mb-6">Start by creating your first event</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Create Event
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-center text-gray-500">
              {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view coming soon
            </p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Event</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Event description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="task">Task</option>
                    <option value="reminder">Reminder</option>
                    <option value="deadline">Deadline</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newEvent.priority}
                    onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Event location"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={newEvent.videoUrl}
                    onChange={(e) => setNewEvent({ ...newEvent, videoUrl: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  />
                </div>
              </div>
              
              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendees
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newEvent.attendees.map(email => (
                    <span key={email} className="inline-flex items-center px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                      {email}
                      <button
                        onClick={() => removeAttendee(email)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addAttendee(attendeeInput)
                      }
                    }}
                    placeholder="Add attendee email (press Enter)"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 text-sm"
                  />
                  <button
                    onClick={() => addAttendee(attendeeInput)}
                    type="button"
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newEvent.tags.map(tag => (
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
              
              {/* Reminder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder (minutes before)
                </label>
                <select
                  value={newEvent.reminderMinutes}
                  onChange={(e) => setNewEvent({ ...newEvent, reminderMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                >
                  <option value={0}>No reminder</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={1440}>1 day</option>
                </select>
              </div>
              
              {/* Recurring */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={newEvent.recurring}
                  onChange={(e) => setNewEvent({ ...newEvent, recurring: e.target.checked })}
                  className="w-4 h-4 text-[#873bff] rounded border-gray-300 focus:ring-[#873bff]"
                />
                <label className="text-sm font-medium text-gray-700">
                  Recurring event
                </label>
              </div>
              
              {newEvent.recurring && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <select
                    value={newEvent.recurringType}
                    onChange={(e) => setNewEvent({ ...newEvent, recurringType: e.target.value as any })}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  
                  <input
                    type="number"
                    min="1"
                    value={newEvent.recurringInterval}
                    onChange={(e) => setNewEvent({ ...newEvent, recurringInterval: parseInt(e.target.value) })}
                    placeholder="Interval"
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                  setError(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createEvent}
                disabled={creating || !newEvent.title.trim() || !newEvent.start || !newEvent.end}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendar Settings</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Default View</h3>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  <option value="month">Month</option>
                  <option value="week">Week</option>
                  <option value="day">Day</option>
                  <option value="agenda">Agenda</option>
                </select>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Time Zone</h3>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  <option value="auto">Automatic</option>
                  <option value="utc">UTC</option>
                  <option value="pst">PST</option>
                  <option value="est">EST</option>
                </select>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Week Start</h3>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  <option value="sunday">Sunday</option>
                  <option value="monday">Monday</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import {
  Mail,
  Send,
  Inbox,
  Star,
  Archive,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Reply,
  Forward,
  Paperclip,
  Users,
  Calendar,
  CheckSquare,
  Plus,
  Edit3,
  Save,
  X,
  RefreshCw,
  Download,
  Settings,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Zap,
  Globe,
  Phone,
  Heart,
  Flag,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  MessageSquare,
  User,
  Building,
  TrendingUp
} from 'lucide-react'

// Types
interface Email {
  id: string
  from: {
    name: string
    email: string
    avatar?: string
  }
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  labels: string[]
  receivedAt: Date
  sentAt?: Date
  attachments: {
    name: string
    size: number
    type: string
    url: string
  }[]
  priority: 'low' | 'normal' | 'high'
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam'
  threadId?: string
  isImportant: boolean
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: 'business' | 'personal' | 'marketing' | 'support' | 'follow-up'
  tags: string[]
  created_at: Date
  usage_count: number
}

interface ComposeState {
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
  priority: 'low' | 'normal' | 'high'
  attachments: File[]
  scheduleSend?: Date
  template?: string
}

type ViewMode = 'inbox' | 'sent' | 'drafts' | 'starred' | 'archive' | 'templates' | 'settings'

const EMAIL_LABELS = [
  { id: 'work', name: 'Work', color: 'bg-blue-500' },
  { id: 'personal', name: 'Personal', color: 'bg-green-500' },
  { id: 'important', name: 'Important', color: 'bg-red-500' },
  { id: 'follow-up', name: 'Follow-up', color: 'bg-yellow-500' },
  { id: 'client', name: 'Client', color: 'bg-purple-500' },
  { id: 'project', name: 'Project', color: 'bg-indigo-500' }
]

const PRIORITY_COLORS = {
  low: 'text-gray-400',
  normal: 'text-gray-600',
  high: 'text-red-600'
}

export default function EmailsPage() {
  // State
  const [emails, setEmails] = useState<Email[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('inbox')
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [labelFilter, setLabelFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const [composeData, setComposeData] = useState<ComposeState>({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    priority: 'normal',
    attachments: []
  })

  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    body: '',
    category: 'business',
    tags: []
  })
  const [templateTagInput, setTemplateTagInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showCCBCC, setShowCCBCC] = useState(false)

  // Mock data
  const mockEmails: Email[] = [
    {
      id: '1',
      from: {
        name: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        avatar: 'SJ'
      },
      to: ['you@company.com'],
      subject: 'Q4 Project Review Meeting',
      body: 'Hi there,\n\nI hope this email finds you well. I wanted to schedule our Q4 project review meeting. Could we meet next Tuesday at 2 PM?\n\nPlease let me know if this works for you.\n\nBest regards,\nSarah',
      isRead: false,
      isStarred: true,
      isArchived: false,
      labels: ['work', 'important'],
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      attachments: [],
      priority: 'high',
      folder: 'inbox',
      isImportant: true
    },
    {
      id: '2',
      from: {
        name: 'Marketing Team',
        email: 'marketing@company.com',
        avatar: 'MT'
      },
      to: ['team@company.com'],
      subject: 'New Campaign Performance Report',
      body: 'Hello team,\n\nAttached is the performance report for our latest marketing campaign. Key highlights:\n\n• 25% increase in CTR\n• 150% ROI improvement\n• 5,000+ new leads generated\n\nGreat work everyone!\n\nBest,\nMarketing Team',
      isRead: true,
      isStarred: false,
      isArchived: false,
      labels: ['work', 'project'],
      receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      attachments: [
        {
          name: 'campaign_report.pdf',
          size: 245760,
          type: 'application/pdf',
          url: '#'
        }
      ],
      priority: 'normal',
      folder: 'inbox',
      isImportant: false
    },
    {
      id: '3',
      from: {
        name: 'Client Services',
        email: 'support@clientcompany.com',
        avatar: 'CS'
      },
      to: ['you@company.com'],
      subject: 'Thank you for your partnership',
      body: 'Dear Partner,\n\nWe wanted to take a moment to thank you for your continued partnership and exceptional service delivery.\n\nYour team has consistently exceeded our expectations, and we look forward to continuing our collaboration.\n\nWarm regards,\nClient Services Team',
      isRead: true,
      isStarred: false,
      isArchived: false,
      labels: ['client', 'personal'],
      receivedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      attachments: [],
      priority: 'normal',
      folder: 'inbox',
      isImportant: false
    },
    {
      id: '4',
      from: {
        name: 'You',
        email: 'you@company.com'
      },
      to: ['client@example.com'],
      subject: 'Project Proposal - Next Steps',
      body: 'Hello,\n\nThank you for considering our proposal. I wanted to follow up on our discussion and outline the next steps:\n\n1. Technical requirements review\n2. Timeline confirmation\n3. Contract finalization\n\nI\'m available for a call this week to discuss any questions you might have.\n\nBest regards',
      isRead: true,
      isStarred: false,
      isArchived: false,
      labels: ['follow-up', 'client'],
      receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      attachments: [],
      priority: 'normal',
      folder: 'sent',
      isImportant: false
    }
  ]

  const mockTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Client Follow-up',
      subject: 'Following up on our conversation',
      body: 'Hi {{client_name}},\n\nI wanted to follow up on our conversation from {{date}}. \n\n{{custom_message}}\n\nPlease let me know if you have any questions.\n\nBest regards,\n{{your_name}}',
      category: 'follow-up',
      tags: ['client', 'follow-up', 'professional'],
      created_at: new Date(),
      usage_count: 15
    },
    {
      id: '2',
      name: 'Meeting Request',
      subject: 'Meeting Request - {{topic}}',
      body: 'Hello {{recipient_name}},\n\nI hope this email finds you well. I would like to schedule a meeting to discuss {{topic}}.\n\nWould {{proposed_time}} work for you? The meeting should take approximately {{duration}}.\n\nPlease let me know your availability.\n\nThank you,\n{{your_name}}',
      category: 'business',
      tags: ['meeting', 'scheduling', 'business'],
      created_at: new Date(),
      usage_count: 8
    },
    {
      id: '3',
      name: 'Project Update',
      subject: 'Project Update - {{project_name}}',
      body: 'Hi team,\n\nHere\'s the latest update on {{project_name}}:\n\n**Progress:**\n- {{progress_item_1}}\n- {{progress_item_2}}\n\n**Next Steps:**\n- {{next_step_1}}\n- {{next_step_2}}\n\n**Blockers:**\n{{blockers_or_none}}\n\nLet me know if you have any questions.\n\nBest,\n{{your_name}}',
      category: 'business',
      tags: ['update', 'project', 'team'],
      created_at: new Date(),
      usage_count: 22
    },
    {
      id: '4',
      name: 'Thank You Note',
      subject: 'Thank you for {{occasion}}',
      body: 'Dear {{recipient_name}},\n\nI wanted to take a moment to thank you for {{specific_reason}}.\n\n{{personal_message}}\n\nI truly appreciate {{what_you_appreciate}} and look forward to {{future_interaction}}.\n\nWarm regards,\n{{your_name}}',
      category: 'personal',
      tags: ['thank-you', 'appreciation', 'personal'],
      created_at: new Date(),
      usage_count: 5
    }
  ]

  // Load data
  useEffect(() => {
    loadEmails()
    loadTemplates()
  }, [])

  const loadEmails = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEmails(mockEmails)
    } catch (error) {
      setError('Failed to load emails')
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Failed to load templates')
    }
  }

  // Email actions
  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  const markAsRead = (emailIds: string[], read = true) => {
    setEmails(prev => prev.map(email => 
      emailIds.includes(email.id) 
        ? { ...email, isRead: read }
        : email
    ))
    if (emailIds.length === 1) {
      setSelectedEmails([])
    }
  }

  const toggleStar = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { ...email, isStarred: !email.isStarred }
        : email
    ))
  }

  const archiveEmails = (emailIds: string[]) => {
    setEmails(prev => prev.map(email => 
      emailIds.includes(email.id) 
        ? { ...email, isArchived: true }
        : email
    ))
    setSelectedEmails([])
  }

  const deleteEmails = (emailIds: string[]) => {
    setEmails(prev => prev.filter(email => !emailIds.includes(email.id)))
    setSelectedEmails([])
  }

  const refreshEmails = async () => {
    setRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await loadEmails()
    } finally {
      setRefreshing(false)
    }
  }

  // Compose functions
  const resetCompose = () => {
    setComposeData({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      priority: 'normal',
      attachments: []
    })
    setShowCCBCC(false)
  }

  const sendEmail = async () => {
    if (!composeData.to.trim() || !composeData.subject.trim()) {
      setError('Please fill in recipient and subject')
      return
    }

    setSending(true)
    setError(null)

    try {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Add to sent emails
      const newEmail: Email = {
        id: Date.now().toString(),
        from: {
          name: 'You',
          email: 'you@company.com'
        },
        to: composeData.to.split(',').map(e => e.trim()),
        cc: composeData.cc ? composeData.cc.split(',').map(e => e.trim()) : undefined,
        bcc: composeData.bcc ? composeData.bcc.split(',').map(e => e.trim()) : undefined,
        subject: composeData.subject,
        body: composeData.body,
        isRead: true,
        isStarred: false,
        isArchived: false,
        labels: [],
        receivedAt: new Date(),
        sentAt: new Date(),
        attachments: [],
        priority: composeData.priority,
        folder: 'sent',
        isImportant: false
      }

      setEmails(prev => [newEmail, ...prev])
      setShowCompose(false)
      resetCompose()
    } catch (error) {
      setError('Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const useTemplate = (template: EmailTemplate) => {
    setComposeData(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body
    }))
    setShowTemplateModal(false)
  }

  // Template functions
  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      setError('Please fill in all template fields')
      return
    }

    const template: EmailTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      subject: newTemplate.subject,
      body: newTemplate.body,
      category: newTemplate.category || 'business',
      tags: newTemplate.tags || [],
      created_at: new Date(),
      usage_count: 0
    }

    setTemplates(prev => [template, ...prev])
    setNewTemplate({
      name: '',
      subject: '',
      body: '',
      category: 'business',
      tags: []
    })
    setTemplateTagInput('')
    setShowTemplateModal(false)
  }

  const addTemplateTag = (tag: string) => {
    if (tag.trim() && !newTemplate.tags?.includes(tag.trim())) {
      setNewTemplate(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }))
      setTemplateTagInput('')
    }
  }

  const removeTemplateTag = (tag: string) => {
    setNewTemplate(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }))
  }

  // Filter emails
  const filteredEmails = emails.filter(email => {
    const matchesView = (() => {
      switch (viewMode) {
        case 'inbox': return email.folder === 'inbox' && !email.isArchived
        case 'sent': return email.folder === 'sent'
        case 'drafts': return email.folder === 'drafts'
        case 'starred': return email.isStarred
        case 'archive': return email.isArchived
        default: return true
      }
    })()
    
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.body.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLabel = labelFilter === 'all' || email.labels.includes(labelFilter)
    
    return matchesView && matchesSearch && matchesLabel
  })

  // Get unread count
  const unreadCount = emails.filter(e => !e.isRead && e.folder === 'inbox' && !e.isArchived).length

  // Format file size
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffHours * 60)
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="w-8 h-8 text-[#873bff]" />
              Email Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your communications with clients and team members
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshEmails}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setViewMode('templates')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Templates
            </button>
            
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Compose
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            {/* View Navigation */}
            <nav className="space-y-2">
              {[
                { key: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount },
                { key: 'starred', label: 'Starred', icon: Star },
                { key: 'sent', label: 'Sent', icon: Send },
                { key: 'drafts', label: 'Drafts', icon: Edit3 },
                { key: 'archive', label: 'Archive', icon: Archive },
              ].map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.key}
                    onClick={() => setViewMode(item.key as ViewMode)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                      viewMode === item.key
                        ? 'bg-[#873bff]/10 text-[#873bff] font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    {item.count && item.count > 0 && (
                      <span className="bg-[#873bff] text-white text-xs px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
            
            {/* Labels */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Labels</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setLabelFilter('all')}
                  className={`w-full flex items-center gap-2 px-2 py-1 text-left rounded text-sm transition-colors ${
                    labelFilter === 'all'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Labels
                </button>
                {EMAIL_LABELS.map(label => (
                  <button
                    key={label.id}
                    onClick={() => setLabelFilter(label.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1 text-left rounded text-sm transition-colors ${
                      labelFilter === label.id
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${label.color}`} />
                    {label.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {viewMode !== 'templates' ? (
            <>
              {/* Toolbar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                    />
                  </div>
                  
                  {/* Bulk Actions */}
                  {selectedEmails.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {selectedEmails.length} selected
                      </span>
                      <button
                        onClick={() => markAsRead(selectedEmails, true)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => markAsRead(selectedEmails, false)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Mark as unread"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => archiveEmails(selectedEmails)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEmails(selectedEmails)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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

              {/* Email List */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#873bff] mx-auto mb-4" />
                    <p className="text-gray-600">Loading emails...</p>
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className="p-12 text-center">
                    <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery || labelFilter !== 'all' ? 'No emails found' : 'No emails yet'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery || labelFilter !== 'all' 
                        ? 'Try adjusting your search or filters' 
                        : 'Start by composing your first email'
                      }
                    </p>
                    {!searchQuery && labelFilter === 'all' && (
                      <button
                        onClick={() => setShowCompose(true)}
                        className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Compose Email
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredEmails.map(email => (
                      <div
                        key={email.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !email.isRead ? 'bg-blue-50/30' : ''
                        } ${selectedEmails.includes(email.id) ? 'bg-[#873bff]/5' : ''}`}
                        onClick={() => {
                          setSelectedEmail(email)
                          if (!email.isRead) {
                            markAsRead([email.id])
                          }
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedEmails.includes(email.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              toggleEmailSelection(email.id)
                            }}
                            className="mt-1 w-4 h-4 text-[#873bff] rounded border-gray-300 focus:ring-[#873bff]"
                          />
                          
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {email.from.avatar ? (
                              <div className="w-10 h-10 bg-[#873bff] text-white rounded-full flex items-center justify-center font-medium text-sm">
                                {email.from.avatar}
                              </div>
                            ) : (
                              <User className="w-10 h-10 text-gray-400 p-2 border border-gray-200 rounded-full" />
                            )}
                          </div>
                          
                          {/* Email Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className={`text-sm font-medium truncate ${
                                    !email.isRead ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {email.from.name}
                                  </p>
                                  {email.isImportant && (
                                    <Flag className="w-4 h-4 text-red-500" />
                                  )}
                                  {email.priority === 'high' && (
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                  )}
                                </div>
                                
                                <h3 className={`text-sm mb-1 truncate ${
                                  !email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                                }`}>
                                  {email.subject}
                                </h3>
                                
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {email.body.substring(0, 120)}...
                                </p>
                                
                                {/* Labels */}
                                {email.labels.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {email.labels.slice(0, 3).map(labelId => {
                                      const label = EMAIL_LABELS.find(l => l.id === labelId)
                                      return label ? (
                                        <span
                                          key={labelId}
                                          className={`inline-flex items-center px-2 py-1 text-xs rounded-full text-white ${label.color}`}
                                        >
                                          {label.name}
                                        </span>
                                      ) : null
                                    })}
                                    {email.labels.length > 3 && (
                                      <span className="text-xs text-gray-500 px-2 py-1">
                                        +{email.labels.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                {email.attachments.length > 0 && (
                                  <Paperclip className="w-4 h-4 text-gray-400" />
                                )}
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleStar(email.id)
                                  }}
                                  className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                                    email.isStarred ? 'text-yellow-500' : 'text-gray-400'
                                  }`}
                                >
                                  <Star className={`w-4 h-4 ${email.isStarred ? 'fill-current' : ''}`} />
                                </button>
                                
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatTime(email.receivedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Templates View
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
                    <p className="text-gray-600 mt-1">Reusable email templates for common communications</p>
                  </div>
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    New Template
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {templates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                    <p className="text-gray-500 mb-6">Create your first email template to save time</p>
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Create Template
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(template => (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#873bff] transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{template.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Used {template.usage_count} times
                            </span>
                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm font-medium text-gray-800 mb-2">{template.subject}</p>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {template.body.substring(0, 120)}...
                        </p>
                        
                        {template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{template.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              useTemplate(template)
                              setShowCompose(true)
                            }}
                            className="flex-1 px-3 py-2 text-sm bg-[#873bff] text-white rounded-lg hover:opacity-90 transition-opacity"
                          >
                            Use Template
                          </button>
                          <button className="px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Use template"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowCompose(false)
                    resetCompose()
                    setError(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Recipients */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700">To *</label>
                  {!showCCBCC && (
                    <button
                      onClick={() => setShowCCBCC(true)}
                      className="text-xs text-[#873bff] hover:underline"
                    >
                      CC/BCC
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  multiple
                />
              </div>
              
              {showCCBCC && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CC</label>
                    <input
                      type="email"
                      value={composeData.cc}
                      onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                      placeholder="cc@example.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                      multiple
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">BCC</label>
                    <input
                      type="email"
                      value={composeData.bcc}
                      onChange={(e) => setComposeData({ ...composeData, bcc: e.target.value })}
                      placeholder="bcc@example.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                      multiple
                    />
                  </div>
                </>
              )}
              
              {/* Subject & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Email subject"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={composeData.priority}
                    onChange={(e) => setComposeData({ ...composeData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  placeholder="Write your email..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4" />
                  Attach
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Clock className="w-4 h-4" />
                  Schedule
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowCompose(false)
                    resetCompose()
                    setError(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  disabled={sending || !composeData.to.trim() || !composeData.subject.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {showCompose ? (
              // Template Selection for Compose
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Choose Template</h2>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => useTemplate(template)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-[#873bff] hover:bg-[#873bff]/5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{template.category}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          Used {template.usage_count} times
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-800 mb-1">{template.subject}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.body.substring(0, 100)}...
                      </p>
                      
                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Create New Template
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Create Template</h2>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                      <input
                        type="text"
                        value={newTemplate.name || ''}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., Client Follow-up"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                      >
                        <option value="business">Business</option>
                        <option value="personal">Personal</option>
                        <option value="marketing">Marketing</option>
                        <option value="support">Support</option>
                        <option value="follow-up">Follow-up</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line *</label>
                    <input
                      type="text"
                      value={newTemplate.subject || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                      placeholder="Template subject (use {{variables}} for dynamic content)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Body *</label>
                    <textarea
                      value={newTemplate.body || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                      placeholder="Template content (use {{variables}} for dynamic content)\n\nExample: Hi {{client_name}}, I wanted to follow up on {{topic}}..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(newTemplate.tags || []).map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                          {tag}
                          <button
                            onClick={() => removeTemplateTag(tag)}
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
                        value={templateTagInput}
                        onChange={(e) => setTemplateTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTemplateTag(templateTagInput)
                          }
                        }}
                        placeholder="Add tags (press Enter)"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 text-sm"
                      />
                      <button
                        onClick={() => addTemplateTag(templateTagInput)}
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
                    onClick={() => setShowTemplateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTemplate}
                    disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.body}
                    className="px-6 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Template
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#873bff] text-white rounded-full flex items-center justify-center font-medium text-xs">
                      {selectedEmail.from.avatar || selectedEmail.from.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedEmail.from.name}</p>
                      <p className="text-gray-500">{selectedEmail.from.email}</p>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    {formatTime(selectedEmail.receivedAt)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Reply className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Forward className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleStar(selectedEmail.id)}
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    selectedEmail.isStarred ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                >
                  <Star className={`w-4 h-4 ${selectedEmail.isStarred ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={() => archiveEmails([selectedEmail.id])}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteEmails([selectedEmail.id])}
                  className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Email Body */}
            <div className="prose max-w-none mb-6">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedEmail.body}
              </div>
            </div>
            
            {/* Attachments */}
            {selectedEmail.attachments.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Attachments</h3>
                <div className="space-y-2">
                  {selectedEmail.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-1 text-sm text-[#873bff] hover:bg-[#873bff]/10 rounded transition-colors">
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Labels */}
            {selectedEmail.labels.length > 0 && (
              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex flex-wrap gap-2">
                  {selectedEmail.labels.map(labelId => {
                    const label = EMAIL_LABELS.find(l => l.id === labelId)
                    return label ? (
                      <span
                        key={labelId}
                        className={`inline-flex items-center px-3 py-1 text-sm rounded-full text-white ${label.color}`}
                      >
                        {label.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

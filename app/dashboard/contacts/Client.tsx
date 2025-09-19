'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  User,
  Phone,
  Mail,
  Building,
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  Upload,
  X,
  Check,
  AlertCircle,
  Calendar,
  MapPin,
  Globe,
  Loader2,
  FileDown,
  Users,
  Star,
  StarOff
} from 'lucide-react'

// Types
interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position?: string
  location?: string
  website?: string
  notes?: string
  starred: boolean
  created_at: string
  updated_at: string
  last_contacted?: string
  tags: string[]
}

interface ContactForm {
  name: string
  email: string
  phone: string
  company: string
  position: string
  location: string
  website: string
  notes: string
  tags: string[]
}

export default function ContactsClient() {
  // State
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [newContact, setNewContact] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    location: '',
    website: '',
    notes: '',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bulkSelected, setBulkSelected] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock data for demonstration
  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      position: 'Senior Developer',
      location: 'San Francisco, CA',
      website: 'linkedin.com/in/johnsmith',
      notes: 'Met at tech conference. Interested in collaboration.',
      starred: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      last_contacted: '2024-01-10T14:20:00Z',
      tags: ['developer', 'tech', 'potential-client']
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@designstudio.co',
      phone: '+1 (555) 987-6543',
      company: 'Design Studio',
      position: 'Creative Director',
      location: 'New York, NY',
      website: 'sarahdesigns.com',
      notes: 'Excellent designer, worked on several projects together.',
      starred: false,
      created_at: '2024-01-12T09:15:00Z',
      updated_at: '2024-01-12T09:15:00Z',
      last_contacted: '2024-01-08T16:45:00Z',
      tags: ['designer', 'creative', 'partner']
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'mchen@startupx.io',
      phone: '+1 (555) 456-7890',
      company: 'StartupX',
      position: 'Founder & CEO',
      location: 'Austin, TX',
      website: 'startupx.io',
      notes: 'Potential investment opportunity.',
      starred: true,
      created_at: '2024-01-08T16:20:00Z',
      updated_at: '2024-01-08T16:20:00Z',
      last_contacted: '2024-01-05T11:30:00Z',
      tags: ['startup', 'founder', 'investment']
    },
    {
      id: '4',
      name: 'Emily Rodriguez',
      email: 'emily@marketingpro.com',
      phone: '+1 (555) 234-5678',
      company: 'Marketing Pro',
      position: 'Marketing Manager',
      location: 'Chicago, IL',
      website: 'marketingpro.com',
      notes: 'Great marketing insights and strategies.',
      starred: false,
      created_at: '2024-01-05T14:45:00Z',
      updated_at: '2024-01-05T14:45:00Z',
      tags: ['marketing', 'strategy', 'consultant']
    }
  ]

  // Load contacts
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setContacts(mockContacts)
    } catch (error) {
      setError('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)

    const matchesCompany = companyFilter === 'all' || 
      contact.company.toLowerCase().includes(companyFilter.toLowerCase())

    return matchesSearch && matchesCompany
  })

  // Get unique companies for filter
  const companies = Array.from(new Set(contacts.map(c => c.company))).filter(Boolean)

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

  // Create contact
  const createContact = async () => {
    if (!newContact.name.trim() || !newContact.email.trim()) {
      setError('Name and email are required')
      return
    }

    setCreating(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const contact: Contact = {
        id: Date.now().toString(),
        ...newContact,
        starred: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setContacts([contact, ...contacts])
      setShowCreateModal(false)
      setNewContact({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        location: '',
        website: '',
        notes: '',
        tags: [],
      })
      setTagInput('')
    } catch (error) {
      setError('Failed to create contact')
    } finally {
      setCreating(false)
    }
  }

  // Delete contact
  const deleteContact = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setContacts(contacts.filter(c => c.id !== id))
      setSelectedContact(null)
    } catch (error) {
      setError('Failed to delete contact')
    }
  }

  // Toggle star
  const toggleStarred = async (id: string) => {
    try {
      setContacts(contacts.map(c => 
        c.id === id ? { ...c, starred: !c.starred } : c
      ))
    } catch (error) {
      setError('Failed to update contact')
    }
  }

  // Add tag
  const addTag = (tag: string) => {
    if (tag.trim() && !newContact.tags.includes(tag.trim())) {
      setNewContact({
        ...newContact,
        tags: [...newContact.tags, tag.trim()]
      })
      setTagInput('')
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setNewContact({
      ...newContact,
      tags: newContact.tags.filter(t => t !== tag)
    })
  }

  // Export contacts
  const exportContacts = () => {
    const csv = [
      'Name,Email,Phone,Company,Position,Location,Website,Notes,Tags',
      ...filteredContacts.map(c => 
        `"${c.name}","${c.email}","${c.phone}","${c.company}","${c.position || ''}","${c.location || ''}","${c.website || ''}","${c.notes || ''}","${c.tags.join(';')}"`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Bulk operations
  const handleBulkSelect = (id: string) => {
    setBulkSelected(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (bulkSelected.length === 0) return
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setContacts(contacts.filter(c => !bulkSelected.includes(c.id)))
      setBulkSelected([])
    } catch (error) {
      setError('Failed to delete contacts')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-1">
              Manage your professional contacts and relationships
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            
            <button
              onClick={exportContacts}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Contact
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
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
            >
              <option value="all">All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
            
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-[#873bff] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm border-l ${
                  viewMode === 'list' 
                    ? 'bg-[#873bff] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {bulkSelected.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-[#873bff]/10 rounded-lg">
            <span className="text-sm text-[#873bff] font-medium">
              {bulkSelected.length} contact{bulkSelected.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setBulkSelected([])}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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

      {/* Contacts */}
      {loading ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || companyFilter !== 'all' ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || companyFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start building your professional network by adding contacts'
            }
          </p>
          {!searchQuery && companyFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Add Your First Contact
            </button>
          )}
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {filteredContacts.map(contact => (
            <div key={contact.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Contact Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#873bff] to-[#7a35e6] rounded-full flex items-center justify-center text-white font-medium">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(contact.id)}
                      onChange={() => handleBulkSelect(contact.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 text-[#873bff] rounded border-gray-300 focus:ring-[#873bff]"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                    {contact.position && (
                      <p className="text-sm text-gray-600 truncate">{contact.position}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStarred(contact.id)}
                    className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {contact.starred ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setSelectedContact(selectedContact === contact.id ? null : contact.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {selectedContact === contact.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => {
                            setEditingContact(contact)
                            setSelectedContact(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Contact
                        </button>
                        <button
                          onClick={() => {
                            deleteContact(contact.id)
                            setSelectedContact(null)
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
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${contact.email}`} className="hover:text-[#873bff] transition-colors truncate">
                      {contact.email}
                    </a>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${contact.phone}`} className="hover:text-[#873bff] transition-colors">
                      {contact.phone}
                    </a>
                  </div>
                )}
                
                {contact.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                )}
                
                {contact.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{contact.location}</span>
                  </div>
                )}

                {contact.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[#873bff] transition-colors truncate"
                    >
                      {contact.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Tags */}
              {contact.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {contact.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                      {tag}
                    </span>
                  ))}
                  {contact.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{contact.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Added {formatRelativeTime(contact.created_at)}</span>
                {contact.last_contacted && (
                  <span>Last contact {formatRelativeTime(contact.last_contacted)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Contact Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Contact</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="Enter company name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={newContact.position}
                    onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                    placeholder="Enter job title"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newContact.location}
                    onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                    placeholder="Enter location"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={newContact.website}
                  onChange={(e) => setNewContact({ ...newContact, website: e.target.value })}
                  placeholder="Enter website or LinkedIn URL"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="Add any notes about this contact"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                />
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newContact.tags.map(tag => (
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
                  setNewContact({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    position: '',
                    location: '',
                    website: '',
                    notes: '',
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
                onClick={createContact}
                disabled={creating || !newContact.name.trim() || !newContact.email.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Add Contact
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Contacts</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drop your CSV file here, or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    // Handle file upload
                    console.log('File selected:', e.target.files?.[0])
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#873bff] text-white rounded-lg hover:bg-[#7a35e6] transition-colors"
                >
                  Choose File
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-1">CSV format requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Columns: Name, Email, Phone, Company, Position, Location, Website, Notes, Tags</li>
                  <li>First row should contain column headers</li>
                  <li>Tags should be separated by semicolons</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Import Contacts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


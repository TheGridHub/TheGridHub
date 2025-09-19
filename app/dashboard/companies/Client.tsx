'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  Building2,
  Globe,
  Users,
  MapPin,
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  Upload,
  X,
  Check,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Loader2,
  FileDown,
  Star,
  StarOff,
  ExternalLink,
  Tag,
  Briefcase
} from 'lucide-react'

// Types
interface Company {
  id: string
  name: string
  domain?: string
  website?: string
  industry: string
  size: string
  location?: string
  description?: string
  founded?: string
  employees?: string
  revenue?: string
  starred: boolean
  created_at: string
  updated_at: string
  tags: string[]
  contactCount: number
  lastActivity?: string
}

interface CompanyForm {
  name: string
  domain: string
  website: string
  industry: string
  size: string
  location: string
  description: string
  founded: string
  employees: string
  revenue: string
  tags: string[]
}

// Industries and company sizes for dropdowns
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Real Estate', 'Construction', 'Consulting', 'Marketing',
  'Media', 'Transportation', 'Energy', 'Government', 'Non-profit', 'Other'
]

const COMPANY_SIZES = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'
]

export default function CompaniesClient() {
  // State
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [newCompany, setNewCompany] = useState<CompanyForm>({
    name: '',
    domain: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    description: '',
    founded: '',
    employees: '',
    revenue: '',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bulkSelected, setBulkSelected] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock data for demonstration
  const mockCompanies: Company[] = [
    {
      id: '1',
      name: 'TechCorp Inc.',
      domain: 'techcorp.com',
      website: 'https://techcorp.com',
      industry: 'Technology',
      size: '201-500',
      location: 'San Francisco, CA',
      description: 'Leading technology solutions provider specializing in cloud computing and AI.',
      founded: '2015',
      employees: '350',
      revenue: '$50M',
      starred: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      tags: ['saas', 'ai', 'cloud'],
      contactCount: 12,
      lastActivity: '2024-01-10T14:20:00Z'
    },
    {
      id: '2',
      name: 'Design Studio',
      domain: 'designstudio.co',
      website: 'https://designstudio.co',
      industry: 'Marketing',
      size: '11-50',
      location: 'New York, NY',
      description: 'Creative design agency focused on brand identity and digital experiences.',
      founded: '2018',
      employees: '25',
      starred: false,
      created_at: '2024-01-12T09:15:00Z',
      updated_at: '2024-01-12T09:15:00Z',
      tags: ['design', 'branding', 'creative'],
      contactCount: 8,
      lastActivity: '2024-01-08T16:45:00Z'
    },
    {
      id: '3',
      name: 'StartupX',
      domain: 'startupx.io',
      website: 'https://startupx.io',
      industry: 'Technology',
      size: '1-10',
      location: 'Austin, TX',
      description: 'Early-stage fintech startup revolutionizing payment processing.',
      founded: '2023',
      employees: '8',
      starred: true,
      created_at: '2024-01-08T16:20:00Z',
      updated_at: '2024-01-08T16:20:00Z',
      tags: ['startup', 'fintech', 'payments'],
      contactCount: 3,
      lastActivity: '2024-01-05T11:30:00Z'
    },
    {
      id: '4',
      name: 'Marketing Pro',
      domain: 'marketingpro.com',
      website: 'https://marketingpro.com',
      industry: 'Marketing',
      size: '51-200',
      location: 'Chicago, IL',
      description: 'Full-service marketing agency with expertise in digital marketing and strategy.',
      founded: '2012',
      employees: '120',
      revenue: '$15M',
      starred: false,
      created_at: '2024-01-05T14:45:00Z',
      updated_at: '2024-01-05T14:45:00Z',
      tags: ['marketing', 'digital', 'strategy'],
      contactCount: 15,
      lastActivity: '2024-01-03T09:15:00Z'
    }
  ]

  // Load companies
  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCompanies(mockCompanies)
    } catch (error) {
      setError('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter
    const matchesSize = sizeFilter === 'all' || company.size === sizeFilter

    return matchesSearch && matchesIndustry && matchesSize
  })

  // Get unique industries and sizes for filters
  const industries = Array.from(new Set(companies.map(c => c.industry))).filter(Boolean)
  const sizes = Array.from(new Set(companies.map(c => c.size))).filter(Boolean)

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

  // Create company
  const createCompany = async () => {
    if (!newCompany.name.trim()) {
      setError('Company name is required')
      return
    }

    setCreating(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const company: Company = {
        id: Date.now().toString(),
        ...newCompany,
        starred: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contactCount: 0,
      }

      setCompanies([company, ...companies])
      setShowCreateModal(false)
      setNewCompany({
        name: '',
        domain: '',
        website: '',
        industry: '',
        size: '',
        location: '',
        description: '',
        founded: '',
        employees: '',
        revenue: '',
        tags: [],
      })
      setTagInput('')
    } catch (error) {
      setError('Failed to create company')
    } finally {
      setCreating(false)
    }
  }

  // Delete company
  const deleteCompany = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setCompanies(companies.filter(c => c.id !== id))
      setSelectedCompany(null)
    } catch (error) {
      setError('Failed to delete company')
    }
  }

  // Toggle star
  const toggleStarred = async (id: string) => {
    try {
      setCompanies(companies.map(c => 
        c.id === id ? { ...c, starred: !c.starred } : c
      ))
    } catch (error) {
      setError('Failed to update company')
    }
  }

  // Add tag
  const addTag = (tag: string) => {
    if (tag.trim() && !newCompany.tags.includes(tag.trim())) {
      setNewCompany({
        ...newCompany,
        tags: [...newCompany.tags, tag.trim()]
      })
      setTagInput('')
    }
  }

  // Remove tag
  const removeTag = (tag: string) => {
    setNewCompany({
      ...newCompany,
      tags: newCompany.tags.filter(t => t !== tag)
    })
  }

  // Export companies
  const exportCompanies = () => {
    const csv = [
      'Name,Domain,Website,Industry,Size,Location,Description,Founded,Employees,Revenue,Tags,Contacts',
      ...filteredCompanies.map(c => 
        `"${c.name}","${c.domain || ''}","${c.website || ''}","${c.industry}","${c.size}","${c.location || ''}","${c.description || ''}","${c.founded || ''}","${c.employees || ''}","${c.revenue || ''}","${c.tags.join(';')}","${c.contactCount}"`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `companies-${new Date().toISOString().split('T')[0]}.csv`
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
      setCompanies(companies.filter(c => !bulkSelected.includes(c.id)))
      setBulkSelected([])
    } catch (error) {
      setError('Failed to delete companies')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600 mt-1">
              Manage your company database and business relationships
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
              onClick={exportCompanies}
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
              New Company
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
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
            >
              <option value="all">All Sizes</option>
              {sizes.map(size => (
                <option key={size} value={size}>{size} employees</option>
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
              {bulkSelected.length} compan{bulkSelected.length > 1 ? 'ies' : 'y'} selected
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

      {/* Companies */}
      {loading ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
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
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || industryFilter !== 'all' || sizeFilter !== 'all' ? 'No companies found' : 'No companies yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || industryFilter !== 'all' || sizeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start building your company database by adding companies'
            }
          </p>
          {!searchQuery && industryFilter === 'all' && sizeFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Add Your First Company
            </button>
          )}
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {filteredCompanies.map(company => (
            <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Company Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#873bff] to-[#7a35e6] rounded-lg flex items-center justify-center text-white font-medium">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(company.id)}
                      onChange={() => handleBulkSelect(company.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 text-[#873bff] rounded border-gray-300 focus:ring-[#873bff]"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.industry}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStarred(company.id)}
                    className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {company.starred ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setSelectedCompany(selectedCompany === company.id ? null : company.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {selectedCompany === company.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => {
                            setEditingCompany(company)
                            setSelectedCompany(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Company
                        </button>
                        <button
                          onClick={() => {
                            deleteCompany(company.id)
                            setSelectedCompany(null)
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

              {/* Company Info */}
              <div className="space-y-2">
                {company.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={company.website}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[#873bff] transition-colors truncate flex items-center gap-1"
                    >
                      {company.domain || company.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{company.size} employees</span>
                </div>
                
                {company.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{company.location}</span>
                  </div>
                )}
                
                {company.founded && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Founded {company.founded}</span>
                  </div>
                )}
                
                {company.revenue && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{company.revenue} revenue</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {company.description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {company.description}
                </p>
              )}

              {/* Tags */}
              {company.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {company.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-[#873bff]/10 text-[#873bff] rounded-full">
                      {tag}
                    </span>
                  ))}
                  {company.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{company.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span>{company.contactCount} contacts</span>
                  <span>Added {formatRelativeTime(company.created_at)}</span>
                </div>
                {company.lastActivity && (
                  <span>Last activity {formatRelativeTime(company.lastActivity)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Company</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    placeholder="Enter company name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={newCompany.domain}
                    onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                    placeholder="example.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <select
                    value={newCompany.size}
                    onChange={(e) => setNewCompany({ ...newCompany, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20"
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map(size => (
                      <option key={size} value={size}>{size} employees</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founded
                  </label>
                  <input
                    type="text"
                    value={newCompany.founded}
                    onChange={(e) => setNewCompany({ ...newCompany, founded: e.target.value })}
                    placeholder="2020"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revenue
                  </label>
                  <input
                    type="text"
                    value={newCompany.revenue}
                    onChange={(e) => setNewCompany({ ...newCompany, revenue: e.target.value })}
                    placeholder="$10M"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newCompany.location}
                  onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                  placeholder="City, State/Country"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873bff]/20 focus:border-[#873bff]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  placeholder="Brief description of the company"
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
                  {newCompany.tags.map(tag => (
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
                  setNewCompany({
                    name: '',
                    domain: '',
                    website: '',
                    industry: '',
                    size: '',
                    location: '',
                    description: '',
                    founded: '',
                    employees: '',
                    revenue: '',
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
                onClick={createCompany}
                disabled={creating || !newCompany.name.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#873bff] to-[#7a35e6] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    Add Company
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Companies</h2>
            
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
                  <li>Columns: Name, Domain, Website, Industry, Size, Location, Description, Founded, Revenue, Tags</li>
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
                Import Companies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


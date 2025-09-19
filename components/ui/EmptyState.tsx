import { 
  Plus, 
  FileText, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Building2,
  ContactIcon,
  StickyNote,
  Bell,
  Calendar,
  Mail,
  Settings,
  Search,
  Inbox
} from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {icon && (
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          {icon}
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#873bff] text-white rounded-lg hover:bg-[#7a35e6] transition-colors font-medium"
          >
            {action.icon}
            {action.label}
          </button>
        )}
        
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}

// Predefined empty states for common scenarios
export function EmptyProjects({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="w-8 h-8 text-gray-400" />}
      title="No projects yet"
      description="Create your first project to start organizing your work and collaborating with your team."
      action={{
        label: 'Create Project',
        onClick: onCreateProject,
        icon: <Plus className="w-4 h-4" />
      }}
      secondaryAction={{
        label: 'Learn More',
        onClick: () => window.open('/docs/projects', '_blank'),
        icon: <FileText className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyTasks({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <EmptyState
      icon={<CheckSquare className="w-8 h-8 text-gray-400" />}
      title="No tasks found"
      description="Start by creating your first task or check if you have applied any filters that might be hiding your tasks."
      action={{
        label: 'Add Task',
        onClick: onCreateTask,
        icon: <Plus className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyTeam({ onInviteMembers }: { onInviteMembers: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8 text-gray-400" />}
      title="Just you for now"
      description="Invite team members to collaborate on projects, share tasks, and work together more effectively."
      action={{
        label: 'Invite Members',
        onClick: onInviteMembers,
        icon: <Plus className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyContacts({ onAddContact }: { onAddContact: () => void }) {
  return (
    <EmptyState
      icon={<ContactIcon className="w-8 h-8 text-gray-400" />}
      title="No contacts yet"
      description="Add contacts to keep track of clients, partners, and other important people in your network."
      action={{
        label: 'Add Contact',
        onClick: onAddContact,
        icon: <Plus className="w-4 h-4" />
      }}
      secondaryAction={{
        label: 'Import Contacts',
        onClick: () => {}, // TODO: Implement import functionality
        icon: <FileText className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyCompanies({ onAddCompany }: { onAddCompany: () => void }) {
  return (
    <EmptyState
      icon={<Building2 className="w-8 h-8 text-gray-400" />}
      title="No companies yet"
      description="Track companies you work with, potential clients, or business partners in one organized place."
      action={{
        label: 'Add Company',
        onClick: onAddCompany,
        icon: <Plus className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyNotes({ onCreateNote }: { onCreateNote: () => void }) {
  return (
    <EmptyState
      icon={<StickyNote className="w-8 h-8 text-gray-400" />}
      title="No notes found"
      description="Create your first note to capture ideas, meeting notes, or important information."
      action={{
        label: 'Create Note',
        onClick: onCreateNote,
        icon: <Plus className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="w-8 h-8 text-gray-400" />}
      title="All caught up!"
      description="You have no new notifications. We'll notify you when something important happens."
    />
  )
}

export function EmptyCalendar({ onCreateEvent }: { onCreateEvent: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="w-8 h-8 text-gray-400" />}
      title="No events scheduled"
      description="Your calendar is empty. Start by creating an event or scheduling a meeting."
      action={{
        label: 'Create Event',
        onClick: onCreateEvent,
        icon: <Plus className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyEmails() {
  return (
    <EmptyState
      icon={<Mail className="w-8 h-8 text-gray-400" />}
      title="Inbox zero achieved!"
      description="Your inbox is empty. All messages have been read or archived."
    />
  )
}

export function EmptySearch({ searchTerm, onClearSearch }: { 
  searchTerm: string
  onClearSearch: () => void 
}) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-gray-400" />}
      title={`No results for "${searchTerm}"`}
      description="Try adjusting your search terms or check for typos. You can also browse all items by clearing the search."
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
        icon: <Search className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyFiltered({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="w-8 h-8 text-gray-400" />}
      title="No items match your filters"
      description="Try adjusting your filters to see more results, or clear all filters to view everything."
      action={{
        label: 'Clear Filters',
        onClick: onClearFilters,
        icon: <Settings className="w-4 h-4" />
      }}
    />
  )
}

export function EmptyAnalytics() {
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8 text-gray-400" />}
      title="Not enough data yet"
      description="Start using the platform to generate analytics data. Charts and insights will appear as you create projects and tasks."
    />
  )
}

// Generic error state for when something goes wrong
export function ErrorState({ 
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  onRetry
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8 text-red-400" />}
      title={title}
      description={description}
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
        icon: <Plus className="w-4 h-4" />
      } : undefined}
    />
  )
}

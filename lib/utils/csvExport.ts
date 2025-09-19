'use client'

import Papa from 'papaparse'
import { formatDate, formatCurrency } from './format'

// Generic CSV export utility
export function exportToCSV<T>(
  data: T[],
  filename: string,
  transformFn?: (item: T) => Record<string, any>
) {
  if (!data.length) {
    throw new Error('No data to export')
  }

  // Transform data if transformer provided, otherwise use as-is
  const transformedData = transformFn 
    ? data.map(transformFn)
    : data

  // Convert to CSV string
  const csv = Papa.unparse(transformedData, {
    header: true,
    skipEmptyLines: true
  })

  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Project export transformer
export function exportProjects(projects: any[], filename = 'projects.csv') {
  const transformProject = (project: any) => ({
    'Project Name': project.name,
    'Description': project.description || '',
    'Status': project.status,
    'Priority': project.priority,
    'Progress': `${project.progress}%`,
    'Budget': project.budget ? formatCurrency(project.budget) : '',
    'Start Date': project.start_date ? formatDate(project.start_date) : '',
    'Due Date': project.due_date ? formatDate(project.due_date) : '',
    'Created Date': formatDate(project.created_at),
    'Team Members': project.team_members?.length || 0,
    'Tasks Count': project.tasks_count || 0
  })

  exportToCSV(projects, filename, transformProject)
}

// Task export transformer
export function exportTasks(tasks: any[], filename = 'tasks.csv') {
  const transformTask = (task: any) => ({
    'Task Title': task.title,
    'Description': task.description || '',
    'Status': task.status,
    'Priority': task.priority,
    'Project': task.project?.name || '',
    'Assignee': task.assignee?.name || '',
    'Due Date': task.due_date ? formatDate(task.due_date) : '',
    'Completed Date': task.completed_at ? formatDate(task.completed_at) : '',
    'Created Date': formatDate(task.created_at),
    'Tags': Array.isArray(task.tags) ? task.tags.join(', ') : '',
    'Time Estimated': task.time_estimate || '',
    'Time Spent': task.time_spent || ''
  })

  exportToCSV(tasks, filename, transformTask)
}

// Contact export transformer
export function exportContacts(contacts: any[], filename = 'contacts.csv') {
  const transformContact = (contact: any) => ({
    'Full Name': contact.name,
    'Email': contact.email || '',
    'Phone': contact.phone || '',
    'Company': contact.company?.name || contact.company || '',
    'Job Title': contact.job_title || '',
    'Department': contact.department || '',
    'Location': contact.location || '',
    'Tags': Array.isArray(contact.tags) ? contact.tags.join(', ') : '',
    'Last Contacted': contact.last_contacted ? formatDate(contact.last_contacted) : '',
    'Created Date': formatDate(contact.created_at),
    'Notes': contact.notes || ''
  })

  exportToCSV(contacts, filename, transformContact)
}

// Company export transformer  
export function exportCompanies(companies: any[], filename = 'companies.csv') {
  const transformCompany = (company: any) => ({
    'Company Name': company.name,
    'Industry': company.industry || '',
    'Size': company.size || '',
    'Website': company.website || '',
    'Email': company.email || '',
    'Phone': company.phone || '',
    'Address': typeof company.address === 'object' 
      ? Object.values(company.address).filter(Boolean).join(', ')
      : company.address || '',
    'Description': company.description || '',
    'Tags': Array.isArray(company.tags) ? company.tags.join(', ') : '',
    'Created Date': formatDate(company.created_at),
    'Contact Count': company.contacts?.length || 0
  })

  exportToCSV(companies, filename, transformCompany)
}

// Notes export transformer
export function exportNotes(notes: any[], filename = 'notes.csv') {
  const transformNote = (note: any) => ({
    'Title': note.title,
    'Category': note.category || '',
    'Content': note.content || '',
    'Project': note.project?.name || '',
    'Task': note.task?.title || '',
    'Tags': Array.isArray(note.tags) ? note.tags.join(', ') : '',
    'Is Favorite': note.is_favorite ? 'Yes' : 'No',
    'Is Pinned': note.is_pinned ? 'Yes' : 'No',
    'Created Date': formatDate(note.created_at),
    'Updated Date': formatDate(note.updated_at)
  })

  exportToCSV(notes, filename, transformNote)
}

// Team members export transformer
export function exportTeamMembers(members: any[], filename = 'team-members.csv') {
  const transformMember = (member: any) => ({
    'Name': member.profile?.full_name || `${member.profile?.first_name} ${member.profile?.last_name}`.trim(),
    'Email': member.profile?.email || '',
    'Role': member.role,
    'Status': member.status || 'active',
    'Joined Date': formatDate(member.joined_at || member.created_at),
    'Last Active': member.profile?.last_active ? formatDate(member.profile.last_active) : '',
    'Projects': member.projects_count || 0,
    'Tasks': member.tasks_count || 0
  })

  exportToCSV(members, filename, transformMember)
}

// AI Chat history export transformer
export function exportAiChats(chats: any[], filename = 'ai-chat-history.csv') {
  const transformChat = (chat: any) => ({
    'Thread ID': chat.thread_id || '',
    'Role': chat.role,
    'Message': chat.content,
    'Model': chat.model_used || '',
    'Tokens Used': chat.tokens_used || 0,
    'Date': formatDate(chat.created_at),
    'Time': new Date(chat.created_at).toLocaleTimeString()
  })

  exportToCSV(chats, filename, transformChat)
}

// Usage tracking export transformer
export function exportUsageTracking(usage: any[], filename = 'usage-tracking.csv') {
  const transformUsage = (record: any) => ({
    'Date': formatDate(record.created_at),
    'Resource Type': record.resource_type,
    'Action': record.action,
    'Quantity': record.quantity,
    'User': record.user_name || record.user_id,
    'Workspace': record.workspace_name || record.workspace_id || 'Personal'
  })

  exportToCSV(usage, filename, transformUsage)
}

// Multiple data types export (dashboard summary)
export function exportDashboardSummary(data: {
  projects: any[]
  tasks: any[]
  contacts: any[]
  usage?: any
}, filename = 'dashboard-summary.csv') {
  const summary = [
    {
      'Data Type': 'Projects',
      'Total Count': data.projects.length,
      'Active': data.projects.filter(p => p.status === 'active').length,
      'Completed': data.projects.filter(p => p.status === 'completed').length,
      'Export Date': formatDate(new Date())
    },
    {
      'Data Type': 'Tasks', 
      'Total Count': data.tasks.length,
      'Active': data.tasks.filter(t => !['completed', 'cancelled'].includes(t.status)).length,
      'Completed': data.tasks.filter(t => t.status === 'completed').length,
      'Export Date': formatDate(new Date())
    },
    {
      'Data Type': 'Contacts',
      'Total Count': data.contacts.length,
      'Active': data.contacts.length, // Assuming all contacts are active
      'Completed': 0,
      'Export Date': formatDate(new Date())
    }
  ]

  if (data.usage) {
    summary.push({
      'Data Type': 'Usage Summary',
      'Total Count': data.usage.projects_count + data.usage.tasks_count + data.usage.contacts_count,
      'Active': data.usage.ai_requests_count,
      'Completed': Math.round((data.usage.storage_used / (1024 * 1024 * 1024)) * 100) / 100, // GB
      'Export Date': formatDate(new Date())
    })
  }

  exportToCSV(summary, filename)
}

// Utility to generate filename with timestamp
export function generateTimestampedFilename(baseName: string, extension = 'csv'): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .split('T')[0] + '_' + 
    new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
  
  return `${baseName}_${timestamp}.${extension}`
}

// Utility to validate data before export
export function validateExportData(data: any[]): { isValid: boolean; error?: string } {
  if (!Array.isArray(data)) {
    return { isValid: false, error: 'Data must be an array' }
  }
  
  if (data.length === 0) {
    return { isValid: false, error: 'No data to export' }
  }
  
  return { isValid: true }
}

// Bulk export function for multiple data types
export async function bulkExport(dataTypes: {
  projects?: any[]
  tasks?: any[]
  contacts?: any[]
  companies?: any[]
  notes?: any[]
  teamMembers?: any[]
}) {
  const timestamp = new Date().toISOString().split('T')[0]
  const exports: Promise<void>[] = []

  if (dataTypes.projects?.length) {
    exports.push(Promise.resolve(exportProjects(dataTypes.projects, `projects_${timestamp}.csv`)))
  }
  
  if (dataTypes.tasks?.length) {
    exports.push(Promise.resolve(exportTasks(dataTypes.tasks, `tasks_${timestamp}.csv`)))
  }
  
  if (dataTypes.contacts?.length) {
    exports.push(Promise.resolve(exportContacts(dataTypes.contacts, `contacts_${timestamp}.csv`)))
  }
  
  if (dataTypes.companies?.length) {
    exports.push(Promise.resolve(exportCompanies(dataTypes.companies, `companies_${timestamp}.csv`)))
  }
  
  if (dataTypes.notes?.length) {
    exports.push(Promise.resolve(exportNotes(dataTypes.notes, `notes_${timestamp}.csv`)))
  }
  
  if (dataTypes.teamMembers?.length) {
    exports.push(Promise.resolve(exportTeamMembers(dataTypes.teamMembers, `team-members_${timestamp}.csv`)))
  }

  try {
    await Promise.all(exports)
    return { success: true, count: exports.length }
  } catch (error) {
    throw new Error(`Bulk export failed: ${error}`)
  }
}

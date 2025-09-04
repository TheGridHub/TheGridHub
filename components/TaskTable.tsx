'use client'

import { useState } from 'react'
import { Filter, MoreHorizontal, ExternalLink, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Task {
  id: string
  name: string
  dueDate: string
  progress: number
  priority: string
  projectId?: string
  jiraIssueKey?: string
  jiraIssueUrl?: string
}

interface TaskTableProps {
  tasks: Task[]
  selectedTab: string
  onTabChange: (tab: string) => void
}

export default function TaskTable({ tasks, selectedTab, onTabChange }: TaskTableProps) {
  const [creatingJiraIssue, setCreatingJiraIssue] = useState<string | null>(null)
  const { toast } = useToast()
  
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'completed', label: 'Completed' },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const handleCreateJiraIssue = async (task: Task) => {
    if (!task.projectId) {
      toast({
        title: "Error",
        description: "No project associated with this task",
        variant: "destructive",
      })
      return
    }

    setCreatingJiraIssue(task.id)
    try {
      const response = await fetch('/api/integrations/jira/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          projectId: task.projectId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create Jira issue')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: `Created Jira issue: ${result.jiraIssue.key}`,
      })
      
      // Optionally refresh the task list here
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create Jira issue",
        variant: "destructive",
      })
    } finally {
      setCreatingJiraIssue(null)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">My tasks</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {task.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{task.dueDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(task.progress)}`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{task.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    ● {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {task.jiraIssueKey ? (
                      <a
                        href={task.jiraIssueUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {task.jiraIssueKey}
                      </a>
                    ) : (
                      <button
                        onClick={() => handleCreateJiraIssue(task)}
                        disabled={creatingJiraIssue === task.id}
                        className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingJiraIssue === task.id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Create Jira Issue
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

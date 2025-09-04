'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react'
import CreateTaskModal from '@/components/CreateTaskModal'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function TasksPage() {
  const { data: tasks, mutate, isLoading } = useSWR('/api/tasks', fetcher)
  const [open, setOpen] = useState(false)

  const createTask = async (formData: any) => {
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
    mutate()
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="bg-white shadow-sm border-b mb-6">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
              <div className="flex items-center gap-3">
                <button onClick={() => mutate()} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button onClick={() => setOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Task
                </button>
              </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="text-center text-gray-600">Loading tasks...</div>
        ) : (
          <div className="grid gap-3">
            {(!tasks || tasks.length === 0) && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-600">No tasks yet. Create your first task.</p>
              </div>
            )}
            {tasks?.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div>
                  <div className="font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-600">{task.description || 'No description'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 border border-purple-200">{task.priority}</span>
                  <button className="p-2 hover:bg-purple-50 rounded-lg border border-gray-200 text-purple-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-red-50 rounded-lg border border-gray-200 text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal isOpen={open} onClose={() => setOpen(false)} onSubmit={createTask} />
    </div>
  )
}


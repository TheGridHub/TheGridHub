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
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-purple-900/30 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6 backdrop-blur bg-white/5 px-4 py-3 rounded-xl border border-white/10">
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => mutate()} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => setOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-purple-200">Loading tasks...</div>
        ) : (
          <div className="grid gap-3">
            {(!tasks || tasks.length === 0) && (
              <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
                <p className="text-purple-200">No tasks yet. Create your first task.</p>
              </div>
            )}
            {tasks?.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between bg-white/5 rounded-xl border border-white/10 p-4">
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-purple-200">{task.description || 'No description'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10">{task.priority}</span>
                  <button className="p-2 hover:bg-white/10 rounded-lg border border-white/10"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-white/10 rounded-lg border border-white/10 text-red-300"><Trash2 className="w-4 h-4" /></button>
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


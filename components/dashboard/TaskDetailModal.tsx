"use client"

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TaskDetailModal({
  open,
  onClose,
  task,
  onUpdated,
}: {
  open: boolean
  onClose: () => void
  task: any | null
  onUpdated: (next: any) => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [saving, setSaving] = useState(false)
  if (!task) return null

  const markCompleted = async () => {
    if (!task?.id) return
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'COMPLETED', progress: 100 })
        .eq('id', task.id)
        .select('*')
        .single()
      if (!error && data) {
        const next = {
          ...task,
          status: 'completed',
          progress: 100,
          updatedAt: data.updatedAt,
        }
        onUpdated(next)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute bottom-0 left-0 right-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl transition-transform ${open ? '' : 'translate-y-full'}`}>
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold">Task details</h3>
        </div>
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="text-sm text-gray-600">Title</div>
            <div className="text-sm font-medium">{task.title}</div>
          </div>
          {task.description && (
            <div>
              <div className="text-sm text-gray-600">Description</div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{task.description}</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600">Status</div>
              <div className="font-medium capitalize">{task.status}</div>
            </div>
            <div>
              <div className="text-gray-600">Priority</div>
              <div className="font-medium capitalize">{task.priority}</div>
            </div>
            <div>
              <div className="text-gray-600">Progress</div>
              <div className="font-medium">{task.progress}%</div>
            </div>
            <div>
              <div className="text-gray-600">Due date</div>
              <div className="font-medium">{task.dueDate || '—'}</div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-between gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">Close</button>
          <button onClick={markCompleted} disabled={saving || task.status === 'completed'} className={`px-4 py-2 rounded-md text-white ${(saving || task.status==='completed') ? 'bg-gray-300' : 'bg-purple-600 hover:bg-purple-700'}`}>{saving ? 'Saving...' : 'Mark completed'}</button>
        </div>
      </div>
    </div>
  )
}


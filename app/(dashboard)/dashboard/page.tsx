'use client'

import { useUser } from '@/hooks/useUser'
import { useState, useEffect, useMemo } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import { SectionTabs, AIAssistant, IntegrationsPanel, SubscriptionGate } from '@/components/dashboard'
import CreateTaskDrawer from '@/components/dashboard/CreateTaskDrawer'
import TaskDetailModal from '@/components/dashboard/TaskDetailModal'
import { BasicBarChart, BasicLineChart } from '@/components/dashboard/charts'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { t } = useI18n()
  const supabase = useMemo(() => createClient(), [])

  const [active, setActive] = useState<'overview' | 'tasks' | 'projects' | 'goals' | 'analytics' | 'integrations'>('overview')
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE' | null>(null)

  const [internalUserId, setInternalUserId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [globalQuery, setGlobalQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return
      try {
        setLoading(true)
        // Resolve internal user id
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('supabaseId', user.id)
          .maybeSingle()
        const uid = userRow?.id as string | undefined
        if (!uid) { setInternalUserId(null); setTasks([]); setProjects([]); setGoals([]); setNotifications([]); setPlan('FREE'); return }
        setInternalUserId(uid)

        // Load plan
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('plan')
          .eq('userId', uid)
          .maybeSingle()
        setPlan((sub?.plan as any) || 'FREE')

        // Parallel load core data
        const [ tasksRes, goalsRes, projectsRes, notifsRes, intsRes ] = await Promise.all([
          supabase.from('tasks').select('*').eq('userId', uid).order('createdAt', { ascending: false }),
          supabase.from('goals').select('*').eq('userId', uid).order('createdAt', { ascending: false }),
          supabase.from('projects').select('id, name, color').eq('userId', uid).order('createdAt', { ascending: false }),
          supabase.from('notifications').select('*').eq('userId', uid).order('createdAt', { ascending: false }),
          supabase.from('integrations').select('id, type, status, connectedAt, lastSync, userEmail').eq('userId', uid)
        ])

        const tasksData = (tasksRes.data || []).map((task: any) => ({
          id: task.id,
          title: task.title,
          project: '',
          projectId: task.projectId || '',
          priority: (task.priority || 'MEDIUM').toLowerCase(),
          status: (task.status || 'UPCOMING').toLowerCase().replace('_', '-'),
          progress: task.progress || 0,
          dueDate: task.dueDate ? format(new Date(task.dueDate), 'EEE, dd MMM yyyy') : '',
          dueDateRaw: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completedAt: task.completedAt,
          description: task.description || '',
        }))
        setTasks(tasksData)

        setGoals((goalsRes.data || []).map((goal: any) => ({
          id: goal.id,
          title: goal.title,
          progress: Math.round(((goal.current || 0) / (goal.target || 1)) * 100),
          target: goal.target || 100,
          current: goal.current || 0,
          quarter: Math.ceil(new Date().getMonth() / 3),
          year: new Date().getFullYear(),
        })))

        setProjects(projectsRes.data || [])

        setNotifications((notifsRes.data || []).map((n: any) => ({
          id: n.id,
          type: n.type,
          message: n.message,
          time: n.createdAt ? format(new Date(n.createdAt), 'MMM dd, yyyy') : '',
          read: !!n.read,
        })))

        setIntegrations(intsRes.data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [user, supabase])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const greeting = t('dashboard.greeting', { name: user?.firstName || 'there' })

  const { bar14Labels, bar14Counts, created14Counts, trend14, overdueCount, completedCount, avgCycleDays } = useMemo(() => {
    // Build 14-day series from tasks using updatedAt (completion) and createdAt
    const labels: string[] = []
    const counts: number[] = []
    const createdCounts: number[] = []
    const trend: number[] = []
    const dayNames = ['S','M','T','W','T','F','S']
    const today = new Date()
    const start = new Date(today)
    start.setHours(0,0,0,0)
    start.setDate(start.getDate() - 13)

    for (let i = 0; i < 14; i++) {
      const dayStart = new Date(start)
      dayStart.setDate(start.getDate() + i)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23,59,59,999)
      labels.push(dayNames[dayStart.getDay()])

      const completed = tasks.filter(t => t.status === 'completed' && (t.completedAt || t.updatedAt) && new Date(t.completedAt || t.updatedAt) >= dayStart && new Date(t.completedAt || t.updatedAt) <= dayEnd).length
      counts.push(completed)
      const created = tasks.filter(t => t.createdAt && new Date(t.createdAt) >= dayStart && new Date(t.createdAt) <= dayEnd).length
      createdCounts.push(created)

      const createdTill = tasks.filter(t => t.createdAt && new Date(t.createdAt) <= dayEnd).length
      const completedTill = tasks.filter(t => t.status === 'completed' && (t.completedAt || t.updatedAt) && new Date(t.completedAt || t.updatedAt) <= dayEnd).length
      trend.push(createdTill > 0 ? Math.round((completedTill / createdTill) * 100) : 0)
    }

    // Overdue vs Completed snapshot
    const now = new Date()
    const overdue = tasks.filter(t => t.dueDateRaw && new Date(t.dueDateRaw) < now && t.status !== 'completed').length
    const completedNow = tasks.filter(t => t.status === 'completed').length

    // Average cycle time (days)
    const durations = tasks
      .filter(t => t.createdAt && (t.completedAt || t.updatedAt))
      .map(t => {
        const end = new Date(t.completedAt || t.updatedAt)
        const startAt = new Date(t.createdAt)
        const diffMs = end.getTime() - startAt.getTime()
        return Math.max(0, diffMs / (1000 * 60 * 60 * 24))
      })
    const avg = durations.length ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10 : 0

    return { bar14Labels: labels, bar14Counts: counts, created14Counts: createdCounts, trend14: trend, overdueCount: overdue, completedCount: completedNow, avgCycleDays: avg }
  }, [tasks])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">{greeting}</h1>
            <p className="text-sm text-gray-600">Welcome back to TheGridHub.</p>
          </div>
          <div className="hidden md:block w-72">
            <input value={globalQuery} onChange={(e)=>setGlobalQuery(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="Search tasks, projects, goals..." />
          </div>
          <SectionTabs value={active} onChange={(v) => setActive(v as any)} />
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-40 rounded-xl bg-white/70 animate-pulse" />
            <div className="h-40 rounded-xl bg-white/70 animate-pulse" />
            <div className="h-40 rounded-xl bg-white/70 animate-pulse" />
          </div>
        ) : (
          <div className="mt-6">
            {active === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                  <div className="text-sm text-gray-600">Tasks completed</div>
                  <div className="text-3xl font-bold mt-2">{tasks.filter(t => t.status === 'completed').length}</div>
                  <div className="text-xs text-gray-500 mt-1">Out of {tasks.length}</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                  <div className="text-sm text-gray-600">Projects</div>
                  <div className="text-3xl font-bold mt-2">{projects.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Active</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                  <div className="text-sm text-gray-600">Goals</div>
                  <div className="text-3xl font-bold mt-2">{goals.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Tracking</div>
                </div>
              </div>
            )}

            {active === 'tasks' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-xl p-6 border">
                  <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">Tasks</h3>
                    <div className="flex items-center gap-2 ml-auto">
                      <select value={projectFilter} onChange={(e)=>setProjectFilter(e.target.value)} className="border rounded-md px-2 py-1 text-sm">
                        <option value="">All projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="border rounded-md px-2 py-1 text-sm">
                        <option value="all">All status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="in-progress">In progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <select value={priorityFilter} onChange={(e)=>setPriorityFilter(e.target.value)} className="border rounded-md px-2 py-1 text-sm">
                        <option value="all">All priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <button onClick={()=>setDrawerOpen(true)} className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">New Task</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {tasks.length === 0 ? (
                      <div className="text-sm text-gray-600">No tasks yet. Create your first task.</div>
                    ) : (
                      tasks
                        .filter(t => !globalQuery || t.title.toLowerCase().includes(globalQuery.toLowerCase()))
                        .filter(t => projectFilter ? (t.projectId === projectFilter) : true)
                        .filter(t => statusFilter === 'all' ? true : t.status === statusFilter)
                        .filter(t => priorityFilter === 'all' ? true : t.priority === priorityFilter)
                        .slice(0, 50)
                        .map((task) => (
                        <button key={task.id} onClick={()=>{ setSelectedTask(task); setDetailOpen(true) }} className="w-full text-left flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                          <div>
                            <div className="text-sm font-medium truncate max-w-[42ch]">{task.title}</div>
                            <div className="text-xs text-gray-500">{task.project || 'No project'}{task.dueDate ? ` • ${task.dueDate}` : ''}</div>
                          </div>
                          <div className="text-xs text-gray-600 capitalize">{task.priority}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                  <SubscriptionGate plan={plan}>
                    {internalUserId && <AIAssistant userId={internalUserId} />}
                  </SubscriptionGate>
                </div>
              </div>
            )}

            {active === 'projects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.length === 0 && (
                  <div className="text-sm text-gray-600">No projects yet.</div>
                )}
                {projects.map((p) => (
                  <div key={p.id} className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{p.color || '#7C3AED'}</div>
                  </div>
                ))}
              </div>
            )}

            {active === 'goals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {goals.length === 0 && (
                  <div className="text-sm text-gray-600">No goals yet.</div>
                )}
                {goals.map((g) => (
                  <div key={g.id} className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                    <div className="text-sm font-medium">{g.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{g.current}/{g.target}</div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {active === 'analytics' && (
              <SubscriptionGate plan={plan}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                    <div className="text-sm text-gray-600 mb-2">Completed tasks (last 14 days)</div>
                    <BasicBarChart data={bar14Counts} labels={bar14Labels} />
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                    <div className="text-sm text-gray-600 mb-2">Tasks created per day (last 14 days)</div>
                    <BasicBarChart data={created14Counts} labels={bar14Labels} />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                    <div className="text-sm text-gray-600 mb-2">Completion ratio over time</div>
                    <BasicLineChart data={trend14} />
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                    <div className="text-sm text-gray-600 mb-2">Overdue vs Completed</div>
                    <div className="flex items-end gap-6 h-28">
                      <div className="flex flex-col items-center">
                        <div className="bg-red-400 w-6" style={{height: `${Math.min(100, overdueCount ? 60 + (overdueCount%40) : 10)}%`}} />
                        <div className="text-xs text-gray-600 mt-1">Overdue ({overdueCount})</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-green-400 w-6" style={{height: `${Math.min(100, completedCount ? 60 + (completedCount%40) : 10)}%`}} />
                        <div className="text-xs text-gray-600 mt-1">Completed ({completedCount})</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Quick snapshot of current state</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 mt-6">
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                    <div className="text-sm text-gray-600 mb-1">Average cycle time</div>
                    <div className="text-2xl font-semibold">{avgCycleDays} days</div>
                    <div className="text-xs text-gray-500">Average from creation to completion</div>
                  </div>
                </div>
              </SubscriptionGate>
            )}

            {active === 'integrations' && (
              <div className="">
                <IntegrationsPanel plan={plan} statuses={integrations} onRefetch={async ()=>{
                  const { data } = await supabase.from('integrations').select('id, type, status, connectedAt, lastSync, userEmail').eq('userId', internalUserId!)
                  setIntegrations(data || [])
                }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Task Drawer */}
      {internalUserId && (
        <CreateTaskDrawer
          open={drawerOpen}
          onClose={()=>setDrawerOpen(false)}
          userId={internalUserId}
          projects={projects}
          plan={plan}
          onCreated={(task)=> setTasks((prev)=>[task, ...prev])}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          open={detailOpen}
          onClose={()=>setDetailOpen(false)}
          task={selectedTask}
          onUpdated={(next)=>{
            setTasks(prev => prev.map(t => t.id === next.id ? { ...t, ...next } : t))
            setSelectedTask(next)
            setDetailOpen(false)
          }}
        />
      )}
    </div>
  )
}

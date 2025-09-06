'use client'

import { useUser } from '@/hooks/useUser'
import { useState, useEffect, useMemo } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import { SectionTabs, AIAssistant, IntegrationsPanel, SubscriptionGate } from '@/components/dashboard'
import CreateTaskDrawer from '@/components/dashboard/CreateTaskDrawer'
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
          priority: (task.priority || 'MEDIUM').toLowerCase(),
          status: (task.status || 'UPCOMING').toLowerCase().replace('_', '-'),
          progress: task.progress || 0,
          dueDate: task.dueDate ? format(new Date(task.dueDate), 'EEE, dd MMM yyyy') : '',
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
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

  const { bar14Labels, bar14Counts, trend14 } = useMemo(() => {
    // Build 14-day series from tasks using updatedAt (completion) and createdAt
    const labels: string[] = []
    const counts: number[] = []
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

      const completed = tasks.filter(t => t.status === 'completed' && t.updatedAt && new Date(t.updatedAt) >= dayStart && new Date(t.updatedAt) <= dayEnd).length
      counts.push(completed)

      const createdTill = tasks.filter(t => t.createdAt && new Date(t.createdAt) <= dayEnd).length
      const completedTill = tasks.filter(t => t.status === 'completed' && t.updatedAt && new Date(t.updatedAt) <= dayEnd).length
      trend.push(createdTill > 0 ? Math.round((completedTill / createdTill) * 100) : 0)
    }

    return { bar14Labels: labels, bar14Counts: counts, trend14: trend }
  }, [tasks])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{greeting}</h1>
            <p className="text-sm text-gray-600">Welcome back to TheGridHub.</p>
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Tasks</h3>
                    <button onClick={()=>setDrawerOpen(true)} className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">New Task</button>
                  </div>
                  <div className="space-y-3">
                    {tasks.length === 0 ? (
                      <div className="text-sm text-gray-600">No tasks yet. Create your first task.</div>
                    ) : (
                      tasks.slice(0, 20).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                          <div>
                            <div className="text-sm font-medium">{task.title}</div>
                            <div className="text-xs text-gray-500">{task.project || 'No project'}{task.dueDate ? ` • ${task.dueDate}` : ''}</div>
                          </div>
                          <div className="text-xs text-gray-600">{task.priority}</div>
                        </div>
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
                    <div className="text-sm text-gray-600 mb-2">Completion ratio over time</div>
                    <BasicLineChart data={trend14} />
                  </div>
                </div>
              </SubscriptionGate>
            )}

            {active === 'integrations' && (
              <div className="">
                <IntegrationsPanel plan={plan} statuses={integrations} />
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
    </div>
  )
}
          </div>
        </div>
          </>
        )}
      </main>
      </div>
    </div>
  )
}

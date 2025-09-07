'use client'

import { useUser } from '@/hooks/useUser'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useI18n } from '@/components/i18n/I18nProvider'
import { SectionTabs, AIAssistant, IntegrationsPanel, SubscriptionGate } from '@/components/dashboard'
import CreateTaskDrawer from '@/components/dashboard/CreateTaskDrawer'
import TaskDetailModal from '@/components/dashboard/TaskDetailModal'
import { BasicBarChart, BasicLineChart } from '@/components/dashboard/charts'
import { createClient } from '@/lib/supabase/client'
import { SUBSCRIPTION_PLANS, ANNUAL_PRICING } from '@/lib/pricing'
import { format } from 'date-fns'
import type { Plan, TaskRow, ProjectRow, GoalRow, NotificationRow, IntegrationSummary } from '@/types/db'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { t } = useI18n()
  const supabase = useMemo(() => createClient(), [])
  const lastLoadedUserId = useRef<string | null>(null)
  const mountedRef = useRef(true)

  const [active, setActive] = useState<'overview' | 'tasks' | 'projects' | 'goals' | 'analytics' | 'integrations' | 'billing'>('overview')
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [displayName, setDisplayName] = useState<string>('there')
  const [billingPeriod, setBillingPeriod] = useState<'month'|'year'>('month')

  const [internalUserId, setInternalUserId] = useState<string | null>(null)
  type UITask = { id: string; title: string; project: string; projectId: string | null; priority: 'low' | 'medium' | 'high'; status: 'upcoming' | 'in-progress' | 'completed' | string; progress: number; dueDate: string; dueDateRaw?: string | null; createdAt?: string; updatedAt?: string; completedAt?: string | null; description?: string }
  const [tasks, setTasks] = useState<UITask[]>([])
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [goals, setGoals] = useState<Array<{ id: string; title: string; progress: number; target: number; current: number; quarter: number; year: number }>>([])
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; message: string; time: string; read: boolean }>>([])
  const [integrations, setIntegrations] = useState<IntegrationSummary[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [globalQuery, setGlobalQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return
      // Prevent re-fetching for the same user repeatedly
      if (lastLoadedUserId.current === user.id) return
      lastLoadedUserId.current = user.id
      try {
        setLoading(true)
        // Resolve internal user id
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('supabaseId', user.id)
          .maybeSingle()
        const uid = userRow?.id as string | undefined
        if (!uid) { if (mountedRef.current) { setInternalUserId(null); setTasks([]); setProjects([]); setGoals([]); setNotifications([]); setPlan('FREE'); setDisplayName(user?.firstName || 'there') } return }
        setInternalUserId(uid)

        // Preferred greeting name from onboarding, fallback to auth metadata
        try {
          const { data: onboard } = await supabase
            .from('user_onboarding')
            .select('firstName')
            .eq('userId', uid)
            .maybeSingle()
          const name = (onboard?.firstName || user?.firstName || 'there').toString()
          if (mountedRef.current) setDisplayName(name)
        } catch { setDisplayName(user?.firstName || 'there') }

        // Load plan via view if available; fallback to subscriptions inference
        let resolvedPlan: Plan = 'FREE'
        try {
          const { data: v } = await supabase
            .from('user_effective_plan')
            .select('plan')
            .eq('userId', uid)
            .maybeSingle()
          if (v?.plan) {
            const p = v.plan.toString().toUpperCase()
            if (p === 'FREE' || p === 'PRO' || p === 'TEAM' || p === 'ENTERPRISE') {
              resolvedPlan = p as any
            }
          }
        } catch {}
        if (resolvedPlan === 'FREE') {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('userId', uid)
            .maybeSingle()
          const inferredPlan = (() => {
            const raw = (sub?.plan || (sub as any)?.tier || (sub as any)?.level || '').toString().toUpperCase()
            if (raw === 'PRO' || raw === 'TEAM' || raw === 'ENTERPRISE') return raw as any
            const status = (sub && ((sub as any).status || (sub as any).subscription_status))?.toString().toLowerCase()
            if (sub && ((((sub as any).stripeSubscriptionId) || ((sub as any).stripe_subscription_id) || ((sub as any).priceId) || ((sub as any).price_id)) || status === 'active' || status === 'trialing')) return 'PRO'
            return 'FREE'
          })()
          resolvedPlan = inferredPlan
        }
        setPlan(resolvedPlan)

        // Parallel load core data (no server-side order to avoid column mismatch; sort client-side)
        const [ tasksRes, goalsRes, projectsRes, notifsRes, intsRes ] = await Promise.all([
          supabase.from('tasks').select('*').eq('userId', uid),
          supabase.from('goals').select('*').eq('userId', uid),
          supabase.from('projects').select('*').eq('userId', uid),
          supabase.from('notifications').select('*').eq('userId', uid),
          supabase.from('integrations').select('id, type, status, connectedAt, lastSync, userEmail').eq('userId', uid)
        ])

        const byCreatedDesc = (a: any, b: any) => {
          const aDate = new Date(a.createdAt || a.created_at || a.created || a.inserted_at || 0).getTime()
          const bDate = new Date(b.createdAt || b.created_at || b.created || b.inserted_at || 0).getTime()
          return bDate - aDate
        }

        const projectsList: ProjectRow[] = Array.isArray(projectsRes.data) ? [...(projectsRes.data as ProjectRow[])] : []
        projectsList.sort(byCreatedDesc)
        const projectNameMap = new Map<string, string>()
        projectsList.forEach((p: any) => { if (p?.id) projectNameMap.set(p.id, p.name || p.title || '') })

        const tasksRaw: TaskRow[] = Array.isArray(tasksRes.data) ? [...(tasksRes.data as TaskRow[])] : []
        tasksRaw.sort(byCreatedDesc)
        const tasksData: UITask[] = tasksRaw.map((task) => ({
          id: task.id,
          title: task.title || 'Untitled',
          project: (task.projectId && projectNameMap.get(task.projectId)) || '',
          projectId: task.projectId || null,
          priority: ((task.priority || 'MEDIUM').toString().toLowerCase()) as UITask['priority'],
          status: ((task.status || 'UPCOMING').toString().toLowerCase().replace('_', '-')) as UITask['status'],
          progress: task.progress || 0,
          dueDate: task.dueDate ? format(new Date(task.dueDate), 'EEE, dd MMM yyyy') : '',
          dueDateRaw: task.dueDate || null,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completedAt: (task as any).completedAt || null,
          description: task.description || '',
        }))
        setTasks(tasksData)

        const goalsRaw: GoalRow[] = Array.isArray(goalsRes.data) ? [...(goalsRes.data as GoalRow[])] : []
        goalsRaw.sort(byCreatedDesc)
        setGoals(goalsRaw.map((goal: any) => ({
          id: goal.id,
          title: goal.title || goal.name || 'Goal',
          progress: Math.round(((goal.current || 0) / (goal.target || 1)) * 100),
          target: goal.target || 100,
          current: goal.current || 0,
          quarter: Math.ceil(new Date().getMonth() / 3),
          year: new Date().getFullYear(),
        })))

        setProjects(projectsList)

        const notifsRaw: NotificationRow[] = Array.isArray(notifsRes.data) ? [...(notifsRes.data as NotificationRow[])] : []
        notifsRaw.sort(byCreatedDesc)
        setNotifications(notifsRaw.map((n: any) => ({
          id: n.id,
          type: n.type,
          message: n.message || n.title || '',
          time: (n.createdAt || n.created_at) ? format(new Date(n.createdAt || n.created_at), 'MMM dd, yyyy') : '',
          read: !!(n.read ?? n.is_read),
        })))

        setIntegrations(intsRes.data || [])
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }
    fetchAll()
  }, [user])

  const greeting = t('dashboard.greeting', { name: displayName })

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

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

            {active === 'billing' && (
              <div className="grid grid-cols-1 gap-6">
                {/* Current Plan Summary */}
                <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-sm text-gray-600">Current plan</div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          plan === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                          plan === 'TEAM' || plan === 'BUSINESS' ? 'bg-blue-100 text-blue-700' :
                          plan === 'PRO' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {plan || 'FREE'}
                        </span>
                      </div>
                      <div className="text-2xl font-semibold">
                        {plan && plan !== 'FREE' ? (
                          <span>
                            ${(SUBSCRIPTION_PLANS as any)[plan]?.price || 0}<span className="text-sm font-normal text-gray-500">/month</span>
                          </span>
                        ) : (
                          'Free Forever'
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={async ()=>{
                          try {
                            const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
                            const json = await res.json().catch(()=>({}))
                            if (json?.url) window.location.assign(json.url)
                          } catch {}
                        }}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage Billing
                      </button>
                      {plan !== 'FREE' && (
                        <button
                          onClick={async ()=>{
                            try {
                              const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
                              const json = await res.json().catch(()=>({}))
                              if (json?.url) window.location.assign(json.url)
                            } catch {}
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Invoices
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Usage Summary */}
                  {plan && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-900 mb-4">Usage & Limits</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Projects</span>
                            <span className="text-xs font-medium">
                              {projects.length} / {(SUBSCRIPTION_PLANS as any)[plan]?.features?.maxProjects === -1 ? '∞' : (SUBSCRIPTION_PLANS as any)[plan]?.features?.maxProjects || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                projects.length >= ((SUBSCRIPTION_PLANS as any)[plan]?.features?.maxProjects || 0) ? 'bg-red-500' : 'bg-purple-500'
                              }`} 
                              style={{ 
                                width: `${Math.min(100, (projects.length / ((SUBSCRIPTION_PLANS as any)[plan]?.features?.maxProjects || 1)) * 100)}%` 
                              }} 
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Tasks</span>
                            <span className="text-xs font-medium">
                              {tasks.length} / {(SUBSCRIPTION_PLANS as any)[plan]?.features?.maxTasks === -1 ? '∞' : (SUBSCRIPTION_PLANS as any)[plan]?.features?.maxTasks || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                tasks.length >= ((SUBSCRIPTION_PLANS as any)[plan]?.features?.maxTasks || 0) ? 'bg-red-500' : 'bg-purple-500'
                              }`} 
                              style={{ 
                                width: `${Math.min(100, (tasks.length / ((SUBSCRIPTION_PLANS as any)[plan]?.features?.maxTasks || 1)) * 100)}%` 
                              }} 
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">AI Suggestions</span>
                            <span className="text-xs font-medium">
                              Used this month
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upgrade Options */}
                <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-lg font-semibold">Available Plans</div>
                      <div className="text-sm text-gray-600">Upgrade or downgrade anytime</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 mr-2">Billing cycle:</span>
                      <button
                        onClick={()=>setBillingPeriod('month')}
                        className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${billingPeriod==='month'?'bg-purple-600 text-white border-purple-600':'bg-white border-gray-300 hover:bg-gray-50'}`}
                      >Monthly</button>
                      <button
                        onClick={()=>setBillingPeriod('year')}
                        className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${billingPeriod==='year'?'bg-purple-600 text-white border-purple-600':'bg-white border-gray-300 hover:bg-gray-50'}`}
                      >
                        Yearly
                        <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">-20%</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {(['FREE','PRO','BUSINESS','ENTERPRISE'] as const).map((k) => {
                      const cfg = billingPeriod==='year' && k !== 'FREE' ? (ANNUAL_PRICING as any)[k] : (SUBSCRIPTION_PLANS as any)[k]
                      const priceId = cfg?.stripePriceId
                      const price = cfg?.price
                      const features = cfg?.features || {}
                      const isCurrent = plan === k
                      const isDowngrade = plan && ['ENTERPRISE','BUSINESS','TEAM','PRO'].indexOf(plan) < ['ENTERPRISE','BUSINESS','TEAM','PRO'].indexOf(k)
                      
                      return (
                        <div key={k} className={`border rounded-xl p-4 ${isCurrent ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium text-lg">{cfg?.name || k}</div>
                            {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600 text-white">Current</span>}
                            {cfg?.popular && !isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Popular</span>}
                          </div>
                          
                          <div className="mb-4">
                            {price !== undefined ? (
                              <>
                                <span className="text-3xl font-bold">${price}</span>
                                <span className="text-gray-600">/{billingPeriod === 'year' ? 'mo' : 'month'}</span>
                                {billingPeriod === 'year' && k !== 'FREE' && cfg?.annualSavings && (
                                  <div className="text-xs text-green-600 mt-1">Save ${cfg.annualSavings}/year</div>
                                )}
                              </>
                            ) : k === 'ENTERPRISE' ? (
                              <div className="text-2xl font-semibold">Contact sales</div>
                            ) : (
                              <div className="text-3xl font-bold">Free</div>
                            )}
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>{features.maxProjects === -1 ? 'Unlimited' : features.maxProjects} projects</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>{features.maxTasks === -1 ? 'Unlimited' : features.maxTasks?.toLocaleString()} tasks</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>{features.aiSuggestions === -1 ? 'Unlimited' : features.aiSuggestions} AI/mo</span>
                            </div>
                          </div>
                          
                          {isCurrent ? (
                            <button disabled className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                              Current Plan
                            </button>
                          ) : k === 'FREE' ? (
                            <button
                              onClick={async ()=>{
                                if (confirm('Downgrade to Free? You\'ll lose access to premium features.')) {
                                  try {
                                    const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
                                    const json = await res.json().catch(()=>({}))
                                    if (json?.url) window.location.assign(json.url)
                                  } catch {}
                                }
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Downgrade to Free
                            </button>
                          ) : k === 'ENTERPRISE' ? (
                            <a href="mailto:sales@thegridhub.com?subject=Enterprise%20Plan%20Inquiry" className="block w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-center transition-colors">
                              Contact Sales
                            </a>
                          ) : (
                            <button
                              disabled={!priceId}
                              onClick={async ()=>{
                                try {
                                  const res = await fetch('/api/stripe/create-checkout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ priceId, planName: k })
                                  })
                                  const json = await res.json().catch(()=>({}))
                                  if (json?.url) window.location.assign(json.url)
                                } catch {}
                              }}
                              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                                priceId
                                  ? isDowngrade 
                                    ? 'border border-gray-300 hover:bg-gray-50' 
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {isDowngrade ? 'Downgrade' : 'Upgrade'} to {cfg?.name || k}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {billingPeriod === 'year' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-green-900">20% annual discount applied</div>
                          <div className="text-xs text-green-700">All yearly plans include 2 months free</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Security & Compliance
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                        PCI-compliant payment processing
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                        Secure cancellation anytime
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                        No hidden fees or charges
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 border">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Need help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">Our support team is here to help you choose the right plan.</p>
                    <div className="flex gap-2">
                      <a href="mailto:support@thegridhub.com" className="text-sm text-purple-600 hover:text-purple-700 font-medium">Email support</a>
                      <span className="text-gray-400">•</span>
                      <a href="/pricing" className="text-sm text-purple-600 hover:text-purple-700 font-medium">Compare plans</a>
                    </div>
                  </div>
                </div>
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

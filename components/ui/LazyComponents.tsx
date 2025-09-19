'use client'

import { lazy, Suspense } from 'react'
import { LoadingSpinner } from './Loading'

// Lazy load heavy dashboard components
export const LazyTaskBoard = lazy(() => 
  import('../dashboard/TaskBoard').then(module => ({ default: module.TaskBoard }))
)

export const LazyProjectGantt = lazy(() => 
  import('../dashboard/ProjectGantt').then(module => ({ default: module.ProjectGantt }))
)

export const LazyAnalyticsDashboard = lazy(() => 
  import('../dashboard/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard }))
)

export const LazyContactsTable = lazy(() => 
  import('../contacts/ContactsTable').then(module => ({ default: module.ContactsTable }))
)

export const LazySettingsPanel = lazy(() => 
  import('../settings/SettingsPanel').then(module => ({ default: module.SettingsPanel }))
)

// Wrapper component with consistent loading UI
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function LazyWrapper({ children, fallback, className }: LazyWrapperProps) {
  const defaultFallback = (
    <div className={`flex items-center justify-center p-8 ${className || ''}`}>
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)
  
  return function WrappedComponent(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <LazyComponent {...props} />
      </LazyWrapper>
    )
  }
}

// Route-based code splitting helpers
export const LazyRoutes = {
  Dashboard: lazy(() => import('../../app/dashboard/page')),
  Projects: lazy(() => import('../../app/dashboard/projects/page')),
  Tasks: lazy(() => import('../../app/dashboard/tasks/page')),
  Teams: lazy(() => import('../../app/dashboard/teams/page')),
  Contacts: lazy(() => import('../../app/dashboard/contacts/page')),
  Settings: lazy(() => import('../../app/dashboard/settings/page')),
  Analytics: lazy(() => import('../../app/dashboard/analytics/page')),
  Billing: lazy(() => import('../../app/dashboard/billing/page'))
}

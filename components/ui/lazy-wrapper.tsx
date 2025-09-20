'use client'

import React, { Suspense, lazy } from 'react'
import { SkeletonLoader } from './skeleton-loader'

/**
 * Generic lazy wrapper that takes a component factory function
 * and wraps it with Suspense and a skeleton loader
 */
export interface LazyWrapperProps {
  fallback?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function LazyWrapper({ 
  fallback, 
  className,
  children 
}: LazyWrapperProps) {
  const defaultFallback = (
    <div className={className}>
      <SkeletonLoader className="h-32" />
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

/**
 * Creates a lazy-loaded component with automatic skeleton fallback
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackProps?: {
    className?: string
    height?: string
  }
) {
  const LazyComponent = lazy(importFn)
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    const defaultFallback = (
      <SkeletonLoader 
        className={fallbackProps?.className || "h-32"} 
        style={{ height: fallbackProps?.height }}
      />
    )

    return (
      <Suspense fallback={defaultFallback}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    )
  })
}

/**
 * Lazy load heavy dashboard components
 */
export const LazyAnalyticsChart = createLazyComponent(
  () => import('../charts/AnalyticsChart'),
  { className: "h-64 w-full" }
)

export const LazyTaskBoard = createLazyComponent(
  () => import('../tasks/TaskBoard'),
  { className: "h-96 w-full" }
)

export const LazyProjectGallery = createLazyComponent(
  () => import('../projects/ProjectGallery'),
  { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }
)

export const LazyContactsTable = createLazyComponent(
  () => import('../contacts/ContactsTable'),
  { className: "h-64 w-full" }
)

export const LazyCalendarView = createLazyComponent(
  () => import('../calendar/CalendarView'),
  { className: "h-96 w-full" }
)

/**
 * Lazy load modals and heavy forms
 */
export const LazyProjectModal = createLazyComponent(
  () => import('../modals/ProjectModal'),
  { className: "w-full h-32" }
)

export const LazyTaskModal = createLazyComponent(
  () => import('../modals/TaskModal'),
  { className: "w-full h-32" }
)

export const LazyFileUploadModal = createLazyComponent(
  () => import('../modals/FileUploadModal'),
  { className: "w-full h-32" }
)

/**
 * Hook to preload components on user interaction or route change
 */
export function useComponentPreloader() {
  const preload = React.useCallback((componentPath: string) => {
    // Preload component when user hovers or focuses on a trigger
    switch (componentPath) {
      case 'analytics':
        import('../charts/AnalyticsChart')
        break
      case 'tasks':
        import('../tasks/TaskBoard')
        break
      case 'projects':
        import('../projects/ProjectGallery')
        break
      case 'contacts':
        import('../contacts/ContactsTable')
        break
      case 'calendar':
        import('../calendar/CalendarView')
        break
      default:
        break
    }
  }, [])

  return { preload }
}

/**
 * Intersection Observer based lazy loading for viewport-aware loading
 */
export function LazyViewportWrapper({ 
  children, 
  fallback,
  className,
  rootMargin = '50px'
}: LazyWrapperProps & {
  rootMargin?: string
}) {
  const [isInView, setIsInView] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin])

  const defaultFallback = (
    <div className={className}>
      <SkeletonLoader className="h-32" />
    </div>
  )

  return (
    <div ref={ref} className={className}>
      {isInView ? children : (fallback || defaultFallback)}
    </div>
  )
}

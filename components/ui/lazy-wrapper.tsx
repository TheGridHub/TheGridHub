'use client'

import React, { Suspense, lazy } from 'react'
import { SkeletonLoader } from './SkeletonLoaders'

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

// Note: Specific lazy components can be added as needed when the actual components exist

/**
 * Hook to preload components on user interaction or route change
 */
export function useComponentPreloader() {
  const preload = React.useCallback((componentPath: string) => {
    // Preload component when user hovers or focuses on a trigger
    // Components can be added here as they are created
    console.log(`Preloading ${componentPath} (component not yet implemented)`)
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

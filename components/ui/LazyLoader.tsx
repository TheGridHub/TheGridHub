'use client'

import React, { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

interface LazyLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function LazyLoader({ children, fallback, className = '' }: LazyLoaderProps) {
  const defaultFallback = (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <Loader2 className="w-6 h-6 animate-spin text-[#873bff]" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

// Lazy load wrapper with skeleton
interface LazyWithSkeletonProps {
  children: React.ReactNode
  skeleton: React.ReactNode
  className?: string
  delay?: number
}

export function LazyWithSkeleton({ 
  children, 
  skeleton, 
  className = '', 
  delay = 200 
}: LazyWithSkeletonProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (showSkeleton) {
    return <div className={className}>{skeleton}</div>
  }

  return (
    <Suspense fallback={<div className={className}>{skeleton}</div>}>
      <div className={className}>{children}</div>
    </Suspense>
  )
}

// HOC for lazy loading components
export function withLazyLoading<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  const LazyComponent = (props: T) => (
    <LazyLoader fallback={fallback}>
      <Component {...props} />
    </LazyLoader>
  )

  LazyComponent.displayName = `LazyLoaded(${Component.displayName || Component.name})`
  return LazyComponent
}

// Lazy load sections with intersection observer
interface LazyOnViewProps {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
  fallback?: React.ReactNode
  once?: boolean
}

export function LazyOnView({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  fallback,
  once = true
}: LazyOnViewProps) {
  const [isInView, setIsInView] = React.useState(false)
  const [hasBeenInView, setHasBeenInView] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting
        setIsInView(inView)
        
        if (inView && !hasBeenInView) {
          setHasBeenInView(true)
          if (once) {
            observer.unobserve(element)
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, once, hasBeenInView])

  const shouldRender = once ? hasBeenInView : isInView

  return (
    <div ref={ref} className={className}>
      {shouldRender ? (
        <Suspense fallback={fallback || (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#873bff]" />
          </div>
        )}>
          {children}
        </Suspense>
      ) : (
        fallback || <div className="h-32 bg-gray-50 rounded-lg animate-pulse" />
      )}
    </div>
  )
}

// Lazy load with retry mechanism
interface LazyWithRetryProps {
  children: React.ReactNode
  maxRetries?: number
  retryDelay?: number
  fallback?: React.ReactNode
  className?: string
}

export function LazyWithRetry({
  children,
  maxRetries = 3,
  retryDelay = 1000,
  fallback,
  className = ''
}: LazyWithRetryProps) {
  const [retryCount, setRetryCount] = React.useState(0)
  const [hasError, setHasError] = React.useState(false)

  const retry = () => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setHasError(false)
      }, retryDelay)
    }
  }

  const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    React.useEffect(() => {
      const errorHandler = () => {
        setHasError(true)
      }

      window.addEventListener('error', errorHandler)
      return () => window.removeEventListener('error', errorHandler)
    }, [])

    if (hasError) {
      return (
        <div className={`text-center py-8 ${className}`}>
          <p className="text-gray-600 mb-4">Failed to load content</p>
          {retryCount < maxRetries ? (
            <button
              onClick={retry}
              className="px-4 py-2 text-sm bg-[#873bff] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry ({maxRetries - retryCount} attempts left)
            </button>
          ) : (
            <p className="text-red-600 text-sm">Maximum retries reached</p>
          )}
        </div>
      )
    }

    return <>{children}</>
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || (
        <div className={`flex items-center justify-center py-8 ${className}`}>
          <Loader2 className="w-6 h-6 animate-spin text-[#873bff]" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

// Lazy load images
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  className?: string
  wrapperClassName?: string
}

export function LazyImage({
  src,
  alt,
  placeholder,
  className = '',
  wrapperClassName = '',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isInView, setIsInView] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
    const element = imgRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [])

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      <img
        ref={imgRef}
        src={isInView ? src : placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  )
}

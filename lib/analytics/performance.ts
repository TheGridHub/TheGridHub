'use client'

import React from 'react'
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals'

// Performance metrics tracking
export interface PerformanceMetrics {
  cls: number | null // Cumulative Layout Shift
  fid: number | null // First Input Delay
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  ttfb: number | null // Time to First Byte
}

type MetricType = keyof PerformanceMetrics

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    cls: null,
    fid: null,
    fcp: null,
    lcp: null,
    ttfb: null
  }

  private callbacks: Array<(metrics: PerformanceMetrics) => void> = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals()
    }
  }

  private initializeWebVitals() {
    const handleMetric = (metric: Metric) => {
      const metricType = metric.name.toLowerCase() as MetricType
      this.metrics[metricType] = metric.value
      this.notifyCallbacks()
      this.sendToAnalytics(metric)
    }

    // Collect Web Vitals
    getCLS(handleMetric)
    getFID(handleMetric)
    getFCP(handleMetric)
    getLCP(handleMetric)
    getTTFB(handleMetric)
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback({ ...this.metrics }))
  }

  private sendToAnalytics(metric: Metric) {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true
      })
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/vitals', {
        method: 'POST',
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          delta: metric.delta,
          url: window.location.href,
          timestamp: Date.now()
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(console.error)
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback)
    
    // Return cleanup function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  // Custom performance marks
  public mark(name: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name)
    }
  }

  public measure(name: string, startMark: string, endMark?: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.measure(name, startMark, endMark)
      
      const entries = performance.getEntriesByName(name, 'measure')
      const entry = entries[entries.length - 1]
      
      if (entry) {
        this.sendCustomMetric(name, entry.duration)
      }
    }
  }

  private sendCustomMetric(name: string, value: number) {
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/custom-metrics', {
        method: 'POST',
        body: JSON.stringify({
          name,
          value,
          url: window.location.href,
          timestamp: Date.now()
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(console.error)
    }
  }

  // Track resource loading times
  public trackResourceTiming() {
    if (typeof window === 'undefined' || !('performance' in window)) return

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          this.sendCustomMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart)
          this.sendCustomMetric('load_complete', navEntry.loadEventEnd - navEntry.loadEventStart)
        }
        
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          this.sendCustomMetric(`resource_${resourceEntry.initiatorType}`, resourceEntry.responseEnd - resourceEntry.startTime)
        }
      })
    })

    observer.observe({ entryTypes: ['navigation', 'resource'] })
  }

  // Memory usage tracking
  public trackMemoryUsage() {
    if (typeof window === 'undefined' || !('memory' in performance)) return

    const memory = (performance as any).memory
    
    return {
      usedJSMemory: memory.usedJSMemory,
      totalJSMemory: memory.totalJSMemory,
      memoryLimit: memory.jsMemoryLimit
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(performanceMonitor.getMetrics())

  React.useEffect(() => {
    const cleanup = performanceMonitor.onMetricsUpdate(setMetrics)
    return cleanup
  }, [])

  return {
    metrics,
    mark: performanceMonitor.mark.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    trackMemory: performanceMonitor.trackMemoryUsage.bind(performanceMonitor)
  }
}

// Utility functions for performance budgets
export const PERFORMANCE_BUDGETS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 600  // Time to First Byte (ms)
}

export function evaluatePerformance(metrics: PerformanceMetrics) {
  const scores = {
    lcp: metrics.lcp ? (metrics.lcp <= PERFORMANCE_BUDGETS.LCP ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor') : 'unknown',
    fid: metrics.fid ? (metrics.fid <= PERFORMANCE_BUDGETS.FID ? 'good' : metrics.fid <= 300 ? 'needs-improvement' : 'poor') : 'unknown',
    cls: metrics.cls ? (metrics.cls <= PERFORMANCE_BUDGETS.CLS ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor') : 'unknown',
    fcp: metrics.fcp ? (metrics.fcp <= PERFORMANCE_BUDGETS.FCP ? 'good' : metrics.fcp <= 3000 ? 'needs-improvement' : 'poor') : 'unknown',
    ttfb: metrics.ttfb ? (metrics.ttfb <= PERFORMANCE_BUDGETS.TTFB ? 'good' : metrics.ttfb <= 1800 ? 'needs-improvement' : 'poor') : 'unknown'
  }

  return scores
}

// Performance debugging utilities
export function logPerformanceMetrics() {
  if (process.env.NODE_ENV === 'development') {
    const metrics = performanceMonitor.getMetrics()
    const scores = evaluatePerformance(metrics)
    
    console.group('🚀 Performance Metrics')
    console.log('LCP (Largest Contentful Paint):', metrics.lcp, 'ms', `(${scores.lcp})`)
    console.log('FID (First Input Delay):', metrics.fid, 'ms', `(${scores.fid})`)
    console.log('CLS (Cumulative Layout Shift):', metrics.cls, `(${scores.cls})`)
    console.log('FCP (First Contentful Paint):', metrics.fcp, 'ms', `(${scores.fcp})`)
    console.log('TTFB (Time to First Byte):', metrics.ttfb, 'ms', `(${scores.ttfb})`)
    console.groupEnd()
  }
}

// Component-level performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    React.useEffect(() => {
      performanceMonitor.mark(`${componentName}-start`)
      
      return () => {
        performanceMonitor.mark(`${componentName}-end`)
        performanceMonitor.measure(`${componentName}-render`, `${componentName}-start`, `${componentName}-end`)
      }
    }, [])

    return React.createElement(WrappedComponent, props)
  }
}

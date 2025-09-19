'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'

// Query optimization utilities
export class QueryOptimizer {
  private supabase = createClient()
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  // Cache TTL configurations (in milliseconds)
  private cacheTTL = {
    static: 30 * 60 * 1000, // 30 minutes for rarely changing data
    dynamic: 5 * 60 * 1000,  // 5 minutes for frequently changing data
    realtime: 1 * 60 * 1000  // 1 minute for real-time data
  }

  // Generate cache key from query parameters
  private getCacheKey(table: string, filters: any, select?: string): string {
    const key = {
      table,
      filters: JSON.stringify(filters),
      select: select || '*'
    }
    return btoa(JSON.stringify(key))
  }

  // Check if cached data is still valid
  private isCacheValid(cacheEntry: any): boolean {
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl
  }

  // Generic cached query method
  async cachedQuery<T>(
    table: string,
    filters: any = {},
    options: {
      select?: string
      orderBy?: { column: string; ascending?: boolean }[]
      limit?: number
      offset?: number
      cacheTTL?: 'static' | 'dynamic' | 'realtime' | number
    } = {}
  ): Promise<{ data: T[] | null; error: any }> {
    const cacheKey = this.getCacheKey(table, filters, options.select)
    const cached = this.cache.get(cacheKey)
    
    // Return cached data if valid
    if (cached && this.isCacheValid(cached)) {
      return { data: cached.data, error: null }
    }

    try {
      // Build query
      let query = this.supabase.from(table).select(options.select || '*')

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value)
          } else if (typeof value === 'object' && value.operator) {
            // Support for complex filters: { operator: 'gte', value: 100 }
            query = query.filter(key, value.operator, value.value)
          } else {
            query = query.eq(key, value)
          }
        }
      })

      // Apply ordering
      if (options.orderBy) {
        options.orderBy.forEach(order => {
          query = query.order(order.column, { ascending: order.ascending !== false })
        })
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }

      const { data, error } = await query

      if (!error && data) {
        // Cache the result
        const ttl = typeof options.cacheTTL === 'number' 
          ? options.cacheTTL 
          : this.cacheTTL[options.cacheTTL || 'dynamic']
        
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl
        })
      }

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Optimized pagination with total count
  async paginatedQuery<T>(
    table: string,
    filters: any = {},
    options: {
      page: number
      pageSize: number
      select?: string
      orderBy?: { column: string; ascending?: boolean }[]
      countColumn?: string
    }
  ): Promise<{
    data: T[] | null
    error: any
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
      hasMore: boolean
    }
  }> {
    const { page, pageSize } = options
    const offset = (page - 1) * pageSize

    // Get total count efficiently
    const { count, error: countError } = await this.supabase
      .from(table)
      .select(options.countColumn || 'id', { count: 'exact', head: true })

    if (countError) {
      return {
        data: null,
        error: countError,
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
          hasMore: false
        }
      }
    }

    // Get paginated data
    const { data, error } = await this.cachedQuery<T>(table, filters, {
      ...options,
      limit: pageSize,
      offset
    })

    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    return {
      data,
      error,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    }
  }

  // Batch operations for better performance
  async batchInsert<T>(table: string, records: T[]): Promise<{ data: T[] | null; error: any }> {
    // Split large batches into chunks to avoid timeout
    const chunkSize = 100
    const chunks = []
    
    for (let i = 0; i < records.length; i += chunkSize) {
      chunks.push(records.slice(i, i + chunkSize))
    }

    try {
      const results = []
      for (const chunk of chunks) {
        const { data, error } = await this.supabase
          .from(table)
          .insert(chunk)
          .select()
        
        if (error) throw error
        if (data) results.push(...data)
      }

      return { data: results as T[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Upsert operations for efficient updates
  async batchUpsert<T>(
    table: string, 
    records: T[], 
    options: {
      onConflict: string
      ignoreDuplicates?: boolean
    }
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .upsert(records, {
          onConflict: options.onConflict,
          ignoreDuplicates: options.ignoreDuplicates
        })
        .select()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Clear cache for specific table or pattern
  clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const keysToDelete = []
    for (const [key] of this.cache.entries()) {
      try {
        const decoded = JSON.parse(atob(key))
        if (decoded.table.includes(pattern)) {
          keysToDelete.push(key)
        }
      } catch {
        // Invalid key, skip
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // Preload data for better UX
  async preloadData(table: string, filters: any = {}, options: any = {}) {
    // Fire and forget - load data into cache
    this.cachedQuery(table, filters, options).catch(console.error)
  }
}

// Singleton instance
export const queryOptimizer = new QueryOptimizer()

// React Hook for optimized data fetching
export function useOptimizedQuery<T>(
  table: string,
  filters: any = {},
  options: {
    select?: string
    orderBy?: { column: string; ascending?: boolean }[]
    limit?: number
    offset?: number
    cacheTTL?: 'static' | 'dynamic' | 'realtime' | number
    enabled?: boolean
  } = {}
) {
  const [data, setData] = React.useState<T[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<any>(null)

  React.useEffect(() => {
    if (options.enabled === false) return

    const fetchData = async () => {
      setLoading(true)
      const result = await queryOptimizer.cachedQuery<T>(table, filters, options)
      setData(result.data)
      setError(result.error)
      setLoading(false)
    }

    fetchData()
  }, [table, JSON.stringify(filters), JSON.stringify(options)])

  const refetch = React.useCallback(async () => {
    // Clear cache and refetch
    queryOptimizer.clearCache(table)
    setLoading(true)
    const result = await queryOptimizer.cachedQuery<T>(table, filters, options)
    setData(result.data)
    setError(result.error)
    setLoading(false)
  }, [table, filters, options])

  return { data, loading, error, refetch }
}

// Hook for optimized pagination
export function useOptimizedPagination<T>(
  table: string,
  filters: any = {},
  initialPage: number = 1,
  pageSize: number = 20,
  options: any = {}
) {
  const [data, setData] = React.useState<T[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<any>(null)
  const [pagination, setPagination] = React.useState({
    page: initialPage,
    pageSize,
    total: 0,
    totalPages: 0,
    hasMore: false
  })

  const fetchPage = React.useCallback(async (page: number) => {
    setLoading(true)
    const result = await queryOptimizer.paginatedQuery<T>(table, filters, {
      page,
      pageSize,
      ...options
    })
    
    setData(result.data || [])
    setError(result.error)
    setPagination(result.pagination)
    setLoading(false)
  }, [table, filters, pageSize, options])

  React.useEffect(() => {
    fetchPage(initialPage)
  }, [fetchPage, initialPage])

  const nextPage = React.useCallback(() => {
    if (pagination.hasMore) {
      fetchPage(pagination.page + 1)
    }
  }, [fetchPage, pagination])

  const prevPage = React.useCallback(() => {
    if (pagination.page > 1) {
      fetchPage(pagination.page - 1)
    }
  }, [fetchPage, pagination])

  const goToPage = React.useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchPage(page)
    }
  }, [fetchPage, pagination.totalPages])

  return {
    data,
    loading,
    error,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    refetch: () => fetchPage(pagination.page)
  }
}

// Optimized search with debouncing
export function useOptimizedSearch<T>(
  table: string,
  searchColumns: string[],
  searchTerm: string,
  options: any = {}
) {
  const [data, setData] = React.useState<T[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<any>(null)
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout>()

  React.useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Don't search if term is too short
    if (searchTerm.length < 2) {
      setData([])
      return
    }

    setLoading(true)

    // Debounce search
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        // Build search filters
        const searchFilters = searchColumns.reduce((acc, column) => {
          acc[column] = { operator: 'ilike', value: `%${searchTerm}%` }
          return acc
        }, {} as any)

        const result = await queryOptimizer.cachedQuery<T>(table, searchFilters, {
          ...options,
          cacheTTL: 'dynamic'
        })

        setData(result.data || [])
        setError(result.error)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [table, searchTerm, searchColumns.join(','), options])

  return { data, loading, error }
}

// Performance monitoring for queries
export function measureQueryPerformance<T>(
  queryName: string,
  queryFunction: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()
  
  return queryFunction().then(result => {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`🐌 Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`)
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && duration > 2000) {
      // Log to your analytics service
      console.log('Slow query:', { queryName, duration })
    }
    
    return result
  })
}

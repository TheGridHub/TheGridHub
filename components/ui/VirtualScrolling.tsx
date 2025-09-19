'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface VirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onScroll?: (scrollTop: number) => void
  loading?: boolean
  loadingComponent?: React.ReactNode
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  loading = false,
  loadingComponent
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const { visibleItems, offsetY, totalHeight } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )

    // Add overscan items
    const overscanStartIndex = Math.max(0, startIndex - overscan)
    const overscanEndIndex = Math.min(items.length - 1, endIndex + overscan)

    const visibleItems = []
    for (let i = overscanStartIndex; i <= overscanEndIndex; i++) {
      visibleItems.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        }
      })
    }

    return {
      visibleItems,
      offsetY: overscanStartIndex * itemHeight,
      totalHeight: items.length * itemHeight,
    }
  }, [items, itemHeight, scrollTop, containerHeight, overscan])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)
    onScroll?.(scrollTop)
  }, [onScroll])

  if (loading) {
    return (
      <div className={`relative ${className}`} style={{ height: containerHeight }}>
        {loadingComponent || (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#873bff]" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={scrollElementRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, item, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Specialized virtual list for tasks
interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  assignee?: { name: string; avatar?: string }
  due_date?: string
}

interface VirtualTaskListProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  loading?: boolean
  className?: string
}

export function VirtualTaskList({ 
  tasks, 
  onTaskClick, 
  loading, 
  className 
}: VirtualTaskListProps) {
  const renderTask = useCallback((task: Task, index: number) => (
    <div 
      className="flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
      onClick={() => onTaskClick?.(task)}
    >
      <input
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={() => {}}
        className="rounded border-gray-300"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-gray-600 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority}
          </span>
          {task.due_date && (
            <span className="text-xs text-gray-500">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      {task.assignee && (
        <div className="flex items-center gap-2">
          {task.assignee.avatar ? (
            <img
              src={task.assignee.avatar}
              alt={task.assignee.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-600">
                {task.assignee.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  ), [onTaskClick])

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <VirtualScroll
        items={tasks}
        itemHeight={80}
        containerHeight={600}
        renderItem={renderTask}
        loading={loading}
      />
    </div>
  )
}

// Specialized virtual list for contacts
interface Contact {
  id: string
  name: string
  email?: string
  company?: string
  phone?: string
  avatar?: string
}

interface VirtualContactListProps {
  contacts: Contact[]
  onContactClick?: (contact: Contact) => void
  loading?: boolean
  className?: string
}

export function VirtualContactList({ 
  contacts, 
  onContactClick, 
  loading, 
  className 
}: VirtualContactListProps) {
  const renderContact = useCallback((contact: Contact, index: number) => (
    <div 
      className="flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
      onClick={() => onContactClick?.(contact)}
    >
      {contact.avatar ? (
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#873bff]/10 flex items-center justify-center">
          <span className="font-medium text-[#873bff]">
            {contact.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {contact.email && (
            <span className="truncate">{contact.email}</span>
          )}
          {contact.company && (
            <span className="truncate">{contact.company}</span>
          )}
        </div>
      </div>
      {contact.phone && (
        <div className="hidden md:block text-sm text-gray-600">
          {contact.phone}
        </div>
      )}
    </div>
  ), [onContactClick])

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <VirtualScroll
        items={contacts}
        itemHeight={72}
        containerHeight={600}
        renderItem={renderContact}
        loading={loading}
      />
    </div>
  )
}

// Hook for infinite scrolling with virtual scrolling
export function useInfiniteVirtualScroll<T>({
  fetchData,
  pageSize = 50,
  itemHeight,
  containerHeight
}: {
  fetchData: (page: number) => Promise<T[]>
  pageSize?: number
  itemHeight: number
  containerHeight: number
}) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const newItems = await fetchData(page)
      if (newItems.length < pageSize) {
        setHasMore(false)
      }
      setItems(prev => [...prev, ...newItems])
      setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error loading more items:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchData, page, pageSize, loading, hasMore])

  const handleScroll = useCallback((scrollTop: number) => {
    const scrollThreshold = 0.8
    const maxScrollTop = items.length * itemHeight - containerHeight
    
    if (scrollTop / maxScrollTop > scrollThreshold && hasMore && !loading) {
      loadMore()
    }
  }, [items.length, itemHeight, containerHeight, hasMore, loading, loadMore])

  // Load initial data
  useEffect(() => {
    if (items.length === 0) {
      loadMore()
    }
  }, [])

  return {
    items,
    loading,
    hasMore,
    handleScroll,
    loadMore
  }
}

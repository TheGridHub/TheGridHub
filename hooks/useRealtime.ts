import { useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  table: string
  queryKey: string[]
  filter?: string
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void
  enabled?: boolean
}

export function useRealtime({
  table,
  queryKey,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true
}: UseRealtimeOptions) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  const handleInsert = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    // Invalidate and refetch the query
    queryClient.invalidateQueries({ queryKey })
    
    // Call custom handler if provided
    onInsert?.(payload)
  }, [queryClient, queryKey, onInsert])

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    // Invalidate and refetch the query
    queryClient.invalidateQueries({ queryKey })
    
    // Call custom handler if provided
    onUpdate?.(payload)
  }, [queryClient, queryKey, onUpdate])

  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    // Invalidate and refetch the query
    queryClient.invalidateQueries({ queryKey })
    
    // Call custom handler if provided
    onDelete?.(payload)
  }, [queryClient, queryKey, onDelete])

  useEffect(() => {
    if (!enabled) return

    // Create channel name with filter if provided
    const channelName = filter ? `${table}:${filter}` : table

    // Create the channel
    channelRef.current = supabase.channel(channelName)

    // Set up the subscription with optional filter
    let subscription = channelRef.current.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter && { filter })
      },
      (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            handleInsert(payload)
            break
          case 'UPDATE':
            handleUpdate(payload)
            break
          case 'DELETE':
            handleDelete(payload)
            break
        }
      }
    )

    // Subscribe to the channel
    subscription.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${table} changes`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to ${table} changes`)
      }
    })

    // Cleanup function
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [enabled, table, filter, handleInsert, handleUpdate, handleDelete, supabase])

  // Manual subscription control
  const subscribe = useCallback(() => {
    channelRef.current?.subscribe()
  }, [])

  const unsubscribe = useCallback(() => {
    channelRef.current?.unsubscribe()
  }, [])

  return {
    subscribe,
    unsubscribe,
    isSubscribed: channelRef.current?.state === 'joined'
  }
}

// Convenience hooks for specific tables
export function useTasksRealtime(teamId: string, enabled = true) {
  return useRealtime({
    table: 'tasks',
    queryKey: ['tasks', teamId],
    filter: `team_id=eq.${teamId}`,
    enabled
  })
}

export function useProjectsRealtime(teamId: string, enabled = true) {
  return useRealtime({
    table: 'projects',
    queryKey: ['projects', teamId],
    filter: `team_id=eq.${teamId}`,
    enabled
  })
}

export function useNotificationsRealtime(userId: string, enabled = true) {
  return useRealtime({
    table: 'notifications',
    queryKey: ['notifications', userId],
    filter: `user_id=eq.${userId}`,
    enabled
  })
}

export function useNotesRealtime(teamId: string, enabled = true) {
  return useRealtime({
    table: 'notes',
    queryKey: ['notes', teamId],
    filter: `team_id=eq.${teamId}`,
    enabled
  })
}

export function useContactsRealtime(teamId: string, enabled = true) {
  return useRealtime({
    table: 'contacts',
    queryKey: ['contacts', teamId],
    filter: `team_id=eq.${teamId}`,
    enabled
  })
}

export function useCompaniesRealtime(teamId: string, enabled = true) {
  return useRealtime({
    table: 'companies',
    queryKey: ['companies', teamId],
    filter: `team_id=eq.${teamId}`,
    enabled
  })
}

"use client"

import { useEffect, useState } from 'react'

export function useIntegrationStatus(type: 'slack' | 'office365'): { loading: boolean; connected: boolean; info?: any; error?: string } {
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [info, setInfo] = useState<any>(null)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/integrations/${type}/status`)
        const json = await res.json().catch(()=> ({}))
        if (!mounted) return
        if (res.ok) {
          setConnected(!!json?.connected)
          setInfo(json)
        } else {
          setConnected(false)
          setError(json?.error || res.statusText)
        }
      } catch (e: any) {
        if (!mounted) return
        setConnected(false)
        setError(e?.message || String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [type])

  return { loading, connected, info, error }
}


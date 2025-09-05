"use client"

import { useEffect, useState } from 'react'

let cache: Record<string, boolean> | null = null

export function useFeatureFlag(key: string) {
  const [enabled, setEnabled] = useState<boolean>(false)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!cache) {
          const res = await fetch('/api/flags', { cache: 'no-store' })
          const json = await res.json()
          cache = json?.flags || {}
        }
        if (mounted) setEnabled(!!cache?.[key])
      } catch {
        if (mounted) setEnabled(false)
      }
    })()
    return () => { mounted = false }
  }, [key])
  return enabled
}


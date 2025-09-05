"use client"

import { useEffect } from 'react'

export default function ErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level: 'ERROR', message: event.message, details: { filename: event.filename, lineno: event.lineno, colno: event.colno, stack: event.error?.stack } })
        })
      } catch {}
    }
    function onRejection(event: PromiseRejectionEvent) {
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level: 'ERROR', message: String(event.reason), details: { reason: event.reason } })
        })
      } catch {}
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])
  return null
}


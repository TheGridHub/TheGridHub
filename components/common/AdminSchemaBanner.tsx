"use client"

import { useEffect, useState } from 'react'

export default function AdminSchemaBanner() {
  const [show, setShow] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Determine role (owner/admin) from team memberships
        const roleRes = await fetch('/api/team')
        const roleJson = await roleRes.json().catch(()=> [])
        const roles = Array.isArray(roleJson) ? roleJson.map((m: any) => String(m.role || '').toLowerCase()) : []
        const isAdmin = roles.includes('owner') || roles.includes('admin')
        if (!isAdmin) { if (mounted) setShow(false); return }
        // Check schema
        const res = await fetch('/api/health/db/schema-check')
        const json = await res.json().catch(()=> ({}))
        if (!mounted) return
        if (json && json.ok === false) {
          setShow(true)
          setText('Database schema check failed. Review results in Diagnostics.')
        } else {
          setShow(false)
        }
      } catch {
        // If failing, keep silent
        if (mounted) setShow(false)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (!show || loading) return null

  return (
    <div className="mx-4 mb-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <strong>Admin notice:</strong> {text}
        </div>
        <a href="/admin/diagnostics" className="px-3 py-1 rounded-md border border-yellow-300 bg-white text-yellow-900 hover:bg-yellow-100">Open Diagnostics</a>
      </div>
    </div>
  )
}


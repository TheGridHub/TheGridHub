'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function DashboardSettingsPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the main settings page
    router.push('/settings')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600">Redirecting to settings...</p>
      </div>
    </div>
  )
}
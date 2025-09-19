'use client'

import { Wifi, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wifi className="w-8 h-8 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You're offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          It looks like you've lost your internet connection. Don't worry, we've saved your work locally and it will sync when you're back online.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 bg-[#873bff] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#7a35e6] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Go Back
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            What you can do offline:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• View previously loaded pages</li>
            <li>• Access cached data</li>
            <li>• Create and edit tasks (will sync later)</li>
            <li>• View your profile and settings</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

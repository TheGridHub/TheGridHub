'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to Clerk Account Portal
    window.location.href = 'https://accounts.thegridhub.co/sign-up'
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="text-center relative z-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Redirecting to sign up...
          </h2>
          <p className="text-gray-600">
            You will be redirected to our secure sign-up page.
          </p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
          <a 
            href="https://accounts.thegridhub.co/sign-up"
            className="mt-4 text-purple-600 hover:text-purple-700 underline inline-block"
          >
            Click here if you are not redirected
          </a>
        </div>
      </div>
    </div>
  )
}

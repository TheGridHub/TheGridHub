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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Redirecting to sign up...
        </h2>
        <p className="text-gray-600">
          You will be redirected to our secure sign-up page.
        </p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <a 
          href="https://accounts.thegridhub.co/sign-up"
          className="mt-4 text-blue-600 hover:text-blue-700 underline inline-block"
        >
          Click here if you are not redirected
        </a>
      </div>
    </div>
  )
}

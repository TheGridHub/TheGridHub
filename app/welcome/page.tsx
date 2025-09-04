'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function WelcomePage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  // Check if user has completed onboarding
  useEffect(() => {
    if (isLoaded && user) {
      const hasOnboarded = localStorage.getItem('onboarded')
      const timer = setTimeout(() => {
        if (hasOnboarded) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }, 12000)

      return () => clearTimeout(timer)
    }
  }, [router, isLoaded, user])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-lg text-center">
        {/* Welcome Animation */}
        <div className="mx-auto w-32 h-32 mb-6">
          <DotLottieReact
            src="/Lottie/Welcome.lottie"
            loop
            autoplay
            className="w-full h-full"
          />
        </div>

        {/* Welcome Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to TheGridHub!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Hi {user?.firstName || 'there'}! Your account has been successfully created. 
          Get ready to supercharge your productivity.
        </p>

        {/* Feature highlights */}
        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-700">Create unlimited projects and tasks</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-700">Get AI-powered task suggestions</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-700">Connect with 50+ popular tools</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/onboarding"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center group"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <p className="text-xs text-gray-500">
            Redirecting automatically in 12 seconds...
          </p>
        </div>
      </div>
    </div>
  )
}

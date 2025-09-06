'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function WelcomePage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [secondsLeft, setSecondsLeft] = useState(5)
  const params = useSearchParams()

  // Check onboarding in Supabase and decide whether to show this once
  useEffect(() => {
    let interval: any
    if (isLoaded && user) {
      ;(async () => {
        // Ensure a users row exists before any other calls
        try { await fetch('/api/users/ensure', { method: 'POST' }) } catch {}
        // Trigger seeding in the background (idempotent)
        fetch('/api/onboarding/seed', { method: 'POST' }).catch(()=>{})

        let target = '/onboarding'
        let showSeconds = 0
        try {
          const supabase = createClient()
          const { data: u } = await supabase.from('users').select('id').eq('supabaseId', user.id).maybeSingle()
          const uid = u?.id as string | undefined
          if (uid) {
            const { data: onboard } = await supabase.from('user_onboarding').select('id').eq('userId', uid).maybeSingle()
            if (onboard) {
              target = '/dashboard'
              // Show the welcome screen only when explicitly coming from onboarding (first=1)
              const first = params?.get('first') === '1'
              if (first) {
                showSeconds = 5
                try { localStorage.setItem('onboarded', '1') } catch {}
              }
            }
          }
        } catch {}

        if (showSeconds > 0) {
          setSecondsLeft(showSeconds)
          interval = setInterval(() => {
            setSecondsLeft((s) => {
              if (s <= 1) {
                clearInterval(interval)
                router.push(target)
                return 0
              }
              return s - 1
            })
          }, 1000)
        } else {
          router.push(target)
        }
      })()
    }
    return () => { if (interval) clearInterval(interval) }
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
            Redirecting automatically in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams?.get('redirect') || '/dashboard'
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  
  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              first_name: fullName.split(' ')[0],
              last_name: fullName.split(' ').slice(1).join(' '),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        
        if (error) throw error
        
        if (data?.user && !data.user.confirmed_at) {
          setError('Please check your email to confirm your account.')
          return
        }
        
        router.push('/welcome')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        router.push(redirect)
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      })
      
      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    }
  }

  const testimonials = [
    {
      quote: "We have a very unique way of managing projects and collaborating — we're very process- and data-driven. With TheGridHub, we were able to unite our project management in one platform.",
      author: "Natalie Neumann",
      role: "COO, Design+",
      avatar: "https://ui-avatars.com/api/?name=Natalie+Neumann&background=FF6B6B&color=fff&size=120"
    },
    {
      quote: "TheGridHub transformed how our team works. The AI suggestions save us hours every week, and the integrations with our existing tools made adoption seamless.",
      author: "Michael Chen",
      role: "CTO, TechStart",
      avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=4ECDC4&color=fff&size=120"
    },
    {
      quote: "Finally, a task management platform that actually understands how modern teams work. The analytics give us insights we never had before.",
      author: "Sarah Williams",
      role: "Product Lead, Innovate Co",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Williams&background=95A5F6&color=fff&size=120"
    }
  ]

  const [currentTestimonial] = useState(0)

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-white to-purple-50">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Left Section - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center space-x-3 group">
              <img 
                src="/images/logo.svg" 
                alt="TheGridHub" 
                className="h-10 w-auto transition-transform group-hover:scale-110"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                TheGridHub
              </span>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {isSignUp ? 'Get started!' : 'Welcome back!'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp ? 'Create your account to continue' : 'Enter your details to continue'}
            </p>
          </div>

          {/* OAuth Button */}
          <button
            onClick={() => handleOAuthLogin('google')}
            className="w-full flex items-center justify-center px-4 py-3 border border-purple-200 rounded-xl shadow-sm bg-white hover:bg-purple-50 text-sm font-medium text-gray-700 hover:border-purple-300 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign {isSignUp ? 'up' : 'in'} with Google
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 border border-purple-200 rounded-xl shadow-sm bg-white hover:bg-purple-50 text-sm font-medium text-gray-700 hover:border-purple-300 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            Sign {isSignUp ? 'up' : 'in'} with GitHub
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/80 text-purple-600 font-medium">OR</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleEmailAuth}>
            {isSignUp && (
              <div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white/50 border border-purple-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all hover:bg-white/70"
                  placeholder="Full Name"
                />
              </div>
            )}

            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/50 border border-purple-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all hover:bg-white/70"
                placeholder="Email"
              />
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-white/50 border border-purple-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm pr-10 transition-all hover:bg-white/70"
                placeholder="Password"
                minLength={6}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Forgot Password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-600">
              {isSignUp ? "Haven't got an account? " : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setEmail('')
                setPassword('')
                setFullName('')
              }}
              className="font-medium text-purple-600 hover:text-purple-700"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Testimonial */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10">
        <div className="max-w-lg">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
              "{testimonials[currentTestimonial].quote}"
            </p>
            <div className="flex items-center">
              <img
                src={testimonials[currentTestimonial].avatar}
                alt={testimonials[currentTestimonial].author}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="text-gray-900 font-semibold">{testimonials[currentTestimonial].author}</p>
                <p className="text-gray-500 text-sm">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
          </div>

          {/* Company logos */}
          <div className="mt-12 flex items-center justify-center space-x-8 opacity-60">
            <div className="text-gray-400 font-bold text-lg">make</div>
            <div className="text-gray-400 font-bold text-lg">MIT</div>
            <div className="text-gray-400 font-bold text-lg">Google</div>
            <div className="text-gray-400 font-bold text-lg">EvenUp</div>
            <div className="text-gray-400 font-bold text-lg">Clay</div>
          </div>
        </div>
      </div>
    </div>
  )
}

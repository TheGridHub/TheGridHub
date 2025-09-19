"use client"

import { useEffect, useState } from 'react'

export default function SuspendedPage() {
  const [count, setCount] = useState(5)
  useEffect(() => {
    const t = setInterval(()=> setCount(c=> Math.max(0, c-1)), 1000)
    return ()=> clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl mb-3">!</div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Account Suspended</h1>
        <p className="text-slate-600 text-sm mb-4">Your account has been temporarily suspended. Please contact support if you believe this is a mistake.</p>
        <a href="/sign-in" className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-700">Return to Sign In</a>
        <div className="text-xs text-slate-500 mt-2">Redirecting in {count}s…</div>
      </div>
    </div>
  )
}


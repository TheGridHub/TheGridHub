'use client'

import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">TheGridHub</h1>
        <p className="mt-4 text-lg text-gray-600">Modern task management with enterprise integrations at startup pricing.</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/pricing" className="rounded-md bg-[#873bff] text-white px-6 py-3 font-semibold hover:bg-[#712fe0]">View Pricing</Link>
          <Link href="/admin-internal/login" className="rounded-md border border-gray-300 px-6 py-3 font-semibold text-gray-900 hover:bg-gray-50">Admin Login</Link>
        </div>
      </section>
    </main>
  )
}

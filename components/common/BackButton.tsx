"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </button>
  )
}


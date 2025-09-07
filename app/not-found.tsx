'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
      <div className="max-w-xl w-full bg-white shadow-[0px_4px_200px_#e8f9f733] rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          {mounted && (
            <DotLottieReact
              src="/animations/lonely-404.lottie"
              autoplay
              loop={false}
              style={{ width: 260, height: 260 }}
            />
          )}
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="px-4 py-2 bg-white border border-black hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Go Back
          </Button>
          <Link href="/">
            <Button className="px-4 py-2 bg-[#873bff] text-white overflow-hidden border-none shadow-[0px_0px_0px_4px_#0000000a,inset_0px_10px_12px_#ffffff42] hover:bg-[#7a35e6] hover:shadow-lg active:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 relative before:content-[''] before:absolute before:inset-0 before:p-px before:rounded before:[background:linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.07)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


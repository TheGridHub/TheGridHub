"use client"

import dynamic from 'next/dynamic'

const AdminToaster = dynamic(() => import('@/components/AdminToaster'), { ssr: false })

export default function LayoutClient() {
  return <AdminToaster />
}


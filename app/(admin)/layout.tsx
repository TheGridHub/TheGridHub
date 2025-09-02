import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// List of admin user IDs (in production, store this in database)
const ADMIN_USER_IDS = [
  'user_2abc123def456', // Replace with actual admin Clerk user IDs
  'user_2xyz789ghi012',
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  // Check if user is authenticated
  if (!userId) {
    redirect('/sign-in?redirect=/admin')
  }

  // Check if user is admin
  if (!ADMIN_USER_IDS.includes(userId)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// List of admin user emails (in production, store this in database with role)
const ADMIN_EMAILS = [
  'admin@thegridhub.co', // Replace with actual admin emails
  'support@thegridhub.co',
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Check if user is authenticated
  if (!session) {
    redirect('/login?redirect=/admin')
  }

  // Check if user is admin
  if (!ADMIN_EMAILS.includes(session.user.email || '')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  )
}

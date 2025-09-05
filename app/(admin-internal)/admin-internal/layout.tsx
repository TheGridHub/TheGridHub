import { redirect } from 'next/navigation'
import { validateSessionCookie } from '@/lib/internal-admin/session'

export const dynamic = 'force-dynamic'

export default function AdminInternalLayout({ children }: { children: React.ReactNode }) {
  const session = validateSessionCookie()
  if (!session.valid) {
    redirect('/admin-internal/login')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
      <div className="relative z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600" />
            <div>
              <div className="text-sm text-slate-500">Internal</div>
              <div className="text-slate-900 font-semibold">TheGridHub Admin</div>
            </div>
          </div>
          <form action="/api/admin-internal/login" method="POST" onSubmit={(e)=>{}}>
            <button
              formAction="/api/admin-internal/login"
              formMethod="DELETE"
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm"
            >
              Sign out
            </button>
          </form>
        </div>
        <main className="p-6 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}


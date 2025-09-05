import { redirect } from 'next/navigation'
import { validateSessionCookie } from '@/lib/internal-admin/session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-600">
              Logged in as <span className="font-medium text-slate-900">{session.username}</span>
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${session.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                {session.role}
              </span>
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
        </div>
        <main className="p-6 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}


import { redirect } from 'next/navigation'
import { validateSessionCookie } from '@/lib/internal-admin/session'
import LayoutClient from './LayoutClient'

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
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <a href="/admin-internal" className="text-slate-700 hover:text-slate-900">Home</a>
              <a href="/admin-internal/users" className="text-slate-700 hover:text-slate-900">Users</a>
              <a href="/admin-internal/projects" className="text-slate-700 hover:text-slate-900">Projects</a>
              <a href="/admin-internal/tasks" className="text-slate-700 hover:text-slate-900">Tasks</a>
              <a href="/admin-internal/team" className="text-slate-700 hover:text-slate-900">Team</a>
              <a href="/admin-internal/db" className="text-slate-700 hover:text-slate-900">DB</a>
              <a href="/admin-internal/integrations" className="text-slate-700 hover:text-slate-900">Integrations</a>
              <a href="/admin-internal/notifications" className="text-slate-700 hover:text-slate-900">Notifications</a>
              <a href="/admin-internal/stripe" className="text-slate-700 hover:text-slate-900">Stripe</a>
              <a href="/admin-internal/logs" className="text-slate-700 hover:text-slate-900">Logs</a>
              <a href="/admin-internal/errors" className="text-slate-700 hover:text-slate-900">Errors</a>
              <a href="/admin-internal/maintenance" className="text-slate-700 hover:text-slate-900">Maintenance</a>
              <a href="/admin-internal/flags" className="text-slate-700 hover:text-slate-900">Flags</a>
            </nav>
            <div className="text-xs text-slate-600">
              Logged in as <span className="font-medium text-slate-900">{session.username}</span>
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${session.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                {session.role}
              </span>
            </div>
            <form action="/api/admin-internal/login" method="POST">
              <button
                type="submit"
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
        <LayoutClient />
      </div>
    </div>
  )
}


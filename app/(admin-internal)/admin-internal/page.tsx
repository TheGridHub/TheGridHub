import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getHealth() {
  try {
    const res = await fetch('/api/admin-internal/health', { cache: 'no-store' })
    const ct = res.headers.get('content-type') || ''
    if (!res.ok || !ct.includes('application/json')) throw new Error('Health fetch failed')
    return res.json()
  } catch (e) {
    return null
  }
}

function StatusBadge({ ok }: { ok?: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {ok ? 'OK' : 'FAIL'}
    </span>
  )
}

export default async function AdminInternalHome() {
  const health = await getHealth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">System Health</h1>
          <p className="text-slate-600 text-sm">Aggregated checks across app, db, integrations and envs (masked)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin-internal/users" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Users</Link>
          <Link href="/admin-internal/flags" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Feature Flags</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Runtime Checks</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><div>App</div><StatusBadge ok={health?.checks?.app?.ok || health?.checks?.app?.status === 200} /></div>
            <div className="flex items-center justify-between"><div>Database</div><StatusBadge ok={health?.checks?.db?.ok || health?.checks?.db?.status === 200} /></div>
            <div className="flex items-center justify-between"><div>Stripe</div><StatusBadge ok={health?.checks?.stripe?.ok || health?.checks?.stripe?.status === 200} /></div>
            <div className="flex items-center justify-between"><div>Slack</div><StatusBadge ok={health?.checks?.slack?.ok || health?.checks?.slack?.status === 200} /></div>
            <div className="flex items-center justify-between"><div>Google Workspace</div><StatusBadge ok={health?.checks?.google?.ok || health?.checks?.google?.status === 200} /></div>
            <div className="flex items-center justify-between"><div>Microsoft 365</div><StatusBadge ok={health?.checks?.microsoft?.ok || health?.checks?.microsoft?.status === 200} /></div>
            <div className="flex items-center justify-between"><div>Supabase</div><StatusBadge ok={health?.checks?.supabase?.ok} /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Environment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {health ? Object.entries(health.env).map(([k, v]: any) => (
              <div key={k} className="flex items-center justify-between border rounded-lg p-2">
                <div className="text-slate-600 mr-2 truncate">{k}</div>
                <div className="font-mono text-slate-900 truncate">{typeof v === 'object' && 'present' in v ? (v.present ? v.value : '—') : '[group]'}</div>
              </div>
            )) : <div className="text-slate-600">Unable to fetch health</div>}
          </div>
        </div>
      </div>
    </div>
  )
}


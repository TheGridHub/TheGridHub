import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getJSON(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return { ok: false, status: res.status }
    return res.json()
  } catch (e:any) {
    return { ok: false, error: e?.message || String(e) }
  }
}

export default async function AdminDbPage() {
  const schema = await getJSON(`/api/health/db/schema-check`)
  const latency = await getJSON(`/api/health/db/latency`)
  const rls = await getJSON(`/api/admin-internal/db/rls`)

  function Flag({ ok }: { ok?: boolean }) {
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ok ? 'OK' : 'FAIL'}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Database Checks</h1>
          <p className="text-slate-600 text-sm">Schema, latency, and RLS smoke tests</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin-internal" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Back</Link>
          <Link href="/admin-internal/db/explorer" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Explorer</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Schema Check</h2>
          <Flag ok={!!schema?.ok} />
          <pre className="mt-2 text-xs text-slate-700 whitespace-pre-wrap">{JSON.stringify(schema, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-2">Latency</h2>
          <Flag ok={!!latency?.ok} />
          <pre className="mt-2 text-xs text-slate-700 whitespace-pre-wrap">{JSON.stringify(latency, null, 2)}</pre>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-2">RLS Smoke</h2>
          <Flag ok={!!rls?.ok} />
          <pre className="mt-2 text-xs text-slate-700 whitespace-pre-wrap">{JSON.stringify(rls, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}


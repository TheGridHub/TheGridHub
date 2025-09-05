import FeatureFlagsAdmin from '@/components/admin/FeatureFlagsAdmin'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminFlagsPage() {
  const supa = createServiceClient()
  let flags: any[] = []
  try {
    const { data } = await supa.from('feature_flags').select('key, enabled, description, is_public, updated_at').order('key')
    flags = data || []
  } catch {}

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-semibold text-gray-900">Admin • Feature Flags</h1>
        <p className="text-sm text-gray-600 mt-1">View and toggle feature flags for controlled rollouts and experiments.</p>
      </div>
      <FeatureFlagsAdmin initialFlags={flags as any} />
    </div>
  )
}


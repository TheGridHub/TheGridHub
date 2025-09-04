import IntegrationSettings from '@/components/IntegrationSettings'

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function IntegrationsSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <IntegrationSettings />
      </div>
    </div>
  )
}


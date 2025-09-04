// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <header className="bg-white shadow-sm border-b mb-6">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
          </div>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <p className="text-gray-600">Manage your account details via our secure Account Portal.</p>
          <a
            href="https://accounts.thegridhub.co"
            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Open Account Portal
          </a>
        </div>
      </div>
    </div>
  )
}


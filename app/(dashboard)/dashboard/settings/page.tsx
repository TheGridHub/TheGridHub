export const dynamic = 'force-dynamic'
export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600 mb-6">Choose a section to manage your account.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="/settings/profile" className="block p-4 rounded-xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-sm">
            <div className="font-medium text-gray-900">Profile</div>
            <div className="text-sm text-gray-600">Update your name, avatar and bio</div>
          </a>
          <a href="/settings/account" className="block p-4 rounded-xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-sm">
            <div className="font-medium text-gray-900">Account</div>
            <div className="text-sm text-gray-600">Email, password and security</div>
          </a>
          <a href="/settings/billing" className="block p-4 rounded-xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-sm">
            <div className="font-medium text-gray-900">Billing</div>
            <div className="text-sm text-gray-600">Plan, invoices and payment methods</div>
          </a>
          <a href="/settings/integrations" className="block p-4 rounded-xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-sm">
            <div className="font-medium text-gray-900">Integrations</div>
            <div className="text-sm text-gray-600">Slack, Google/Office 365, Jira</div>
          </a>
        </div>
      </div>
    </div>
  )
}


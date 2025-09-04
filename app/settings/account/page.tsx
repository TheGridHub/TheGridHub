export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-purple-900/30 text-white">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Account Settings</h1>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
          <p className="text-purple-200">Manage your account details via our secure Account Portal.</p>
          <a
            href="https://accounts.thegridhub.co"
            className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
          >
            Open Account Portal
          </a>
        </div>
      </div>
    </div>
  )
}


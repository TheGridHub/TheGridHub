"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function JiraIntegrationPage() {
  const router = useRouter()
  const [baseUrl, setBaseUrl] = useState("")
  const [email, setEmail] = useState("")
  const [apiToken, setApiToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "jira",
          name: "Jira",
          accessToken: JSON.stringify({ baseUrl, email, apiToken }),
          refreshToken: null,
          userEmail: email,
        }),
      })
      if (!res.ok) {
        throw new Error("Failed to save Jira integration")
      }
      router.push("/dashboard/settings/integrations?success=jira_connected")
    } catch (err: any) {
      setError(err.message || "Failed to connect Jira")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Connect Jira</h1>
        <p className="text-slate-600 mb-6 text-sm">
          Provide your Jira Cloud details. You can generate an API token at
          id.atlassian.com under Security.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jira Base URL</label>
            <input
              type="url"
              required
              placeholder="https://your-domain.atlassian.net"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jira Account Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jira API Token</label>
            <input
              type="password"
              required
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Create at https://id.atlassian.com/manage-profile/security/api-tokens
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            Connect Jira
          </button>
        </form>
      </div>
    </div>
  )
}


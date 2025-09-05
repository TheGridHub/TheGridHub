"use client"

export const dynamic = 'force-dynamic'

import { useToast } from '@/hooks/use-toast'
import { useFeatureFlag } from '@/components/common/useFeatureFlag'

import { useI18n } from '@/components/i18n/I18nProvider'

export default function IntegrationsSettingsPage() {
  const { toast } = useToast()
  const { t } = useI18n()
  const googleMeetEnabled = useFeatureFlag('google_meet_test')

  const post = async (url: string, body?: any) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const errText = await res.text().catch(()=> '')
      throw new Error(errText || 'Request failed')
    }
    return res.json().catch(()=> ({}))
  }

  const get = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
      const errText = await res.text().catch(()=> '')
      throw new Error(errText || 'Request failed')
    }
    return res.json().catch(()=> ({}))
  }

  const slackStatus = async () => {
    try {
      const status = await get('/api/integrations/slack/status')
      if (!status?.connected) {
        toast({ title: 'Slack not connected', description: 'Connect Slack under Integrations.', variant: 'destructive' })
        return
      }
      toast({ title: 'Slack connected', description: status.workspace || '', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Slack status failed', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const slackTest = async () => {
    try {
      const status = await get('/api/integrations/slack/status')
      if (!status?.connected) throw new Error('Slack not connected')
      const channelId = window.prompt('Enter Slack channel ID for test message:')
      if (!channelId) return
      await post('/api/integrations/slack/test-message', { channelId, text: 'TheGridHub test message ✅' })
      toast({ title: t('settings.integrations.slack.testMessage') || 'Send test message', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Slack test failed', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const googleStatus = async () => {
    try {
      const status = await get('/api/integrations/google/status')
      if (!status?.connected) {
        toast({ title: 'Google not connected', description: 'Connect Google Workspace under Integrations.', variant: 'destructive' })
        return
      }
      toast({ title: 'Google connected', description: status.userEmail || '', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Google status failed', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const googleTestEmail = async () => {
    try {
      await post('/api/integrations/google/test-email')
      toast({ title: t('settings.integrations.google.testEmail') || 'Send test email', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Google email failed', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const googleTestCalendar = async () => {
    try {
      await post('/api/integrations/google/test-calendar')
      toast({ title: t('settings.integrations.google.testCalendar') || 'Create test calendar event', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Google calendar failed', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const googleTestSheets = async () => {
    try {
      const res = await post('/api/integrations/google/test-sheets')
      toast({ title: 'Sheets smoke test', description: res?.message || 'OK', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Google Sheets failed', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const msStatus = async () => {
    try {
      const status = await get('/api/integrations/office365/status')
      if (!status?.connected) {
        toast({ title: 'Microsoft 365 not connected', description: 'Connect Office 365 under Integrations.', variant: 'destructive' })
        return
      }
      toast({ title: 'Microsoft 365 connected', description: status.userEmail || '', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Microsoft status failed', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const msTestEmail = async () => {
    try {
      await post('/api/integrations/office365/test-email')
      toast({ title: t('settings.integrations.microsoft.testEmail') || 'Send test email', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Microsoft email failed', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  const msTestCalendar = async () => {
    try {
      await post('/api/integrations/office365/test-calendar')
      toast({ title: t('settings.integrations.microsoft.testCalendar') || 'Create test calendar event', variant: 'success' })
    } catch (e:any) {
      toast({ title: 'Microsoft calendar failed', description: e?.message || String(e), variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">{t('settings.integrations.title') || 'Integrations'}</h1>
          {require('@/components/common/SettingsTabs').default()}
        </div>
        <p className="text-slate-600">{t('settings.integrations.description') || 'Connect Slack, Google Workspace, Microsoft 365, and Jira.'}</p>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="font-medium mb-2">{t('settings.integrations.slack.title') || 'Slack'}</h2>
            <div className="flex gap-2 flex-wrap">
              <button onClick={slackStatus} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Check status</button>
              <button onClick={slackTest} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">{t('settings.integrations.slack.testMessage') || 'Send test message'}</button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium mb-2">{t('settings.integrations.google.title') || 'Google Workspace'}</h2>
            <div className="flex gap-2 flex-wrap">
              <button onClick={googleStatus} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Check status</button>
              <button onClick={googleTestEmail} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">{t('settings.integrations.google.testEmail') || 'Send test email'}</button>
              <button onClick={googleTestCalendar} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">{t('settings.integrations.google.testCalendar') || 'Create test calendar event'}</button>
              {googleMeetEnabled ? (
                <button onClick={async ()=>{ try { await post('/api/integrations/google/test-calendar?meet=1'); toast({ title: 'Create Meet event', variant: 'success' }) } catch (e:any) { toast({ title: 'Google Meet failed', description: e?.message || String(e), variant: 'destructive' }) } }} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Create Meet event</button>
              ) : null}
              <button onClick={googleTestSheets} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">{t('settings.integrations.google.testSheets') || 'Create test spreadsheet'}</button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium mb-2">{t('settings.integrations.microsoft.title') || 'Microsoft 365'}</h2>
            <div className="flex gap-2 flex-wrap">
              <button onClick={msStatus} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Check status</button>
              <button onClick={msTestEmail} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">{t('settings.integrations.microsoft.testEmail') || 'Send test email'}</button>
              <button onClick={msTestCalendar} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">{t('settings.integrations.microsoft.testCalendar') || 'Create test calendar event'}</button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-medium mb-2">{t('settings.integrations.jira.title') || 'Jira'}</h2>
            <div className="text-slate-600 text-sm mb-2">{t('settings.integrations.jira.description') || 'Configure your Jira project key per project in /dashboard/projects and use the "Create issue" flow from the task UI.'}</div>
            <a href="/dashboard/settings/integrations/jira" className="inline-block px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">{t('settings.integrations.jira.open') || 'Open Jira settings'}</a>
          </div>
        </div>
      </div>
    </div>
  )
}


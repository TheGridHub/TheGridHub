"use client"

import BackButton from '@/components/common/BackButton'
import { useI18n } from '@/components/i18n/I18nProvider'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsIndex() {
  const { locale, setLocale, t } = useI18n()
  const [companyName, setCompanyName] = useState('')
  const supabase = useMemo(()=>createClient(),[])

  // Load existing settings from user_onboarding
  useEffect(()=>{
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const userRow = await supabase.from('users').select('id').eq('supabaseId', user.id).maybeSingle()
      const uid = userRow.data?.id
      if (!uid) return
      const onboard = await supabase.from('user_onboarding').select('companyName, language').eq('userId', uid).maybeSingle()
      if (onboard.data?.companyName) setCompanyName(onboard.data.companyName)
      if (onboard.data?.language) setLocale(onboard.data.language)
    }
    void load()
  }, [supabase, setLocale])

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">{t('settings.title') || 'Settings'}</h1>
            <p className="text-slate-600">{t('settings.subtitle') || 'Manage your profile, workspace, language, and integrations.'}</p>
          </div>
          <BackButton href="/dashboard" />
        </div>

        {/* Tabs */}
        {require('@/components/common/SettingsTabs').default()}

        {/* Language */}
        <section className="border border-slate-200 rounded-xl p-4">
          <h2 className="text-lg font-medium text-slate-900 mb-2">{t('settings.language') || 'Language'}</h2>
          <div className="flex items-center gap-3">
            <select
              className="px-3 py-2 rounded-lg border border-slate-300"
              value={locale}
              onChange={async (e)=>{
                const val = e.target.value as any
                setLocale(val)
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const userRow = await supabase.from('users').select('id').eq('supabaseId', user.id).maybeSingle()
                const uid = userRow.data?.id
                if (!uid) return
                // upsert language into onboarding
                const existing = await supabase.from('user_onboarding').select('id').eq('userId', uid).maybeSingle()
                if (existing.data) {
                  await supabase.from('user_onboarding').update({ language: val }).eq('userId', uid)
                } else {
                  await supabase.from('user_onboarding').insert({ userId: uid, language: val })
                }
              }}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
            <span className="text-sm text-slate-500">{t('settings.languageSavedNotice') || 'Saved to your browser'}</span>
          </div>
        </section>

        {/* Workspace */}
        <section className="border border-slate-200 rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-medium text-slate-900">{t('settings.workspace') || 'Workspace'}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">{t('settings.workspaceName') || 'Company/Workspace name'}</label>
              <input value={companyName} onChange={e=>setCompanyName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300" placeholder="TheGridHub" />
            </div>
          </div>
          <div>
            <button
              onClick={async ()=>{
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const userRow = await supabase.from('users').select('id').eq('supabaseId', user.id).maybeSingle()
                const uid = userRow.data?.id
                if (!uid) return
                const existing = await supabase.from('user_onboarding').select('id').eq('userId', uid).maybeSingle()
                if (existing.data) {
                  await supabase.from('user_onboarding').update({ companyName }).eq('userId', uid)
                } else {
                  await supabase.from('user_onboarding').insert({ userId: uid, companyName })
                }
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >{t('settings.workspace.save') || t('common.save') || 'Save'}</button>
          </div>
        </section>

        {/* Integrations quick links */}
        <section className="border border-slate-200 rounded-xl p-4">
          <h2 className="text-lg font-medium text-slate-900 mb-2">{t('settings.integrations') || 'Integrations'}</h2>
          <div className="text-slate-600 text-sm">{t('settings.integrations.description') || 'Connect Slack, Google Workspace, Microsoft 365, and Jira.'}</div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <a href="/dashboard/projects" className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">{t('projects.title') || 'Projects'}</a>
            <a href="/dashboard/settings/integrations/jira" className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Jira</a>
          </div>
        </section>
      </div>
    </div>
  )
}


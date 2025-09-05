"use client"

export const dynamic = 'force-dynamic'

import { useI18n } from '@/components/i18n/I18nProvider'

export default function BillingSettingsPage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">{t('settings.billing.title') || 'Billing'}</h1>
          {require('@/components/common/SettingsTabs').default()}
        </div>
        <p className="text-slate-600">{t('settings.billing.subtitle') || 'Manage your subscription and payment methods.'}</p>
        <a href="/billing" className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">{t('settings.billing.open') || 'Open Billing'}</a>
      </div>
    </div>
  )
}


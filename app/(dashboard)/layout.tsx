import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import I18nProvider from '@/components/i18n/I18nProvider'

import SkipToContent from '@/components/common/SkipToContent'
import LanguageSwitcher from '@/components/common/LanguageSwitcher'
import AdminSchemaBanner from '@/components/common/AdminSchemaBanner'
import ErrorReporter from '@/components/common/ErrorReporter'
import DevA11y from '@/components/dev/DevA11y'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user->onboarding language
  let initialLocale: any = 'en'
  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()
    const uid = userRow?.id
    if (uid) {
      const { data: onboard } = await supabase
        .from('user_onboarding')
        .select('language')
        .eq('userId', uid)
        .maybeSingle()
      if (onboard?.language) initialLocale = onboard.language
    }
  } catch {}

  return (
    <I18nProvider initialLocale={initialLocale}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
        {/* Animated background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          <SkipToContent />
          {/* Simple top bar with language switcher */}
          <div className="flex items-center justify-end px-4 pt-4">
            <div className="bg-white/70 backdrop-blur rounded-lg border border-gray-200 px-3 py-2">
              <LanguageSwitcher />
            </div>
          </div>
          <AdminSchemaBanner />
          <ErrorReporter />
          <DevA11y />
          <main id="main-content">
            {children}
          </main>
        </div>
      </div>
    </I18nProvider>
  )
}

"use client"

import { useI18n } from '@/components/i18n/I18nProvider'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <select
        className="px-2 py-1 text-sm rounded-md border border-gray-300 bg-white"
        value={locale}
        onChange={(e)=>setLocale(e.target.value as any)}
      >
        <option value="en">EN</option>
        <option value="fr">FR</option>
        <option value="es">ES</option>
        <option value="de">DE</option>
      </select>
    </div>
  )
}

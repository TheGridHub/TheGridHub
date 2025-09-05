"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Locale = 'en' | 'fr' | 'es' | 'de'

type I18nContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

import en from '@/i18n/en.json'
import fr from '@/i18n/fr.json'
import es from '@/i18n/es.json'
import de from '@/i18n/de.json'

type Messages = Record<string, any>
const catalogs: Record<Locale, Messages> = { en, fr, es, de }

export default function I18nProvider({ children, initialLocale }: { children: React.ReactNode, initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || 'en')

  useEffect(() => {
    if (!initialLocale) {
      const stored = (typeof window !== 'undefined' && (localStorage.getItem('lang') as Locale)) || 'en'
      setLocaleState(stored)
    }
  }, [initialLocale])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem('lang', l) } catch {}
    try { document.cookie = `lang=${l}; path=/; max-age=31536000` } catch {}
  }

  const t = (key: string, params?: Record<string, string | number>) => {
    const dict = catalogs[locale] || catalogs.en
    const fallback = catalogs.en
    const resolve = (obj: any, path: string) => {
      return path.split('.').reduce((acc: any, k: string) => (acc != null ? acc[k] : undefined), obj)
    }
    let msg: any = resolve(dict, key)
    if (msg === undefined) msg = resolve(fallback, key)
    if (typeof msg !== 'string') msg = msg ?? key
    if (params) {
      msg = msg.replace(/\{(\w+)\}/g, (_m: string, p1: string) => String(params[p1] ?? `{${p1}}`))
    }
    return msg
  }

  const value = useMemo(() => ({ locale, setLocale, t }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}


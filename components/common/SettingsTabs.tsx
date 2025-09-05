"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/components/i18n/I18nProvider"

export default function SettingsTabs() {
  const pathname = usePathname()
  const { t } = useI18n()

  const tabs = [
    { href: "/dashboard/settings/profile", label: t("settings.tabs.profile") || "Profile" },
    { href: "/dashboard/settings/billing", label: t("settings.tabs.billing") || "Billing" },
    { href: "/dashboard/settings/integrations", label: t("settings.tabs.integrations") || "Integrations" },
    { href: "/dashboard/settings/notifications", label: t("settings.tabs.notifications") || "Notifications" },
    { href: "/dashboard/settings/security-sessions", label: t("settings.tabs.securitySessions") || "Security sessions" },
  ]

  return (
    <nav aria-label="Settings" className="flex gap-2 flex-wrap" role="navigation">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1.5 rounded-lg border text-sm ${
              active
                ? "border-purple-300 bg-purple-50 text-purple-900"
                : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}


"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import {
  Gauge,
  Bell,
  StickyNote,
  CheckSquare,
  Mail,
  Calendar,
  BarChart3,
  Contact,
  Briefcase,
  Grid,
  Settings,
} from 'lucide-react'

const primary = [
  { label: 'Dashboard', href: '/dashboard', Icon: Gauge },
  { label: 'Notifications', href: '/dashboard/notifications', Icon: Bell },
  { label: 'Notes', href: '/dashboard/notes', Icon: StickyNote },
  { label: 'Tasks', href: '/dashboard/tasks', Icon: CheckSquare },
  { label: 'Emails', href: '/dashboard/emails', Icon: Mail },
  { label: 'Calendars', href: '/dashboard/calendars', Icon: Calendar },
]

const database = [
  { label: 'Analytics', href: '/dashboard/analytics', Icon: BarChart3 },
  { label: 'Contacts', href: '/dashboard/contacts', Icon: Contact },
  { label: 'Companies', href: '/dashboard/companies', Icon: Briefcase },
]

const tools = [
  { label: 'Integrations', href: '/dashboard/integrations', Icon: Grid },
  { label: 'Settings', href: '/dashboard/settings', Icon: Settings },
  { label: 'Billing', href: '/dashboard/billing', Icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const NavSection = ({ title, items }: { title?: string; items: typeof primary }) => (
    <div className="px-3 py-2">
      {title && (
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          {title}
        </div>
      )}
      <div className="space-y-1">
        {items.map(({ label, href, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-gray-200 bg-white hidden md:flex md:flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="text-xl font-semibold">TheGridHub</div>
            <div className="text-xs text-gray-500">Team Collaboration</div>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <NavSection items={primary} />
            <div className="px-3"><div className="h-px w-full bg-gray-200" /></div>
            <NavSection title="Database" items={database} />
            <div className="px-3"><div className="h-px w-full bg-gray-200" /></div>
            <NavSection items={tools} />
          </nav>

          {/* Workspace selector */}
          <div className="p-3 border-t border-gray-200">
            <button className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50">
              <span className="flex items-center gap-2">
                <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-gray-800 text-white text-xs">M</span>
                Marketing Team’s
              </span>
              <span className="text-gray-400">▾</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

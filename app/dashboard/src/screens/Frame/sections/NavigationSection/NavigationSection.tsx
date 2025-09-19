import {
  BellIcon,
  Building2Icon,
  CalendarIcon,
  ChartPieIcon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronsUpDownIcon,
  ClipboardListIcon,
  FileTextIcon,
  FolderIcon,
  GridIcon,
  HelpCircleIcon,
  MailIcon,
  PlusIcon,
  SettingsIcon,
  TargetIcon,
  TimerIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Link from 'next/link'
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import { createClient } from '@/lib/supabase/client'
import { getProfileClient } from '@/lib/profile.client'

const mainNavItems = [
  {
    icon: ChartPieIcon,
    label: "Dashboard",
    isActive: true,
    hasDropdown: false,
    hasAction: false,
  },
  {
    icon: ClipboardListIcon,
    label: "My Tasks",
    isActive: false,
    hasDropdown: false,
    hasAction: false,
  },
  {
    icon: FolderIcon,
    label: "Projects",
    isActive: false,
    hasDropdown: false,
    hasAction: true,
    actionIcon: PlusIcon,
  },
  {
    icon: TargetIcon,
    label: "Goals",
    isActive: false,
    hasDropdown: false,
    hasAction: false,
  },
  {
    icon: CalendarIcon,
    label: "Calendar",
    isActive: false,
    hasDropdown: false,
    hasAction: false,
  },
  {
    icon: UsersIcon,
    label: "Team",
    isActive: false,
    hasDropdown: false,
    hasAction: true,
    actionText: "Invite +",
  },
];

const productivityNavItems = [
  {
    icon: TimerIcon,
    label: "Time Tracker",
    isActive: false,
  },
  {
    icon: TrendingUpIcon,
    label: "Reports",
    isActive: false,
  },
  {
    icon: FileTextIcon,
    label: "Notes",
    isActive: false,
  },
  {
    icon: FolderIcon,
    label: "Files",
    isActive: false,
  },
];

const bottomNavItems = [
  {
    icon: GridIcon,
    label: "Integrations",
    isActive: false,
  },
  {
    icon: SettingsIcon,
    label: "Settings",
    isActive: false,
  },
  {
    icon: HelpCircleIcon,
    label: "Help",
    isActive: false,
  },
];

interface NavigationSectionProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onMobileToggle: () => void;
}

export const NavigationSection = ({ isCollapsed, onToggle, isMobile, onMobileToggle }: NavigationSectionProps): JSX.Element => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const supabase = useMemo(() => createClient(), [])
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)
  const [plan, setPlan] = useState<'free'|'pro'|'unknown'>('unknown')

  useEffect(() => {
    (async () => {
      const { profile } = await getProfileClient()
      setWorkspaceName(profile?.team_name ?? null)
      setPlan((profile?.plan as any) || 'free')
    })()
  }, [])

  const navHref = (label: string) => {
    switch (label) {
      case 'Dashboard': return '/dashboard'
      case 'My Tasks': return '/dashboard/tasks'
      case 'Projects': return '/dashboard/projects'
      case 'Goals': return '/dashboard/analytics'
      case 'Calendar': return '/dashboard/calendars'
      case 'Team': return '/dashboard/teams'
      case 'Integrations': return '/dashboard/integrations'
      case 'Settings': return '/dashboard/settings'
      case 'Help': return '/help'
      default: return '/dashboard'
    }
  }

  if (isCollapsed) {
    return null;
  }

  return (
    <nav className="flex flex-col w-[250px] h-full lg:h-screen bg-[#f9f9f9] border-r border-[#e4e4e4] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:0ms] overflow-y-auto">
      <div className="flex flex-col items-start gap-5 w-full flex-1">
        {/* Header */}
        <header className="flex h-[72px] items-center gap-2.5 px-7 py-5 w-full border-b border-[#e4e4e4]">
          <span className="font-heading-desktop-h6 font-[number:var(--heading-desktop-h6-font-weight)] text-black text-[length:var(--heading-desktop-h6-font-size)] tracking-[var(--heading-desktop-h6-letter-spacing)] leading-[var(--heading-desktop-h6-line-height)] [font-style:var(--heading-desktop-h6-font-style)]">
            TheGridHub
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="w-7 h-7 p-0 bg-[#f1f1f1] hover:bg-[#e4e4e4] rounded-sm ml-auto"
            onClick={isMobile ? onMobileToggle : onToggle}
          >
            <ChevronsLeftIcon className="w-5 h-5" />
          </Button>
        </header>

        <div className="flex flex-col items-start gap-5 w-full">
          {/* Main Navigation */}
          <div className="flex flex-col items-start gap-1 px-4 py-0 w-full">
            {mainNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = item.label === activeItem;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between w-full"
                >
                  <Link href={navHref(item.label)} className="flex-1">
                    <Button
                      variant="ghost"
                      className={`flex h-9 w-full items-center justify-start p-2 rounded hover:bg-[#e4e4e4] transition-colors ${
                        isActive ? "bg-[#f1f1f1]" : ""
                      } translate-y-[-1rem] animate-fade-in opacity-0`}
                      style={{ "--animation-delay": `${(index + 1) * 100}ms` } as React.CSSProperties}
                      onClick={() => handleNavClick(item.label)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span
                          className={`font-body-base-medium font-[number:var(--body-base-medium-font-weight)] text-[length:var(--body-base-medium-font-size)] tracking-[var(--body-base-medium-letter-spacing)] leading-[var(--body-base-medium-line-height)] [font-style:var(--body-base-medium-font-style)] ${
                            isActive ? "text-black" : "text-[#717171]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </Button>
                  </Link>
                  {item.hasAction && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1 text-xs text-[#717171] hover:bg-[#e4e4e4] ml-1"
                    >
                      {item.actionText ? (
                        item.actionText
                      ) : (
                        <PlusIcon className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <Separator className="w-full h-px bg-[#e4e4e4]" />

          {/* Productivity Section */}
          <div className="flex flex-col items-start gap-[5px] px-4 py-0 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:700ms]">
            <div className="flex items-center gap-3 px-2 py-1 w-full">
              <span className="font-body-small-medium font-[number:var(--body-small-medium-font-weight)] text-[#717171] text-[length:var(--body-small-medium-font-size)] tracking-[var(--body-small-medium-letter-spacing)] leading-[var(--body-small-medium-line-height)] [font-style:var(--body-small-medium-font-style)]">
                PRODUCTIVITY
              </span>
            </div>

            <div className="flex flex-col items-start gap-1 w-full">
              {productivityNavItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = item.label === activeItem;

                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className={`flex h-9 w-full items-center justify-start p-2 rounded hover:bg-[#e4e4e4] transition-colors ${
                      isActive ? "bg-[#f1f1f1]" : ""
                    } translate-y-[-1rem] animate-fade-in opacity-0`}
                    style={
                      {
                        "--animation-delay": `${800 + index * 100}ms`,
                      } as React.CSSProperties
                    }
                    onClick={() => handleNavClick(item.label)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span
                        className={`font-body-base-medium font-[number:var(--body-base-medium-font-weight)] text-[length:var(--body-base-medium-font-size)] tracking-[var(--body-base-medium-letter-spacing)] leading-[var(--body-base-medium-line-height)] [font-style:var(--body-base-medium-font-style)] ${
                          isActive ? "text-black" : "text-[#717171]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator className="w-full h-px bg-[#e4e4e4]" />

          {/* Bottom Navigation */}
          <div className="flex flex-col items-start px-4 py-0 w-full translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1100ms]">
            <div className="flex flex-col items-start gap-2 w-full">
              {bottomNavItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = item.label === activeItem;

                return (
                  <Link href={navHref(item.label)} className="w-full">
                    <Button
                      key={item.label}
                      variant="ghost"
                      className={`flex h-9 w-full items-center justify-start p-2 rounded hover:bg-[#e4e4e4] transition-colors ${
                        isActive ? "bg-[#f1f1f1]" : ""
                      } translate-y-[-1rem] animate-fade-in opacity-0`}
                      style={{ "--animation-delay": `${1200 + index * 100}ms` } as React.CSSProperties}
                      onClick={() => handleNavClick(item.label)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span
                          className={`font-body-base-medium font-[number:var(--body-base-medium-font-weight)] text-[length:var(--body-base-medium-font-size)] tracking-[var(--body-base-medium-letter-spacing)] leading-[var(--body-base-medium-line-height)] [font-style:var(--body-base-medium-font-style)] ${
                            isActive ? "text-black" : "text-[#717171]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-start gap-3 px-4 py-5 w-full border-t border-[#e4e4e4] translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:1400ms] mt-auto">
        {/* Workspace Selector */}
        <Link href="/dashboard/settings" className="w-full">
          <Button
            variant="ghost"
            className="flex items-center justify-between px-3 py-2 w-full h-auto border border-[#e4e4e4] rounded hover:bg-[#e4e4e4]"
          >
            <span className="font-body-base-medium font-[number:var(--body-base-medium-font-weight)] text-black text-[length:var(--body-base-medium-font-size)] tracking-[var(--body-base-medium-letter-spacing)] leading-[var(--body-base-medium-line-height)] [font-style:var(--body-base-medium-font-style)]">
              {workspaceName || 'Set your workspace name'}
            </span>
            <ChevronDownIcon className="w-4 h-4" />
          </Button>
        </Link>

        {/* Plan action */}
        {plan === 'pro' ? (
          <button
            onClick={async()=>{ const r=await fetch('/api/stripe/billing-portal', { method:'POST' }); const j=await r.json(); if (j.url) window.location.href=j.url; }}
            className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 h-auto py-2 rounded"
          >
            Manage Subscription
          </button>
        ) : (
          <button
onClick={async()=>{ const r=await fetch('/api/stripe/create-checkout-session',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ interval:'monthly', currency: (window as any).__selectedCurrency })}); const j=await r.json(); if (j.url) window.location.href=j.url; }}
            className="w-full bg-black text-white hover:bg-black/90 h-auto py-2 rounded"
          >
            Upgrade to Pro
          </button>
        )}
      </div>
    </nav>
  );
};

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Minimal check-limit endpoint used by components/plan-enforcement.tsx
// Actions supported: create_project, create_task, invite_member, use_ai, upload_file

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ allowed: false, reason: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const action: string = body.action
    const fileSize: number | undefined = body.fileSize

    // Read plan from profiles (fallback to FREE if missing)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, onboarding_complete, subscription_status')
      .eq('user_id', user.id)
      .maybeSingle()

    const plan = (profile?.plan || 'free').toUpperCase()

    // Limits per your spec
    const LIMITS = {
      FREE: {
        maxProjects: 5,
        maxTeamMembers: 10,
        aiSuggestions: 10, // per day (UI will enforce daily; here we only gate count when provided)
        storageMB: 1024,
      },
      PRO: {
        maxProjects: -1,
        maxTeamMembers: -1,
        aiSuggestions: -1,
        storageMB: -1,
      }
    } as const

    const limits = (LIMITS as any)[plan] || LIMITS.FREE

    // Current usage
    const [projectsCountRes, membersCountRes] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('userId', user.id),
      supabase.from('team_memberships').select('id', { count: 'exact', head: true }).eq('userId', user.id),
    ])

    // Storage usage from project_files via RPC
    let storageMB = 0
    try {
      const rpc = await supabase.rpc('user_storage_mb', { uid: user.id }) as any
      storageMB = (rpc.data as any) || 0
    } catch {}

    const usage = {
      projects: projectsCountRes.count || 0,
      teamMembers: membersCountRes.count || 0,
      aiSuggestions: 0,
      storageMB,
    }

    function deny(reason: string) {
      return NextResponse.json({ allowed: false, reason, upgradeRequired: 'PRO' }, { status: 200 })
    }

    switch (action) {
      case 'create_project': {
        if (limits.maxProjects !== -1 && usage.projects >= limits.maxProjects) {
          return deny(`You've reached your project limit (${limits.maxProjects}).`)
        }
        break
      }
      case 'invite_member': {
        if (limits.maxTeamMembers !== -1 && usage.teamMembers >= limits.maxTeamMembers) {
          return deny(`You've reached your team member limit (${limits.maxTeamMembers}).`)
        }
        break
      }
      case 'use_ai': {
        if (limits.aiSuggestions !== -1 && usage.aiSuggestions >= limits.aiSuggestions) {
          return deny(`You've reached your AI suggestions limit (${limits.aiSuggestions}/day).`)
        }
        break
      }
      case 'upload_file': {
        if (fileSize && limits.storageMB !== -1) {
          const sizeMB = fileSize / 1024 / 1024
          if (usage.storageMB + sizeMB > limits.storageMB) {
            return deny(`This would exceed your storage limit (${limits.storageMB} MB).`)
          }
        }
        break
      }
      default:
        // If unknown action, allow by default but return info
        return NextResponse.json({ allowed: true, note: 'Unknown action treated as allowed' })
    }

    return NextResponse.json({ allowed: true })
  } catch (e: any) {
    return NextResponse.json({ allowed: false, reason: e?.message || 'Internal error' }, { status: 500 })
  }
}

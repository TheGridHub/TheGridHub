import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get current usage stats
    const { data: usageData, error: usageError } = await supabase
      .rpc('get_usage_stats', {
        p_user_id: user.id,
        p_workspace_id: null
      })
      
    if (usageError) {
      console.error('Error fetching usage stats:', usageError)
      return NextResponse.json({ error: usageError.message }, { status: 500 })
    }

    // Get user's plan type
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('plan_type, workspace_id')
      .eq('user_id', user.id)
      .single()
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const isFreePlan = profile?.plan_type === 'free' || !profile?.plan_type

    // Format usage data for billing display
    const usage = {
      aiRequests: {
        used: usageData.ai_requests_count || 0,
        limit: -1, // Unlimited for all users now
        percentage: 0 // Always 0% since unlimited
      },
      storage: {
        used: Math.round(((usageData.storage_used || 0) / (1024 * 1024 * 1024)) * 100) / 100, // Convert to GB
        limit: isFreePlan ? 1 : 100,
        percentage: isFreePlan 
          ? Math.min(((usageData.storage_used || 0) / (1024 * 1024 * 1024)) * 100, 100)
          : Math.min(((usageData.storage_used || 0) / (107374182400)) * 100, 100) // 100GB limit for pro
      },
      projects: {
        used: usageData.projects_count || 0,
        limit: isFreePlan ? 5 : -1,
        percentage: isFreePlan 
          ? Math.min(((usageData.projects_count || 0) / 5) * 100, 100)
          : 0 // 0% since unlimited for pro
      },
      contacts: {
        used: usageData.contacts_count || 0,
        limit: isFreePlan ? 100 : -1,
        percentage: isFreePlan 
          ? Math.min(((usageData.contacts_count || 0) / 100) * 100, 100)
          : 0 // 0% since unlimited for pro
      },
      teamMembers: {
        used: 1, // TODO: Get actual team member count
        limit: isFreePlan ? 3 : -1,
        percentage: isFreePlan ? (1 / 3) * 100 : 0
      },
      integrations: {
        used: 0, // TODO: Get actual integrations count
        limit: isFreePlan ? 3 : -1,
        percentage: 0
      }
    }

    // Calculate warnings for users approaching limits
    const warnings = []
    
    if (isFreePlan) {
      if (usage.storage.percentage >= 80) {
        warnings.push({
          type: 'storage',
          message: `You're using ${usage.storage.used}GB of your ${usage.storage.limit}GB storage limit`,
          percentage: usage.storage.percentage
        })
      }
      
      if (usage.projects.percentage >= 80) {
        warnings.push({
          type: 'projects',
          message: `You're using ${usage.projects.used} of your ${usage.projects.limit} project limit`,
          percentage: usage.projects.percentage
        })
      }
      
      if (usage.contacts.percentage >= 80) {
        warnings.push({
          type: 'contacts', 
          message: `You're using ${usage.contacts.used} of your ${usage.contacts.limit} contact limit`,
          percentage: usage.contacts.percentage
        })
      }
    }

    return NextResponse.json({
      usage,
      warnings,
      planType: profile?.plan_type || 'free',
      calculatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Billing usage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

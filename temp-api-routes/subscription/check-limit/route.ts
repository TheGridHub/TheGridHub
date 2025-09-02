import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { SubscriptionManager } from '@/lib/subscription-logic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { action, ...additionalData } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Map action names to valid action types
    const actionMap: Record<string, 'create_project' | 'create_task' | 'invite_member' | 'use_ai' | 'upload_file'> = {
      'create_project': 'create_project',
      'create_task': 'create_task', 
      'invite_member': 'invite_member',
      'use_ai': 'use_ai',
      'upload_file': 'upload_file'
    }

    const validAction = actionMap[action]
    
    if (!validAction) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const result = await SubscriptionManager.canPerformAction(
      userId,
      validAction,
      additionalData
    )

    return NextResponse.json(result)

  } catch (error) {
    console.error('Subscription limit check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for checking feature availability
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const feature = searchParams.get('feature')

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature parameter is required' },
        { status: 400 }
      )
    }

    const hasFeature = await SubscriptionManager.hasFeature(userId, feature)
    const plan = await SubscriptionManager.getUserPlan(userId)
    const usage = await SubscriptionManager.getUserUsage(userId)

    return NextResponse.json({
      hasFeature,
      plan,
      usage
    })

  } catch (error) {
    console.error('Feature check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

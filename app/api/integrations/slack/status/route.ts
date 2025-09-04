import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/user';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(supabaseUser);
    
    // Check if user has Slack integration connected
    const integration = await prisma.integration.findFirst({
      where: {
        userId: user.id,
        provider: 'slack',
        active: true
      }
    });

    return NextResponse.json({
      connected: !!integration,
      workspace: integration?.metadata?.workspace_name || null
    });
  } catch (error) {
    console.error('Error checking Slack status:', error);
    return NextResponse.json(
      { error: 'Failed to check Slack status' },
      { status: 500 }
    );
  }
}
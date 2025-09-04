import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/user';
import prisma from '@/lib/prisma';
import { getSlackChannels } from '@/lib/integrations/slack';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(supabaseUser);
    
    // Get user's Slack integration
    const integration = await prisma.integration.findFirst({
      where: {
        userId: user.id,
        provider: 'slack',
        active: true
      }
    });

    if (!integration) {
      return NextResponse.json({ 
        channels: [],
        error: 'Slack not connected' 
      }, { status: 200 });
    }

    // Fetch channels from Slack
    const channels = await getSlackChannels(integration.accessToken);

    return NextResponse.json({
      channels: channels || []
    });
  } catch (error) {
    console.error('Error fetching Slack channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Slack channels' },
      { status: 500 }
    );
  }
}
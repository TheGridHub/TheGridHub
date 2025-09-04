import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/user';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(supabaseUser);
    
    // Check if user has Slack integration connected
    const supa = createClient();
    const { data: integration } = await supa
      .from('integrations')
      .select('*, features')
      .eq('userId', user.id)
      .eq('type', 'slack')
      .eq('status', 'connected')
      .maybeSingle()

    return NextResponse.json({
      connected: !!integration,
      workspace: (integration as any)?.metadata?.workspace_name || null
    });
  } catch (error) {
    console.error('Error checking Slack status:', error);
    return NextResponse.json(
      { error: 'Failed to check Slack status' },
      { status: 500 }
    );
  }
}
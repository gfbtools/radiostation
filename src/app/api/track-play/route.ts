import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { setId, playedSeconds } = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    
    // Get IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || null
    const userAgent = request.headers.get('user-agent') || null

    // Insert play count record
    await supabase.from('play_counts' as any).insert({
      set_id: setId,
      user_id: user?.id || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      played_seconds: playedSeconds,
    } as any)

    // Increment play count on the set
    await supabase.rpc('increment_play_count' as any, { set_id: setId } as any)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track play error:', error)
    return NextResponse.json({ error: 'Failed to track play' }, { status: 500 })
  }
}

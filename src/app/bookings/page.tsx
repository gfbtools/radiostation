import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookingStatus, EVENT_TYPE_LABELS, BUDGET_LABELS, EventType, BudgetRange } from '@/lib/types'
import { InboxTabs } from './inbox-tabs'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Requests coming IN to this DJ
  const { data: incoming } = await supabase
    .from('booking_requests' as any)
    .select('*, requester:requester_id(id, handle, display_name, avatar_url)')
    .eq('dj_id', user.id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  // Requests this user has SENT
  const { data: sent } = await supabase
    .from('booking_requests' as any)
    .select('*, dj:dj_id(id, handle, display_name, avatar_url)')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const pendingCount = incoming?.filter(r => r.status === 'pending').length || 0

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        {pendingCount > 0 && (
          <p className="text-sm text-indigo-600 mt-1 font-medium">
            {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} waiting for your response
          </p>
        )}
      </div>

      <InboxTabs incoming={incoming || []} sent={sent || []} currentUserId={user.id} />
    </div>
  )
}

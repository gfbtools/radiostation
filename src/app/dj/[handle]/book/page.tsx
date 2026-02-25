import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BookingRequestForm } from './booking-request-form'

interface BookDJPageProps {
  params: { handle: string }
}

export default async function BookDJPage({ params }: BookDJPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=/dj/${params.handle}/book`)

  const { data: dj } = await supabase
    .from('profiles' as any)
    .select('id, handle, display_name, avatar_url, open_to_bookings, booking_note')
    .eq('handle', params.handle.toLowerCase())
    .single() as { data: any }

  if (!dj) notFound()

  // Can't book yourself
  if (dj.id === user.id) redirect(`/dj/${params.handle}`)

  const { data: requester } = await supabase
    .from('profiles' as any)
    .select('id, handle, display_name')
    .eq('id', user.id)
    .single() as { data: any }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* DJ info header */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0">
          {dj.avatar_url ? (
            <img src={dj.avatar_url} alt={dj.display_name || dj.handle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Book {dj.display_name || dj.handle}
          </h1>
          <p className="text-sm text-gray-500">@{dj.handle}</p>
          {dj.booking_note && (
            <p className="text-sm text-indigo-600 mt-1 italic">"{dj.booking_note}"</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Booking Inquiry</h2>
        <p className="text-sm text-gray-500 mb-6">
          Fill in your event details. The DJ will receive your message and can accept or decline.
          Your contact info is only revealed if they accept.
        </p>
        <BookingRequestForm djId={dj.id} requesterId={user.id} djHandle={dj.handle} />
      </div>
    </div>
  )
}

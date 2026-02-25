'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EVENT_TYPE_LABELS, BUDGET_LABELS } from '@/lib/types'

interface BookingRequestFormProps {
  djId: string
  requesterId: string
  djHandle: string
}

export function BookingRequestForm({ djId, requesterId, djHandle }: BookingRequestFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const inputClass = "block w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)

    const data = {
      dj_id: djId,
      requester_id: requesterId,
      event_name: fd.get('event_name') as string,
      event_date: fd.get('event_date') as string,
      event_type: fd.get('event_type') as string,
      venue_name: fd.get('venue_name') as string,
      city: fd.get('city') as string,
      country: fd.get('country') as string || null,
      budget: fd.get('budget') as string,
      guest_count: fd.get('guest_count') ? parseInt(fd.get('guest_count') as string) : null,
      message: fd.get('message') as string,
      contact_email: fd.get('contact_email') as string,
      contact_phone: fd.get('contact_phone') as string || null,
    }

    if ((data.message as string).length < 20) {
      setError('Please write a more detailed message (at least 20 characters).')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: err } = await supabase.from('booking_requests' as any).insert(data)

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Request sent!</h3>
        <p className="text-gray-600 text-sm mb-6">
          Your booking inquiry has been sent. You'll be notified when the DJ responds.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push(`/dj/${djHandle}`)}
            className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Back to profile
          </button>
          <button
            onClick={() => router.push('/bookings')}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            View my requests
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Event details */}
      <div className="pb-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Event Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event name *</label>
            <input name="event_name" type="text" required placeholder="e.g. New Year's Eve Party" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event type *</label>
              <select name="event_type" required defaultValue="club_night" className={inputClass}>
                {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input name="event_date" type="date" required min={new Date().toISOString().split('T')[0]} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
            <input name="venue_name" type="text" required placeholder="Venue or location name" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input name="city" type="text" required placeholder="Chicago" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input name="country" type="text" placeholder="United States" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget *</label>
              <select name="budget" required defaultValue="negotiable" className={inputClass}>
                {Object.entries(BUDGET_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected guests</label>
              <input name="guest_count" type="number" min="1" placeholder="200" className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="pb-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Your Message</h3>
        <textarea
          name="message"
          rows={4}
          required
          minLength={20}
          placeholder="Tell the DJ about your event, vibe you're going for, any special requirements, set length, etc."
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">Minimum 20 characters. Be specific — detailed requests get faster responses.</p>
      </div>

      {/* Contact info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Contact Information</h3>
        <p className="text-xs text-gray-400 mb-4">Only shared with the DJ if they accept your request.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input name="contact_email" type="email" required placeholder="you@example.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="contact_phone" type="tel" placeholder="+1 555 000 0000" className={inputClass} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Booking Request'}
        </button>
      </div>
    </form>
  )
}

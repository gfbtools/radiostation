'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EVENT_TYPE_LABELS } from '@/lib/types'

interface GigFormProps {
  djId: string
  handle: string
  gig?: any // for edit mode
}

export function GigForm({ djId, handle, gig }: GigFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Default event_date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(22, 0, 0, 0)
  const defaultDate = tomorrow.toISOString().slice(0, 16)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const data = {
      dj_id: djId,
      title: fd.get('title') as string,
      venue_name: fd.get('venue_name') as string,
      city: fd.get('city') as string,
      country: fd.get('country') as string || null,
      event_date: new Date(fd.get('event_date') as string).toISOString(),
      event_type: fd.get('event_type') as string,
      description: fd.get('description') as string || null,
      ticket_url: fd.get('ticket_url') as string || null,
      is_public: true,
    }

    const supabase = createClient()

    if (gig) {
      const { error: err } = await supabase.from('gigs' as any).update(data).eq('id', gig.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from('gigs' as any).insert(data)
      if (err) { setError(err.message); setLoading(false); return }
    }

    router.push(`/dj/${handle}`)
    router.refresh()
  }

  const inputClass = "block w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event name *</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={gig?.title}
          placeholder="e.g. Saturday Night Sessions"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event type *</label>
          <select name="event_type" required defaultValue={gig?.event_type || 'club_night'} className={inputClass}>
            {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date & time *</label>
          <input
            name="event_date"
            type="datetime-local"
            required
            defaultValue={gig ? new Date(gig.event_date).toISOString().slice(0, 16) : defaultDate}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
        <input
          name="venue_name"
          type="text"
          required
          defaultValue={gig?.venue_name}
          placeholder="Venue name"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            name="city"
            type="text"
            required
            defaultValue={gig?.city}
            placeholder="Chicago"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            name="country"
            type="text"
            defaultValue={gig?.country}
            placeholder="United States"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={gig?.description}
          placeholder="Tell people about the event, lineup, vibe..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ticket link</label>
        <input
          name="ticket_url"
          type="url"
          defaultValue={gig?.ticket_url}
          placeholder="https://ra.co/events/..."
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : gig ? 'Update Gig' : 'Post Gig'}
        </button>
      </div>
    </form>
  )
}

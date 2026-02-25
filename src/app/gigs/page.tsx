import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { EVENT_TYPE_LABELS, EventType } from '@/lib/types'
import { GigFilters } from './gig-filters'

interface GigsPageProps {
  searchParams: { city?: string; type?: string }
}

export default async function GigsPage({ searchParams }: GigsPageProps) {
  const supabase = await createClient()

  const { data: gigs } = await supabase.rpc('get_upcoming_gigs' as any, {
    city_filter: searchParams.city || null,
    event_type_filter: searchParams.type || null,
    limit_count: 30,
    offset_count: 0,
  } as any) as { data: any[] | null }

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Gigs</h1>
          <p className="text-gray-600 mt-1">Find DJ events happening near you</p>
        </div>
        {user && (
          <Link
            href="/gigs/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post a Gig
          </Link>
        )}
      </div>

      <GigFilters current={searchParams} />

      {gigs && gigs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gigs.map((gig) => (
            <GigCard key={gig.gig_id} gig={gig} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No upcoming gigs found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchParams.city ? `Try a different city or ` : ''}
            <Link href="/gigs" className="text-indigo-600 hover:underline">clear filters</Link>
          </p>
          {user && (
            <Link href="/gigs/new" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
              Be the first to post a gig →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function GigCard({ gig }: { gig: any }) {
  const eventDate = new Date(gig.event_date)
  const isPast = eventDate < new Date()

  const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = eventDate.getDate()
  const time = eventDate.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const weekday = eventDate.toLocaleString('en-US', { weekday: 'long' })

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow ${isPast ? 'opacity-60' : ''}`}>
      {/* Flyer or gradient header */}
      <div className="relative h-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {gig.flyer_url && (
          <Image src={gig.flyer_url} alt={gig.title} fill className="object-cover" />
        )}
        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-white rounded-lg shadow-md text-center w-12 overflow-hidden">
          <div className="bg-indigo-600 text-white text-xs font-bold py-1 px-1">{month}</div>
          <div className="text-gray-900 font-bold text-lg py-1">{day}</div>
        </div>
        {/* Event type badge */}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {EVENT_TYPE_LABELS[gig.event_type as EventType]}
        </div>
        {/* DJ avatar */}
        <div className="absolute bottom-3 right-3">
          <Link href={`/dj/${gig.handle}`}>
            <div className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-indigo-200 shadow">
              {gig.avatar_url ? (
                <Image src={gig.avatar_url} alt={gig.display_name || gig.handle} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{gig.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{gig.venue_name}</p>

        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {gig.city}{gig.country ? `, ${gig.country}` : ''}
        </div>

        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {weekday} at {time}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <Link
            href={`/dj/${gig.handle}`}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {gig.display_name || gig.handle}
          </Link>
          {gig.ticket_url && (
            <a
              href={gig.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              Tickets ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

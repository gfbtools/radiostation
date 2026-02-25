import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'
import { DJFilters } from './dj-filters'

interface DJsPageProps {
  searchParams: { genre?: string; city?: string; country?: string; bookable?: string }
}

export default async function DJsPage({ searchParams }: DJsPageProps) {
  const supabase = await createClient()

  const { data: genres } = await supabase.from('genres' as any).select('*').order('name')

  let djsData = await supabase.rpc('discover_djs' as any, {
    genre_filter: searchParams.genre || null,
    city_filter: searchParams.city || null,
    country_filter: searchParams.country || null,
    limit_count: 48,
    offset_count: 0,
  } as any) as { data: any[] | null }

  // Client-side filter for bookable since it's a simple boolean
  let djs = djsData.data
  if (searchParams.bookable === '1' && djs) {
    djs = djs.filter((d: any) => d.open_to_bookings)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover DJs</h1>
        <p className="text-gray-600 mt-2">Find DJs by genre, city, or vibe</p>
      </div>

      <DJFilters genres={genres || []} current={searchParams} />

      {djs && djs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {djs.map((dj) => (
            <DJCard key={dj.dj_id} dj={dj} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No DJs found with those filters.</p>
          <Link href="/djs" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
            Clear filters
          </Link>
        </div>
      )}
    </div>
  )
}

function DJCard({ dj }: { dj: any }) {
  return (
    <Link
      href={`/dj/${dj.handle}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      {/* Avatar */}
      <div className="relative h-32 bg-gradient-to-br from-indigo-500 to-purple-700">
        {dj.avatar_url && (
          <Image src={dj.avatar_url} alt={dj.display_name || dj.handle} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">
          {dj.display_name || dj.handle}
        </h3>
        <p className="text-sm text-gray-500">@{dj.handle}</p>

        {(dj.city || dj.country) && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {[dj.city, dj.country].filter(Boolean).join(', ')}
          </p>
        )}

        {dj.bio && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{dj.bio}</p>
        )}
        {dj.open_to_bookings && (
          <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            📅 Available to book
          </span>
        )}

        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>{formatNumber(dj.follower_count)} followers</span>
          <span>{formatNumber(dj.set_count)} mixes</span>
        </div>
      </div>
    </Link>
  )
}

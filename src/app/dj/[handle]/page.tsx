import { createClient } from '@/lib/supabase/server'
import { EVENT_TYPE_LABELS, EventType } from '@/lib/types'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { SetCard } from '@/components/set-card'
import { FollowButton } from '@/components/follow-button'
import { formatNumber } from '@/lib/utils'

interface DJProfilePageProps {
  params: { handle: string }
}

export default async function DJProfilePage({ params }: DJProfilePageProps) {
  const supabase = await createClient()
  const handle = params.handle.toLowerCase()

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('*')
    .eq('handle', handle)
    .single() as { data: any }

  if (!profile) {
    notFound()
  }

  const { data: sets } = await supabase
    .from('sets' as any)
    .select(`
      *,
      profiles:user_id (*)
    `)
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const { data: followersCount } = await supabase
    .from('follows' as any)
    .select('*', { count: 'exact' })
    .eq('following_id', profile.id) as { data: any[] | null }

  const { data: followingCount } = await supabase
    .from('follows' as any)
    .select('*', { count: 'exact' })
    .eq('follower_id', profile.id) as { data: any[] | null }

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileGenres } = await supabase
    .from('profile_genres' as any)
    .select('genres (*)')
    .eq('profile_id', profile.id) as { data: any[] | null }

  const profileGenreList = profileGenres?.map((pg: any) => pg.genres).filter(Boolean) || []
  const isOwnProfile = user?.id === profile.id

  // Gigs
  const { data: upcomingGigs } = await supabase
    .from('gigs' as any)
    .select('*')
    .eq('dj_id', profile.id)
    .eq('is_public', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(5) as { data: any[] | null }

  let isFollowing = false
  if (user && !isOwnProfile) {
    const { data } = await supabase.rpc('is_following' as any, {
      check_follower_id: user.id,
      check_following_id: profile.id,
    } as any) as { data: boolean | null }
    isFollowing = data || false
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name || profile.handle}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.display_name || profile.handle}
            </h1>
            <p className="text-gray-500">@{profile.handle}</p>
            
            {profile.bio && (
              <p className="mt-3 text-gray-700 max-w-2xl">{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
              {profile.location && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <Link 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-indigo-600 hover:text-indigo-700"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Website
                </Link>
              )}
              {profile.instagram_url && (
                <Link href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center text-pink-600 hover:text-pink-700">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  Instagram
                </Link>
              )}
              {profile.soundcloud_url && (
                <Link href={profile.soundcloud_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center text-orange-500 hover:text-orange-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1.175 12.225c-.015 0-.024.006-.034.018l-.006.026.445 2.832-.445 2.77c-.01.01-.019.017-.034.017-.014 0-.024-.007-.033-.017l-.385-2.77.385-2.832c.009-.012.019-.018.033-.018zm.887-.506c-.018 0-.031.009-.043.024l-.007.03.508 3.314-.508 3.19c-.012.016-.025.024-.043.024-.016 0-.029-.008-.04-.024l-.444-3.19.444-3.314c.011-.015.024-.024.04-.024zm.918-.135c-.02 0-.036.011-.047.03l-.007.033.569 3.449-.569 3.287c-.011.018-.027.029-.047.029-.019 0-.034-.011-.046-.029l-.497-3.287.497-3.449c.012-.019.027-.03.046-.03zm.925-.18c-.022 0-.04.013-.054.034l-.007.035.628 3.629-.628 3.38c-.014.021-.032.034-.054.034-.021 0-.039-.013-.053-.034l-.548-3.38.548-3.629c.014-.021.032-.034.053-.034zm5.586-3.888C7.574 7.516 6.249 9.015 6 10.869v6.45c0 .195.148.354.344.37h7.655c.196-.016.35-.175.35-.37V8.88C14.348 7.014 12.728 5.5 10.756 5.5c-.69 0-1.34.184-1.9.485z"/>
                  </svg>
                  SoundCloud
                </Link>
              )}
              {profile.twitter_url && (
                <Link href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-gray-900">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
                </Link>
              )}
              {profile.mixcloud_url && (
                <Link href={profile.mixcloud_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center text-indigo-500 hover:text-indigo-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.56 8.87V17h-1.7V8.87h1.7zM14 8l-1.26 1.26 1.26 1.26.63-.63L13.8 9.5l.83-.83L14 8zm2.43 2.09l-2.22 2.22.88.88L17.31 11l-1.26-1.26-.62.35zm1.27 2.56h-1.7v4.35h1.7v-4.35z"/>
                  </svg>
                  Mixcloud
                </Link>
              )}
            </div>

            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-900">{sets?.length || 0}</span>
                <span className="text-sm text-gray-500">Mixes</span>
              </div>
              <Link href={`/dj/${profile.handle}/followers`} className="text-center hover:opacity-80 transition-opacity">
                <span className="block text-2xl font-bold text-gray-900">{formatNumber(followersCount?.length || 0)}</span>
                <span className="text-sm text-gray-500">Followers</span>
              </Link>
              <Link href={`/dj/${profile.handle}/following`} className="text-center hover:opacity-80 transition-opacity">
                <span className="block text-2xl font-bold text-gray-900">{formatNumber(followingCount?.length || 0)}</span>
                <span className="text-sm text-gray-500">Following</span>
              </Link>
            </div>

            {/* Genre tags */}
            {profileGenreList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profileGenreList.map((genre: any) => (
                  <Link
                    key={genre.id}
                    href={`/djs?genre=${genre.id}`}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {isOwnProfile ? (
              <Link
                href="/profile"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-center"
              >
                Edit Profile
              </Link>
            ) : user ? (
              <>
                <FollowButton profileId={profile.id} initialIsFollowing={isFollowing} />
                {profile.open_to_bookings && (
                  <Link
                    href={`/dj/${profile.handle}/book`}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md text-center text-sm font-medium hover:bg-indigo-700"
                  >
                    📅 Book this DJ
                  </Link>
                )}
              </>
            ) : (
              profile.open_to_bookings ? (
                <Link
                  href={`/auth/login?next=/dj/${profile.handle}/book`}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md text-center text-sm font-medium hover:bg-indigo-700"
                >
                  📅 Book this DJ
                </Link>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Open to bookings badge */}
      {profile.open_to_bookings && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <p className="font-medium text-indigo-800 text-sm">Open to Bookings</p>
            {profile.booking_note && (
              <p className="text-indigo-600 text-sm mt-0.5">{profile.booking_note}</p>
            )}
          </div>
          {!isOwnProfile && user && (
            <Link
              href={`/dj/${profile.handle}/book`}
              className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Send Request
            </Link>
          )}
        </div>
      )}

      {/* Upcoming Gigs */}
      {upcomingGigs && upcomingGigs.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Gigs</h2>
            {isOwnProfile && (
              <Link href="/gigs/new" className="text-sm text-indigo-600 hover:text-indigo-700">
                + Add gig
              </Link>
            )}
          </div>
          <div className="space-y-3">
            {upcomingGigs.map((gig: any) => {
              const eventDate = new Date(gig.event_date)
              return (
                <div key={gig.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                  {/* Date block */}
                  <div className="text-center w-12 flex-shrink-0">
                    <div className="text-xs font-bold text-indigo-600 uppercase">
                      {eventDate.toLocaleString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 leading-none">
                      {eventDate.getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{gig.title}</p>
                    <p className="text-sm text-gray-500">{gig.venue_name} · {gig.city}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {EVENT_TYPE_LABELS[gig.event_type as EventType]} · {eventDate.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  {gig.ticket_url && (
                    <a
                      href={gig.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
                    >
                      Tickets ↗
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isOwnProfile && (
        <div className="mb-6 flex items-center justify-between">
          <div />
          <Link href="/gigs/new" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post a gig
          </Link>
        </div>
      )}

      {/* Sets Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mixes</h2>
        {sets && sets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set) => (
              <SetCard key={set.id} set={set} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-gray-600">No mixes yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

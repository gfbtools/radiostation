import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDuration, formatNumber, formatRelativeTime } from '@/lib/utils'
import { SetPlayButton } from './set-play-button'
import { LikeButton } from './like-button'
import { CommentSection } from './comment-section'
import { EmbedButton } from './embed-button'

interface SetPageProps {
  params: { id: string }
}

export default async function SetPage({ params }: SetPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: set } = await supabase
    .from('sets' as any)
    .select(`*, profiles:user_id (*)`)
    .eq('id', params.id)
    .single() as { data: any }

  if (!set || (!set.is_public && set.user_id !== user?.id)) {
    notFound()
  }

  const { data: comments } = await supabase
    .from('comments' as any)
    .select(`*, profiles:user_id (id, handle, display_name, avatar_url)`)
    .eq('set_id', params.id)
    .order('created_at', { ascending: true }) as { data: any[] | null }

  const { data: genres } = await supabase
    .from('set_genres' as any)
    .select(`genres (*)`)
    .eq('set_id', params.id) as { data: any[] | null }

  let hasLiked = false
  if (user) {
    const { data } = await supabase.rpc('has_liked' as any, {
      check_user_id: user.id,
      check_set_id: params.id,
    } as any) as { data: boolean | null }
    hasLiked = data || false
  }

  const genreList = genres?.map((g: any) => g.genres).filter(Boolean) || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Artwork + Info */}
        <div className="flex flex-col md:flex-row gap-0">
          <div className="relative w-full md:w-72 h-72 flex-shrink-0 bg-gray-200">
            {set.artwork_url ? (
              <Image
                src={set.artwork_url}
                alt={set.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <svg className="w-24 h-24 text-white opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <Link
                href={`/dj/${set.profiles.handle}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {set.profiles.display_name || set.profiles.handle}
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{set.title}</h1>

              {set.description && (
                <p className="text-gray-600 mt-3">{set.description}</p>
              )}

              {genreList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {genreList.map((genre: any) => (
                    <Link
                      key={genre.id}
                      href={`/discover?genre=${genre.id}`}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* DJ Social Links */}
            {(set.profiles.instagram_url || set.profiles.soundcloud_url || set.profiles.twitter_url || set.profiles.mixcloud_url) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {set.profiles.instagram_url && (
                  <Link href={set.profiles.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-pink-600 hover:text-pink-700 flex items-center gap-1">
                    Instagram ↗
                  </Link>
                )}
                {set.profiles.soundcloud_url && (
                  <Link href={set.profiles.soundcloud_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
                    SoundCloud ↗
                  </Link>
                )}
                {set.profiles.twitter_url && (
                  <Link href={set.profiles.twitter_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-700 hover:text-gray-900 flex items-center gap-1">
                    X ↗
                  </Link>
                )}
                {set.profiles.mixcloud_url && (
                  <Link href={set.profiles.mixcloud_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                    Mixcloud ↗
                  </Link>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="mt-6">
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatNumber(set.play_count)} plays
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {formatNumber(set.comments_count || 0)} comments
                </span>
                {set.duration_seconds && (
                  <span>{formatDuration(set.duration_seconds)}</span>
                )}
                <span>{formatRelativeTime(set.created_at)}</span>
              </div>

              <div className="flex items-center gap-3">
                <SetPlayButton set={set} />
                <EmbedButton setId={set.id} />
                <LikeButton
                  setId={set.id}
                  initialLikesCount={set.likes_count}
                  initialHasLiked={hasLiked}
                  isLoggedIn={!!user}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Comments */}
        <div className="p-6">
          <CommentSection
            setId={params.id}
            initialComments={comments || []}
            currentUser={user ? { id: user.id } : null}
          />
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FollowButton } from '@/components/follow-button'

interface FollowingPageProps {
  params: { handle: string }
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('id, handle, display_name')
    .eq('handle', params.handle.toLowerCase())
    .single() as { data: any }

  if (!profile) notFound()

  const { data: following } = await supabase
    .from('follows' as any)
    .select('following_id, profiles:following_id(id, handle, display_name, avatar_url, bio, city, country)')
    .eq('follower_id', profile.id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const followingSet = new Set<string>()
  if (user && following) {
    const ids = following.map((f: any) => f.following_id)
    if (ids.length > 0) {
      const { data: myFollows } = await supabase
        .from('follows' as any)
        .select('following_id')
        .eq('follower_id', user.id)
        .in('following_id', ids) as { data: any[] | null }
      myFollows?.forEach((f: any) => followingSet.add(f.following_id))
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link href={`/dj/${profile.handle}`} className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to {profile.display_name || profile.handle}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Following · {following?.length || 0}
        </h1>
      </div>

      {following?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Not following anyone yet.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {following?.map((f: any) => {
            const u = f.profiles
            return (
              <div key={u.id} className="flex items-center gap-4 p-4">
                <Link href={`/dj/${u.handle}`} className="flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-indigo-100">
                    {u.avatar_url ? (
                      <Image src={u.avatar_url} alt={u.display_name || u.handle} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/dj/${u.handle}`} className="font-medium text-gray-900 hover:text-indigo-600 block truncate">
                    {u.display_name || u.handle}
                  </Link>
                  <p className="text-sm text-gray-500">@{u.handle}</p>
                  {(u.city || u.country) && (
                    <p className="text-xs text-gray-400 mt-0.5">{[u.city, u.country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
                {user && user.id !== u.id && (
                  <FollowButton
                    profileId={u.id}
                    initialIsFollowing={followingSet.has(u.id)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

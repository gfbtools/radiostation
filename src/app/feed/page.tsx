import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SetCard } from '@/components/set-card'

export default async function FeedPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: feedItems } = await supabase.rpc('get_user_feed' as any, {
    user_uuid: user.id,
    limit_count: 20,
    offset_count: 0,
  } as any) as { data: any[] | null }

  const { data: following } = await supabase
    .from('follows' as any)
    .select('following_id')
    .eq('follower_id', user.id) as { data: any[] | null }

  const followingIds = following?.map(f => f.following_id) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Feed</h1>
        <p className="text-gray-600 mt-2">
          Latest mixes from DJs you follow
        </p>
      </div>

      {followingIds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No DJs followed yet</h2>
          <p className="text-gray-600 mb-4">Follow DJs to see their latest mixes in your feed</p>
          <a
            href="/discover"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Discover DJs
          </a>
        </div>
      ) : feedItems && feedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedItems.map((item) => (
            <SetCard
              key={item.set_id}
              set={{
                id: item.set_id,
                user_id: item.user_id,
                title: item.title,
                description: item.description,
                audio_url: item.audio_url,
                duration_seconds: item.duration_seconds,
                artwork_url: item.artwork_url,
                play_count: item.play_count,
                likes_count: item.likes_count,
                created_at: item.created_at,
                updated_at: item.created_at,
                is_public: true,
                profiles: {
                  id: item.user_id,
                  handle: item.handle,
                  display_name: item.display_name,
                  avatar_url: item.avatar_url,
                  bio: null,
                  location: null,
                  website: null,
                  is_public: true,
                  created_at: item.created_at,
                  updated_at: item.created_at,
                },
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <p className="text-gray-600">No new mixes from DJs you follow</p>
          <p className="text-gray-500 text-sm mt-2">Check back later or discover more DJs</p>
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { SetCard } from '@/components/set-card'
import { DiscoverFilters } from './discover-filters'

interface DiscoverPageProps {
  searchParams: {
    genre?: string
    sort?: string
  }
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const supabase = await createClient()

  const genreFilter = searchParams.genre || null
  const sortBy = searchParams.sort || 'recent'

  const { data: genres } = await supabase
    .from('genres')
    .select('*')
    .order('name')

  const { data: sets } = await supabase.rpc('discover_sets' as any, {
    genre_filter: genreFilter,
    sort_by: sortBy,
    limit_count: 24,
    offset_count: 0,
  } as any) as { data: any[] | null }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
        <p className="text-gray-600 mt-2">
          Explore mixes from DJs around the world
        </p>
      </div>

      <DiscoverFilters genres={genres || []} currentGenre={genreFilter} currentSort={sortBy} />

      {sets && sets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sets.map((item) => (
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
          <p className="text-gray-600">No mixes found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

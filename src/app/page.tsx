import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SetCard } from '@/components/set-card'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: recentSets } = await supabase
    .from('sets' as any)
    .select(`
      *,
      profiles:user_id (*)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(6) as { data: any[] | null }

  const { data: popularSets } = await supabase
    .from('sets' as any)
    .select(`
      *,
      profiles:user_id (*)
    `)
    .eq('is_public', true)
    .order('play_count', { ascending: false })
    .limit(6) as { data: any[] | null }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Share Your Sound with the World
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100">
              Upload mixes, connect with DJs, and discover new music
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/auth/signup"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Get Started
              </Link>
              <Link
                href="/discover"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600"
              >
                Discover Music
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sets Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recent Uploads</h2>
          <Link href="/discover" className="text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentSets?.map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      </div>

      {/* Popular Sets Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular Now</h2>
          <Link href="/discover?sort=popular" className="text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularSets?.map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Your Mixes</h3>
            <p className="text-gray-600">Share your DJ sets with a global community of music lovers</p>
          </div>
          <div>
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect with DJs</h3>
            <p className="text-gray-600">Follow your favorite artists and stay updated on their latest releases</p>
          </div>
          <div>
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Discover New Music</h3>
            <p className="text-gray-600">Explore mixes by genre, popularity, and trending tracks</p>
          </div>
        </div>
      </div>
    </div>
  )
}

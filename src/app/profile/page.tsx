import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('*')
    .eq('id', user.id)
    .single() as { data: any }

  if (!profile) redirect('/auth/login')

  const { data: genres } = await supabase
    .from('genres' as any)
    .select('*')
    .order('name') as { data: any[] | null }

  const { data: profileGenres } = await supabase
    .from('profile_genres' as any)
    .select('genre_id')
    .eq('profile_id', user.id) as { data: any[] | null }

  const selectedGenreIds = profileGenres?.map((pg: any) => pg.genre_id) || []

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-2">Update your profile information</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <ProfileForm profile={profile} genres={genres || []} selectedGenreIds={selectedGenreIds} />
      </div>
    </div>
  )
}

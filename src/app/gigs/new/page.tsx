import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GigForm } from './gig-form'

export default async function NewGigPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('id, handle')
    .eq('id', user.id)
    .single() as { data: any }

  if (!profile) redirect('/profile')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post a Gig</h1>
        <p className="text-gray-600 mt-1">Add an upcoming event to your profile and the gigs directory</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <GigForm djId={profile.id} handle={profile.handle} />
      </div>
    </div>
  )
}

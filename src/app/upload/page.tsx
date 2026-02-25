import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UploadForm } from './upload-form'

export default async function UploadPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: genres } = await supabase
    .from('genres')
    .select('*')
    .order('name')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Mix</h1>
        <p className="text-gray-600 mt-2">
          Share your latest set with the community
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <UploadForm genres={genres || []} />
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProfileFormProps {
  profile: any
  genres: any[]
  selectedGenreIds: string[]
}

export function ProfileForm({ profile, genres, selectedGenreIds }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [pickedGenres, setPickedGenres] = useState<string[]>(selectedGenreIds)

  const toggleGenre = (id: string) => {
    setPickedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)

    const updates = {
      handle: (formData.get('handle') as string).toLowerCase().replace(/[^a-z0-9_]/g, ''),
      display_name: formData.get('display_name') as string,
      bio: formData.get('bio') as string,
      location: formData.get('location') as string,
      city: formData.get('city') as string,
      country: formData.get('country') as string,
      website: formData.get('website') as string,
      is_public: formData.get('is_public') === 'on',
      open_to_bookings: formData.get('open_to_bookings') === 'on',
      booking_note: formData.get('booking_note') as string || null,
    }

    try {
      const { error } = await (supabase.from('profiles' as any) as any)
        .update(updates)
        .eq('id', profile.id)

      if (error) throw error

      // Update profile genres: delete then re-insert
      await (supabase.from('profile_genres' as any) as any).delete().eq('profile_id', profile.id)

      if (pickedGenres.length > 0) {
        const inserts = pickedGenres.map(gid => ({ profile_id: profile.id, genre_id: gid }))
        const { error: genreError } = await (supabase.from('profile_genres' as any) as any).insert(inserts)
        if (genreError) throw genreError
      }

      setMessage('Profile updated successfully!')
      router.refresh()
    } catch (error: any) {
      setMessage(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div>
        <label htmlFor="handle" className="block text-sm font-medium text-gray-700">DJ Handle</label>
        <input
          type="text"
          name="handle"
          id="handle"
          defaultValue={profile.handle}
          required
          pattern="[a-zA-Z0-9_]+"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">Letters, numbers, and underscores only</p>
      </div>

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">Display Name</label>
        <input
          type="text"
          name="display_name"
          id="display_name"
          defaultValue={profile.display_name || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          name="bio"
          id="bio"
          rows={4}
          defaultValue={profile.bio || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Genre Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Genres</label>
        <p className="text-xs text-gray-500 mb-3">Select the genres you play — shown on your profile and used for DJ discovery.</p>
        <div className="flex flex-wrap gap-2">
          {genres.map(genre => (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                pickedGenres.includes(genre.id)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
        {pickedGenres.length > 0 && (
          <p className="text-xs text-indigo-600 mt-2">{pickedGenres.length} genre{pickedGenres.length !== 1 ? 's' : ''} selected</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="city" className="block text-xs text-gray-500 mb-1">City</label>
            <input
              type="text"
              name="city"
              id="city"
              defaultValue={profile.city || ''}
              placeholder="Chicago"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-xs text-gray-500 mb-1">Country</label>
            <input
              type="text"
              name="country"
              id="country"
              defaultValue={profile.country || ''}
              placeholder="United States"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        {/* Keep legacy location field hidden */}
        <input type="hidden" name="location" value={`${profile.city || ''}, ${profile.country || ''}`.replace(/^, |, $/g, '')} />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
        <input
          type="url"
          name="website"
          id="website"
          defaultValue={profile.website || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_public"
          id="is_public"
          defaultChecked={profile.is_public}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">Make profile public</label>
      </div>

      {/* Booking availability */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            name="open_to_bookings"
            id="open_to_bookings"
            defaultChecked={profile.open_to_bookings}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="open_to_bookings" className="text-sm font-medium text-gray-900">
            📅 Open to bookings
          </label>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-7">Shows a "Book this DJ" button on your profile and lists you as available for hire.</p>
        <div className="ml-7">
          <label className="block text-sm font-medium text-gray-700 mb-1">Booking note <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            name="booking_note"
            defaultValue={profile.booking_note || ''}
            placeholder="e.g. Available weekends, 2hr minimum, travel negotiable"
            maxLength={500}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

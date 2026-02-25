'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Genre } from '@/lib/types'

interface UploadFormProps {
  genres: Genre[]
}

export function UploadForm({ genres }: UploadFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setUploadProgress(0)

    const formData = new FormData(e.currentTarget)
    const audioFile = formData.get('audio') as File
    const artworkFile = formData.get('artwork') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const isPublic = formData.get('is_public') === 'on'

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload audio file
      const audioPath = `${user.id}/${Date.now()}-${audioFile.name}`
      const { error: audioError } = await supabase.storage
        .from('audio')
        .upload(audioPath, audioFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (audioError) throw audioError

      setUploadProgress(50)

      // Get audio URL
      const { data: audioUrlData } = supabase.storage
        .from('audio')
        .getPublicUrl(audioPath)

      // Upload artwork if provided
      let artworkUrl = null
      if (artworkFile && artworkFile.size > 0) {
        const artworkPath = `${user.id}/${Date.now()}-${artworkFile.name}`
        const { error: artworkError } = await supabase.storage
          .from('artwork')
          .upload(artworkPath, artworkFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (!artworkError) {
          const { data: artworkUrlData } = supabase.storage
            .from('artwork')
            .getPublicUrl(artworkPath)
          artworkUrl = artworkUrlData.publicUrl
        }
      }

      setUploadProgress(75)

      // Create set record
      const { data: setData, error: setError } = await (supabase
        .from('sets' as any) as any)
        .insert({
          user_id: user.id,
          title,
          description,
          audio_url: audioUrlData.publicUrl,
          artwork_url: artworkUrl,
          is_public: isPublic,
        })
        .select()
        .single()

      if (setError) throw setError

      // Add genres
      if (selectedGenres.length > 0 && setData) {
        const genreInserts = selectedGenres.map(genreId => ({
          set_id: setData.id,
          genre_id: genreId,
        }))

        await (supabase.from('set_genres' as any) as any).insert(genreInserts)
      }

      setUploadProgress(100)
      router.push(`/dj/${user.id}`)
    } catch (error: any) {
      setMessage(error.message || 'Failed to upload')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {message}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          maxLength={200}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="audio" className="block text-sm font-medium text-gray-700">
          Audio File *
        </label>
        <input
          type="file"
          name="audio"
          id="audio"
          accept="audio/*"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">MP3, WAV, or FLAC format</p>
      </div>

      <div>
        <label htmlFor="artwork" className="block text-sm font-medium text-gray-700">
          Artwork
        </label>
        <input
          type="file"
          name="artwork"
          id="artwork"
          accept="image/*"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">Square image recommended (JPG, PNG)</p>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">
          Genres
        </span>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => handleGenreToggle(genre.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedGenres.includes(genre.id)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_public"
          id="is_public"
          defaultChecked
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
          Make this mix public
        </label>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">Uploading... {uploadProgress}%</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Uploading...' : 'Upload Mix'}
        </button>
      </div>
    </form>
  )
}

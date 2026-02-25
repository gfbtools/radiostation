'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Genre } from '@/lib/types'

interface DiscoverFiltersProps {
  genres: Genre[]
  currentGenre: string | null
  currentSort: string
}

export function DiscoverFilters({ genres, currentGenre, currentSort }: DiscoverFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleGenreChange = (genreId: string) => {
    const params = new URLSearchParams(searchParams)
    if (genreId) {
      params.set('genre', genreId)
    } else {
      params.delete('genre')
    }
    router.push(`/discover?${params.toString()}`)
  }

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', sort)
    router.push(`/discover?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex items-center space-x-2">
        <label htmlFor="genre" className="text-sm font-medium text-gray-700">
          Genre:
        </label>
        <select
          id="genre"
          value={currentGenre || ''}
          onChange={(e) => handleGenreChange(e.target.value)}
          className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="sort" className="text-sm font-medium text-gray-700">
          Sort by:
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
        >
          <option value="recent">Recent</option>
          <option value="popular">Popular</option>
          <option value="liked">Most Liked</option>
        </select>
      </div>

      {(currentGenre || currentSort !== 'recent') && (
        <button
          onClick={() => router.push('/discover')}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface DJFiltersProps {
  genres: any[]
  current: { genre?: string; city?: string; country?: string; bookable?: string }
}

export function DJFilters({ genres, current }: DJFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [city, setCity] = useState(current.city || '')

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/djs?${params.toString()}`)
  }

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update('city', city)
  }

  const hasFilters = current.genre || current.city || current.country || current.bookable

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
      {/* Genre */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Genre</label>
        <select
          value={current.genre || ''}
          onChange={e => update('genre', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All genres</option>
          {genres.map((g: any) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <form onSubmit={handleCitySubmit}>
        <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Chicago"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-36"
          />
          <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            Go
          </button>
        </div>
      </form>

      {/* Available to book */}
      <div className="self-end pb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={current.bookable === '1'}
            onChange={e => update('bookable', e.target.checked ? '1' : '')}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">📅 Available to book</span>
        </label>
      </div>

      {hasFilters && (
        <button
          onClick={() => { setCity(''); router.push('/djs') }}
          className="text-sm text-gray-500 hover:text-indigo-600 self-end pb-2"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

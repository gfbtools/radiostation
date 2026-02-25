'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { EVENT_TYPE_LABELS, EventType } from '@/lib/types'

interface GigFiltersProps {
  current: { city?: string; type?: string }
}

export function GigFilters({ current }: GigFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [city, setCity] = useState(current.city || '')

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    value ? params.set(key, value) : params.delete(key)
    router.push(`/gigs?${params.toString()}`)
  }

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update('city', city)
  }

  const hasFilters = current.city || current.type

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
      {/* City */}
      <form onSubmit={handleCitySubmit}>
        <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. New York"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-36"
          />
          <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            Go
          </button>
        </div>
      </form>

      {/* Event type */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Event type</label>
        <select
          value={current.type || ''}
          onChange={e => update('type', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All types</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={() => { setCity(''); router.push('/gigs') }}
          className="text-sm text-gray-500 hover:text-indigo-600 self-end pb-2"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

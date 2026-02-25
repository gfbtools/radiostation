'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  initialQuery?: string
  compact?: boolean  // for nav usage
}

export function SearchBar({ initialQuery = '', compact = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const handleChange = (value: string) => {
    setQuery(value)
    if (compact) {
      // In nav: navigate on debounce
      clearTimeout(debounceRef.current)
      if (value.trim().length >= 2) {
        debounceRef.current = setTimeout(() => {
          router.push(`/search?q=${encodeURIComponent(value.trim())}`)
        }, 400)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <svg
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder={compact ? 'Search...' : 'Search DJs, mixes, genres...'}
          className={`w-full bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all ${
            compact
              ? 'pl-9 pr-4 py-1.5 text-sm'
              : 'pl-11 pr-4 py-3 text-base'
          }`}
        />
      </div>
    </form>
  )
}

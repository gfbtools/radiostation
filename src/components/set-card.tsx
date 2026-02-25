'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePlayer } from './player-provider'
import { SetWithProfile } from '@/lib/types'
import { formatDuration, formatNumber } from '@/lib/utils'

interface SetCardProps {
  set: SetWithProfile
}

export function SetCard({ set }: SetCardProps) {
  const { currentTrack, isPlaying, playTrack } = usePlayer()
  const isCurrentTrack = currentTrack?.set_id === set.id || (currentTrack as any)?.id === set.id

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    playTrack({
      set_id: set.id,
      title: set.title,
      description: set.description,
      audio_url: set.audio_url,
      duration_seconds: set.duration_seconds,
      artwork_url: set.artwork_url,
      play_count: set.play_count,
      likes_count: set.likes_count,
      created_at: set.created_at,
      user_id: set.user_id,
      handle: set.profiles.handle,
      display_name: set.profiles.display_name,
      avatar_url: set.profiles.avatar_url,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="relative aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
        {set.artwork_url ? (
          <Image
            src={set.artwork_url}
            alt={set.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
            {isCurrentTrack && isPlaying ? (
              <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      <div className="p-4">
        <Link href={`/dj/${set.profiles.handle}`} className="text-sm text-indigo-600 hover:text-indigo-700">
          {set.profiles.display_name || set.profiles.handle}
        </Link>
        <Link href={`/sets/${set.id}`}>
          <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1 hover:text-indigo-600">
            {set.title}
          </h3>
        </Link>
        {set.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{set.description}</p>
        )}
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatNumber(set.play_count)}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {formatNumber(set.likes_count)}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {formatNumber(set.comments_count || 0)}
            </span>
          </div>
          {set.duration_seconds && (
            <span>{formatDuration(set.duration_seconds)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

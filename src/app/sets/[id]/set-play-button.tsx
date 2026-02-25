'use client'

import { usePlayer } from '@/components/player-provider'

interface SetPlayButtonProps {
  set: any
}

export function SetPlayButton({ set }: SetPlayButtonProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const isCurrentTrack = currentTrack?.set_id === set.id || (currentTrack as any)?.id === set.id

  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay()
    } else {
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
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
    >
      {isCurrentTrack && isPlaying ? (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          Pause
        </>
      ) : (
        <>
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Play
        </>
      )}
    </button>
  )
}

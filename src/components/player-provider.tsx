'use client'

import React, { createContext, useContext, useState, useRef, useCallback } from 'react'
import { FeedItem } from '@/lib/types'

interface PlayerContextType {
  currentTrack: FeedItem | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playTrack: (track: FeedItem) => void
  togglePlay: () => void
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<FeedItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playCountTracked = useRef(false)

  const playTrack = useCallback((track: FeedItem) => {
    if (currentTrack?.set_id === track.set_id || (currentTrack as any)?.id === (track as any)?.id) {
      togglePlay()
      return
    }

    setCurrentTrack(track)
    setIsPlaying(true)
    setCurrentTime(0)
    playCountTracked.current = false

    if (audioRef.current) {
      audioRef.current.src = track.audio_url
      audioRef.current.play()
    }
  }, [currentTrack])

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setVolumeState(newVolume)
    }
  }, [])

  const trackPlayCount = useCallback(async (setId: string, playedSeconds: number) => {
    try {
      await fetch('/api/track-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId, playedSeconds }),
      })
    } catch (error) {
      console.error('Failed to track play:', error)
    }
  }, [])

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        playTrack,
        togglePlay,
        pause,
        seek,
        setVolume,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const audio = e.target as HTMLAudioElement
          setCurrentTime(audio.currentTime)
          
          // Track play count after 30 seconds
          if (audio.currentTime > 30 && !playCountTracked.current && currentTrack) {
            playCountTracked.current = true
            trackPlayCount(currentTrack.set_id || (currentTrack as any).id!, Math.floor(audio.currentTime))
          }
        }}
        onLoadedMetadata={(e) => {
          const audio = e.target as HTMLAudioElement
          setDuration(audio.duration)
        }}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

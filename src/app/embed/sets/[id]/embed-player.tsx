'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface EmbedPlayerProps {
  set: any
  siteUrl: string
}

export function EmbedPlayer({ set, siteUrl }: EmbedPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [volume])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const time = Number(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      height: '80px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Audio element */}
      <audio ref={audioRef} src={set.audio_url} preload="metadata" />

      {/* Artwork */}
      <div style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#4338ca', position: 'relative' }}>
        {set.artwork_url ? (
          <Image src={set.artwork_url} alt={set.title} fill style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
      </div>

      {/* Track info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {set.title}
        </div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
          {set.profiles?.display_name || set.profiles?.handle}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, opacity: 0.6, minWidth: 28 }}>{fmt(currentTime)}</span>
          <div style={{ flex: 1, position: 'relative', height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress}%`, background: '#818cf8', borderRadius: 2 }} />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '100%' }}
            />
          </div>
          <span style={{ fontSize: 10, opacity: 0.6, minWidth: 28 }}>{fmt(duration)}</span>
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={togglePlay}
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#4f46e5', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: 'white',
        }}
      >
        {isPlaying ? (
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style={{ marginLeft: 2 }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Volume */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={handleVolume}
        style={{ width: 60, accentColor: '#818cf8', flexShrink: 0 }}
      />

      {/* Branding link */}
      <a
        href={`${siteUrl}/sets/${set.id}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute', bottom: 4, right: 8,
          fontSize: 9, opacity: 0.4, color: 'white', textDecoration: 'none',
        }}
      >
        DJ Platform ↗
      </a>
    </div>
  )
}

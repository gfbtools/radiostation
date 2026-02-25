'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatNumber } from '@/lib/utils'

interface LikeButtonProps {
  setId: string
  initialLikesCount: number
  initialHasLiked: boolean
  isLoggedIn: boolean
}

export function LikeButton({ setId, initialLikesCount, initialHasLiked, isLoggedIn }: LikeButtonProps) {
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!isLoggedIn || loading) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    if (hasLiked) {
      // Optimistic
      setHasLiked(false)
      setLikesCount(c => c - 1)
      await supabase.from('likes' as any).delete().eq('user_id', user.id).eq('set_id', setId)
    } else {
      setHasLiked(true)
      setLikesCount(c => c + 1)
      await supabase.from('likes' as any).insert({ user_id: user.id, set_id: setId })
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleLike}
      disabled={!isLoggedIn || loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium border transition-colors ${
        hasLiked
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg
        className="w-5 h-5"
        fill={hasLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {formatNumber(likesCount)}
    </button>
  )
}

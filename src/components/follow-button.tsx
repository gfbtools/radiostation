'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FollowButtonProps {
  profileId: string
  initialIsFollowing: boolean
}

export function FollowButton({ profileId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleFollow = async () => {
    setIsLoading(true)
    
    try {
      if (isFollowing) {
        const { error } = await (supabase
          .from('follows' as any) as any)
          .delete()
          .eq('following_id', profileId)
        
        if (error) throw error
        setIsFollowing(false)
      } else {
        const { error } = await (supabase
          .from('follows' as any) as any)
          .insert({ following_id: profileId })
        
        if (error) throw error
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`px-6 py-2 rounded-md font-medium transition-colors ${
        isFollowing
          ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}

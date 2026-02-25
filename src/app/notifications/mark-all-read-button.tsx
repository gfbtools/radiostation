'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function MarkAllReadButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.rpc('mark_all_notifications_read' as any, { user_uuid: userId } as any)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
    >
      {loading ? 'Marking...' : 'Mark all read'}
    </button>
  )
}

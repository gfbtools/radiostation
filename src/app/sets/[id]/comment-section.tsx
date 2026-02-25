'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'

interface CommentUser {
  id: string
}

interface CommentProfile {
  id: string
  handle: string
  display_name: string | null
  avatar_url: string | null
}

interface Comment {
  id: string
  set_id: string
  user_id: string
  body: string
  created_at: string
  profiles?: CommentProfile
}

interface CommentSectionProps {
  setId: string
  initialComments: Comment[]
  currentUser: CommentUser | null
}

export function CommentSection({ setId, initialComments, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`comments:${setId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `set_id=eq.${setId}` },
        async (payload) => {
          // Fetch comment with profile
          const { data } = await supabase
            .from('comments' as any)
            .select(`*, profiles:user_id (id, handle, display_name, avatar_url)`)
            .eq('id', payload.new.id)
            .single() as { data: Comment | null }

          if (data) {
            setComments(prev => {
              // Avoid duplicates (our own optimistic update)
              if (prev.find(c => c.id === data.id)) return prev
              return [...prev, data]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments', filter: `set_id=eq.${setId}` },
        (payload) => {
          setComments(prev => prev.filter(c => c.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [setId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || submitting || !currentUser) return

    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('comments' as any)
      .insert({ set_id: setId, user_id: currentUser.id, body: body.trim() })
      .select(`*, profiles:user_id (id, handle, display_name, avatar_url)`)
      .single() as { data: Comment | null, error: any }

    if (err) {
      setError('Failed to post comment. Try again.')
    } else if (data) {
      setComments(prev => {
        if (prev.find(c => c.id === data.id)) return prev
        return [...prev, data]
      })
      setBody('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }

    setSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    const supabase = createClient()
    setComments(prev => prev.filter(c => c.id !== commentId))
    await supabase.from('comments' as any).delete().eq('id', commentId)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Comments <span className="text-gray-400 font-normal">({comments.length})</span>
      </h2>

      {/* Comment list */}
      <div className="space-y-5 mb-6">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            No comments yet. Be the first to say something!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/dj/${comment.profiles?.handle}`} className="flex-shrink-0">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-indigo-100">
                  {comment.profiles?.avatar_url ? (
                    <Image
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.display_name || comment.profiles.handle || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <Link
                    href={`/dj/${comment.profiles?.handle}`}
                    className="font-medium text-sm text-gray-900 hover:text-indigo-600"
                  >
                    {comment.profiles?.display_name || comment.profiles?.handle}
                  </Link>
                  <span className="text-xs text-gray-400">{formatRelativeTime(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 break-words">{comment.body}</p>
              </div>

              {currentUser?.id === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                  title="Delete comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Comment form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Leave a comment..."
            maxLength={500}
            rows={2}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={!body.trim() || submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '...' : 'Post'}
            </button>
            <span className="text-xs text-gray-400 text-right">{body.length}/500</span>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Log in</Link>
            {' '}to leave a comment
          </p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  )
}

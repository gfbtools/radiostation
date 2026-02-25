import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { MarkAllReadButton } from './mark-all-read-button'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: notifications } = await supabase
    .from('notifications' as any)
    .select(`
      *,
      actor:actor_id (id, handle, display_name, avatar_url),
      set:set_id (id, title, artwork_url)
    `)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50) as { data: any[] | null }

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <MarkAllReadButton userId={user.id} />
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {!notifications || notifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">When DJs follow you or interact with your mixes, you'll see it here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationRow key={notif.id} notification={notif} />
          ))
        )}
      </div>
    </div>
  )
}

function NotificationRow({ notification }: { notification: any }) {
  const { actor, set, type, is_read, created_at } = notification

  const getMessage = () => {
    switch (type) {
      case 'new_follower':
        return 'started following you'
      case 'new_like':
        return 'liked your mix'
      case 'new_comment':
        return 'commented on your mix'
      default:
        return 'interacted with your content'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'new_follower':
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )
      case 'new_like':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        )
      case 'new_comment':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        )
    }
  }

  const href = type === 'new_follower'
    ? `/dj/${actor?.handle}`
    : set ? `/sets/${set.id}` : '#'

  return (
    <Link
      href={href}
      className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${!is_read ? 'bg-indigo-50/40' : ''}`}
    >
      {/* Actor avatar */}
      <div className="relative flex-shrink-0">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {actor?.avatar_url ? (
            <Image
              src={actor.avatar_url}
              alt={actor.display_name || actor.handle || ''}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-100">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1">
          {getIcon()}
        </div>
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{actor?.display_name || actor?.handle}</span>
          {' '}{getMessage()}
          {set && <span className="font-medium"> "{set.title}"</span>}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(created_at)}</p>
      </div>

      {/* Set artwork thumbnail */}
      {set?.artwork_url && (
        <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-200 flex-shrink-0">
          <Image src={set.artwork_url} alt={set.title} fill className="object-cover" />
        </div>
      )}

      {/* Unread dot */}
      {!is_read && (
        <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
      )}
    </Link>
  )
}

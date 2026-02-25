'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { EVENT_TYPE_LABELS, BUDGET_LABELS, EventType, BudgetRange, BookingStatus } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'

interface InboxTabsProps {
  incoming: any[]
  sent: any[]
  currentUserId: string
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  declined: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  cancelled: 'Cancelled',
}

export function InboxTabs({ incoming, sent, currentUserId }: InboxTabsProps) {
  const [tab, setTab] = useState<'incoming' | 'sent'>('incoming')
  const pendingCount = incoming.filter(r => r.status === 'pending').length

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('incoming')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
            tab === 'incoming' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Incoming Requests
          {pendingCount > 0 && (
            <span className="ml-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === 'sent' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent Requests
        </button>
      </div>

      {tab === 'incoming' && (
        <div className="space-y-4">
          {incoming.length === 0 ? (
            <EmptyState message="No booking requests yet." sub="When promoters or venues reach out, their requests will appear here." />
          ) : (
            incoming.map(req => (
              <IncomingRequestCard key={req.id} request={req} />
            ))
          )}
        </div>
      )}

      {tab === 'sent' && (
        <div className="space-y-4">
          {sent.length === 0 ? (
            <EmptyState message="You haven't sent any booking requests." sub={<>Browse <Link href="/djs" className="text-indigo-600 hover:underline">available DJs</Link> and send a request.</>} />
          ) : (
            sent.map(req => (
              <SentRequestCard key={req.id} request={req} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function IncomingRequestCard({ request }: { request: any }) {
  const [status, setStatus] = useState<BookingStatus>(request.status)
  const [expanded, setExpanded] = useState(request.status === 'pending')
  const [responding, setResponding] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRespond = async (newStatus: 'accepted' | 'declined') => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('booking_requests' as any)
      .update({
        status: newStatus,
        dj_response: responseText || null,
        responded_at: new Date().toISOString(),
      })
      .eq('id', request.id)

    if (!error) {
      setStatus(newStatus)
      setResponding(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all ${
      status === 'pending' ? 'border-indigo-200 shadow-sm' : 'border-gray-100'
    }`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0">
          {request.requester?.avatar_url ? (
            <Image src={request.requester.avatar_url} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              {request.requester?.display_name || request.requester?.handle}
            </span>
            <span className="text-gray-400 text-xs">wants to book you</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[status as BookingStatus]}`}>
              {STATUS_LABELS[status as BookingStatus]}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate mt-0.5">{request.event_name} · {request.city}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(request.created_at)}</p>
        </div>

        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
            <Detail label="Event" value={request.event_name} />
            <Detail label="Type" value={EVENT_TYPE_LABELS[request.event_type as EventType]} />
            <Detail label="Date" value={new Date(request.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
            <Detail label="Venue" value={request.venue_name} />
            <Detail label="Location" value={[request.city, request.country].filter(Boolean).join(', ')} />
            <Detail label="Budget" value={BUDGET_LABELS[request.budget as BudgetRange]} />
            {request.guest_count && <Detail label="Guests" value={request.guest_count.toLocaleString()} />}
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.message}</p>
          </div>

          {/* Contact info - only visible when accepted */}
          {status === 'accepted' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-green-700 mb-2">Contact Information</p>
              <p className="text-sm text-green-800">📧 {request.contact_email}</p>
              {request.contact_phone && <p className="text-sm text-green-800 mt-1">📞 {request.contact_phone}</p>}
            </div>
          )}

          {/* DJ response message (if set) */}
          {request.dj_response && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Your response</p>
              <p className="text-sm text-gray-700">{request.dj_response}</p>
            </div>
          )}

          {/* Actions for pending */}
          {status === 'pending' && !responding && (
            <div className="flex gap-3">
              <button
                onClick={() => setResponding(true)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Respond
              </button>
              <button
                onClick={() => handleRespond('declined')}
                disabled={loading}
                className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          )}

          {status === 'pending' && responding && (
            <div className="space-y-3">
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder="Add a message (optional) — e.g. 'Looking forward to it, I'll reach out to discuss details.'"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleRespond('accepted')}
                  disabled={loading}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? '...' : '✓ Accept & Reveal Contact'}
                </button>
                <button
                  onClick={() => handleRespond('declined')}
                  disabled={loading}
                  className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  {loading ? '...' : 'Decline'}
                </button>
                <button
                  onClick={() => setResponding(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SentRequestCard({ request }: { request: any }) {
  const [expanded, setExpanded] = useState(false)
  const status: BookingStatus = request.status

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0">
          {request.dj?.avatar_url ? (
            <Image src={request.dj.avatar_url} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/dj/${request.dj?.handle}`}
              onClick={e => e.stopPropagation()}
              className="font-semibold text-sm text-gray-900 hover:text-indigo-600"
            >
              {request.dj?.display_name || request.dj?.handle}
            </Link>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[status]}`}>
              {STATUS_LABELS[status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">{request.event_name} · {request.city}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(request.created_at)}</p>
        </div>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
            <Detail label="Event" value={request.event_name} />
            <Detail label="Date" value={new Date(request.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
            <Detail label="Venue" value={request.venue_name} />
            <Detail label="Budget" value={BUDGET_LABELS[request.budget as BudgetRange]} />
          </div>

          {status === 'accepted' && request.dj_response && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-medium text-green-700 mb-1">DJ's message</p>
              <p className="text-sm text-green-800">{request.dj_response}</p>
            </div>
          )}

          {status === 'declined' && request.dj_response && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">DJ's message</p>
              <p className="text-sm text-gray-700">{request.dj_response}</p>
            </div>
          )}

          {status === 'pending' && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Waiting for the DJ to respond...
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  )
}

function EmptyState({ message, sub }: { message: string; sub: React.ReactNode }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-gray-600 font-medium text-sm">{message}</p>
      <p className="text-gray-400 text-sm mt-1">{sub}</p>
    </div>
  )
}

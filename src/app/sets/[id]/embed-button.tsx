'use client'

import { useState } from 'react'

export function EmbedButton({ setId }: { setId: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourplatform.com'
  const embedUrl = `${siteUrl}/embed/sets/${setId}`
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="80" frameborder="0" allow="autoplay" style="border-radius:8px;overflow:hidden;"></iframe>`

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        title="Get embed code"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        Embed
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Embed this mix</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Copy and paste this code into any website or blog to embed a player for this mix.
            </p>

            {/* Preview */}
            <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
              <iframe
                src={embedUrl}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay"
                style={{ display: 'block' }}
              />
            </div>

            {/* Code block */}
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-700 break-all mb-3 border border-gray-200">
              {iframeCode}
            </div>

            <button
              onClick={handleCopy}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy embed code'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { X, UserPlus, Check } from 'lucide-react'

type Props = {
  documentId: string
  documentTitle: string
  onClose: () => void
}

export default function ShareModal({ documentId, documentTitle, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleShare(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) return

    setLoading(true)

    const res = await fetch('/api/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, email: email.trim() }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to share')
    } else {
      setSuccess(`Shared with ${data.sharedWith}`)
      setEmail('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Share document</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4 truncate">
          <span className="font-medium text-gray-700">{documentTitle}</span>
        </p>

        <form onSubmit={handleShare} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share with (email)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              The person must already have an Ajaia Docs account.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Sharing…' : 'Share'}
          </button>
        </form>
      </div>
    </div>
  )
}

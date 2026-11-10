'use client'

import { useRouter } from 'next/navigation'
import { FileText, Trash2, Share2 } from 'lucide-react'

type Doc = {
  id: string
  title: string
  updated_at: string
  owner_id: string
  sharedPermission?: string
}

type Props = {
  doc: Doc
  isOwned: boolean
  onDelete?: () => void
  onShare?: () => void
}

export default function DocumentCard({ doc, isOwned, onDelete, onShare }: Props) {
  const router = useRouter()

  const updatedAt = new Date(doc.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <FileText
          className="w-8 h-8 text-blue-500 shrink-0 cursor-pointer"
          onClick={() => router.push(`/editor/${doc.id}`)}
        />
        <div className="flex items-center gap-1">
          {!isOwned && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
              Shared
            </span>
          )}
          {isOwned && (
            <button
              onClick={() => onShare?.()}
              title="Share"
              className="p-1.5 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          {isOwned && (
            <button
              onClick={() => { if (confirm(`Delete "${doc.title}"?`)) onDelete?.() }}
              title="Delete"
              className="p-1.5 text-red-400 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className="cursor-pointer"
        onClick={() => router.push(`/editor/${doc.id}`)}
      >
        <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{doc.title}</h3>
        <p className="text-xs text-gray-400">Updated {updatedAt}</p>
      </div>
    </div>
  )
}

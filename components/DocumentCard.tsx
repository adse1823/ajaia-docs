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
}

export default function DocumentCard({ doc, isOwned, onDelete }: Props) {
  const router = useRouter()

  const updatedAt = new Date(doc.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      onClick={() => router.push(`/editor/${doc.id}`)}
      className="group bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <FileText className="w-8 h-8 text-blue-500 shrink-0" />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isOwned && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
              Shared
            </span>
          )}
          {isOwned && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete "${doc.title}"?`)) onDelete()
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{doc.title}</h3>
      <p className="text-xs text-gray-400">Updated {updatedAt}</p>
    </div>
  )
}

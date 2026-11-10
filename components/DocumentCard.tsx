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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <FileText style={{ width: 32, height: 32, color: '#3b82f6', cursor: 'pointer' }} onClick={() => router.push(`/editor/${doc.id}`)} />
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => onShare?.()}
            style={{ padding: 6, background: '#eff6ff', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#3b82f6' }}
          >
            <Share2 style={{ width: 16, height: 16 }} />
          </button>
          <button
            onClick={() => { if (confirm(`Delete "${doc.title}"?`)) onDelete?.() }}
            style={{ padding: 6, background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444' }}
          >
            <Trash2 style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      <div style={{ cursor: 'pointer' }} onClick={() => router.push(`/editor/${doc.id}`)}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', marginBottom: 4 }}>{doc.title}</p>
        <p style={{ fontSize: 12, color: '#9ca3af' }}>Updated {updatedAt}</p>
      </div>
    </div>
  )
}

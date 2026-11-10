'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, Plus, Upload, LogOut, Users, User } from 'lucide-react'
import DocumentCard from '@/components/DocumentCard'
import ShareModal from '@/components/ShareModal'

type Doc = {
  id: string
  title: string
  created_at: string
  updated_at: string
  owner_id: string
  sharedPermission?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'mine' | 'shared'>('mine')
  const [ownedDocs, setOwnedDocs] = useState<Doc[]>([])
  const [sharedDocs, setSharedDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [sharingDoc, setSharingDoc] = useState<Doc | null>(null)

  useEffect(() => {
    loadDocs()
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? ''))
  }, [])

  async function loadDocs() {
    setLoading(true)
    const res = await fetch('/api/documents')
    if (res.ok) {
      const { owned, shared } = await res.json()
      setOwnedDocs(owned)
      setSharedDocs(shared)
    }
    setLoading(false)
  }

  async function createDocument() {
    setCreating(true)
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled Document' }),
    })
    if (res.ok) {
      const { id } = await res.json()
      router.push(`/editor/${id}`)
    }
    setCreating(false)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setUploadError(data.error ?? 'Upload failed')
      setUploading(false)
      return
    }

    router.push(`/editor/${data.id}`)
  }

  async function deleteDocument(id: string) {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    setOwnedDocs((prev) => prev.filter((d) => d.id !== id))
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayDocs = tab === 'mine' ? ownedDocs : sharedDocs

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">Ajaia Docs</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Importing…' : 'Import file'}
            </button>
            <button
              onClick={createDocument}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {creating ? 'Creating…' : 'New document'}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {uploadError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-gray-200">
          <button
            onClick={() => setTab('mine')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'mine'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            My Documents
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {ownedDocs.length}
            </span>
          </button>
          <button
            onClick={() => setTab('shared')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === 'shared'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Shared with me
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {sharedDocs.length}
            </span>
          </button>
        </div>

        {/* Document list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : displayDocs.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {tab === 'mine'
                ? 'No documents yet. Create one or import a file.'
                : 'No documents have been shared with you yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isOwned={tab === 'mine'}
                onDelete={tab === 'mine' ? () => deleteDocument(doc.id) : undefined}
                onShare={tab === 'mine' ? () => setSharingDoc(doc) : undefined}
              />
            ))}
          </div>
        )}
      </main>

      {sharingDoc && (
        <ShareModal
          documentId={sharingDoc.id}
          documentTitle={sharingDoc.title}
          onClose={() => setSharingDoc(null)}
        />
      )}
    </div>
  )
}

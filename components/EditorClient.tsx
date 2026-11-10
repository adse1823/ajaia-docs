'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Share2, Save, Check, Loader2 } from 'lucide-react'
import Editor from '@/components/Editor'
import ShareModal from '@/components/ShareModal'

type SaveState = 'saved' | 'saving' | 'unsaved'

export default function EditorClient({ id }: { id: string }) {
  const router = useRouter()

  const [title, setTitle] = useState('Untitled Document')
  const [content, setContent] = useState('')
  const [isOwner, setIsOwner] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [showShare, setShowShare] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const pendingRef = useRef({ title, content })
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const res = await fetch(`/api/documents/${id}`)
      if (!res.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const doc = await res.json()
      setTitle(doc.title)
      setContent(doc.content ?? '')
      setIsOwner(doc.owner_id === user?.id)
      pendingRef.current = { title: doc.title, content: doc.content ?? '' }
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  async function save() {
    setSaveState('saving')
    const { title: t, content: c } = pendingRef.current
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: t, content: c }),
    })
    setSaveState(res.ok ? 'saved' : 'unsaved')
  }

  function scheduleAutoSave() {
    setSaveState('unsaved')
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(save, 3000)
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setTitle(value)
    pendingRef.current.title = value
    scheduleAutoSave()
  }

  function handleContentChange(html: string) {
    setContent(html)
    pendingRef.current.content = html
    scheduleAutoSave()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Document not found or you don&apos;t have access.</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 bg-white sticky top-0 z-20">
        <Link
          href="/dashboard"
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <input
          value={title}
          onChange={handleTitleChange}
          disabled={!isOwner}
          className="flex-1 text-base font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 py-1 min-w-0 disabled:cursor-default"
          placeholder="Untitled Document"
          onBlur={() => {
            if (title.trim() === '') {
              setTitle('Untitled Document')
              pendingRef.current.title = 'Untitled Document'
            }
          }}
        />

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs flex items-center gap-1 ${
              saveState === 'saved'
                ? 'text-green-600'
                : saveState === 'saving'
                ? 'text-gray-400'
                : 'text-orange-500'
            }`}
          >
            {saveState === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
            {saveState === 'saved' && <Check className="w-3 h-3" />}
            {saveState === 'saved'
              ? 'Saved'
              : saveState === 'saving'
              ? 'Saving…'
              : 'Unsaved changes'}
          </span>

          {isOwner && (
            <button
              onClick={save}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto">
        <Editor
          content={content}
          onChange={handleContentChange}
          editable={isOwner}
        />
      </div>

      {showShare && (
        <ShareModal
          documentId={id}
          documentTitle={title}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'

type Props = {
  content: string
  onChange: (html: string) => void
  editable?: boolean
}

export default function Editor({ content, onChange, editable = true }: Props) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChangeRef.current(editor.getHTML())
    },
  })

  // Sync external content changes (e.g. initial load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="flex flex-col h-full">
      {editable && (
        <div className="border-b border-gray-200 px-4 py-2 bg-white sticky top-0 z-10">
          <Toolbar editor={editor} />
        </div>
      )}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="tiptap-editor focus:outline-none"
        />
      </div>
    </div>
  )
}

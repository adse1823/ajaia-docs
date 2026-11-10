'use client'

import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Heading3,
} from 'lucide-react'

type Props = { editor: Editor | null }

type ToolbarButton = {
  icon: React.ReactNode
  label: string
  action: () => void
  isActive: () => boolean
}

export default function Toolbar({ editor }: Props) {
  if (!editor) return null

  const buttons: ToolbarButton[] = [
    {
      icon: <Bold className="w-4 h-4" />,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: <Italic className="w-4 h-4" />,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: <Underline className="w-4 h-4" />,
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive('underline'),
    },
    {
      icon: <Heading1 className="w-4 h-4" />,
      label: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      label: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      label: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    {
      icon: <List className="w-4 h-4" />,
      label: 'Bullet list',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      label: 'Numbered list',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
  ]

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {buttons.map(({ icon, label, action, isActive }) => (
        <button
          key={label}
          type="button"
          onClick={action}
          title={label}
          className={`p-2 rounded-lg transition-colors ${
            isActive()
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

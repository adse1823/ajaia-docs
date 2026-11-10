import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import mammoth from 'mammoth'

const SUPPORTED_TYPES = ['.txt', '.md', '.docx']

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const fileName = file.name.toLowerCase()
  const ext = SUPPORTED_TYPES.find((t) => fileName.endsWith(t))

  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported file type. Supported: ${SUPPORTED_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  const title = file.name.replace(/\.(txt|md|docx)$/i, '').trim() || 'Imported Document'
  let content = ''

  if (ext === '.docx') {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await mammoth.convertToHtml({ buffer })
    content = result.value
  } else {
    // .txt or .md — read as text, convert newlines to HTML paragraphs
    const text = await file.text()
    content = text
      .split('\n')
      .map((line) => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || '<br>'}</p>`)
      .join('')
  }

  const { data, error } = await supabase
    .from('documents')
    .insert({ owner_id: user.id, title, content })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create document from file' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, title }, { status: 201 })
}

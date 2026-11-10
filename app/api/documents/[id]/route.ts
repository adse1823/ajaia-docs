import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const updates: Record<string, string> = {}

  if (typeof body.title === 'string') {
    const trimmed = body.title.trim()
    if (!trimmed) return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
    updates.title = trimmed
  }
  if (typeof body.content === 'string') {
    updates.content = body.content
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

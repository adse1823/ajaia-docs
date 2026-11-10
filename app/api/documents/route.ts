import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: owned, error: ownedError } = await supabase
    .from('documents')
    .select('id, title, created_at, updated_at, owner_id')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  const { data: shared, error: sharedError } = await supabase
    .from('document_shares')
    .select('document_id, permission, documents(id, title, created_at, updated_at, owner_id)')
    .eq('shared_with_id', user.id)
    .order('created_at', { ascending: false })

  if (ownedError || sharedError) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }

  const sharedDocs = (shared ?? []).map((s: any) => ({
    ...(s.documents as any),
    sharedPermission: s.permission,
  }))

  return NextResponse.json({ owned: owned ?? [], shared: sharedDocs })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const title = body.title?.trim() || 'Untitled Document'
  const content = body.content || ''

  const { data, error } = await supabase
    .from('documents')
    .insert({ owner_id: user.id, title, content })
    .select('id')
    .single()

  if (error) {
    console.error('[POST /api/documents] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}

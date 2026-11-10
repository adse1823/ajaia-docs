import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { documentId, email } = body

  if (!documentId || !email) {
    return NextResponse.json({ error: 'documentId and email are required' }, { status: 400 })
  }

  // Verify the current user owns this document
  const { data: doc } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('owner_id', user.id)
    .single()

  if (!doc) {
    return NextResponse.json({ error: 'Document not found or not owned by you' }, { status: 403 })
  }

  // Look up the target user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!profile) {
    return NextResponse.json(
      { error: 'No user found with that email. They must register first.' },
      { status: 404 }
    )
  }

  if (profile.id === user.id) {
    return NextResponse.json({ error: 'You cannot share a document with yourself.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('document_shares')
    .upsert({ document_id: documentId, shared_with_id: profile.id }, { onConflict: 'document_id,shared_with_id' })

  if (error) {
    return NextResponse.json({ error: 'Failed to share document' }, { status: 500 })
  }

  return NextResponse.json({ success: true, sharedWith: profile.email })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('documentId')
  const sharedWithId = searchParams.get('sharedWithId')

  if (!documentId || !sharedWithId) {
    return NextResponse.json({ error: 'documentId and sharedWithId are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('document_shares')
    .delete()
    .eq('document_id', documentId)
    .eq('shared_with_id', sharedWithId)

  if (error) {
    return NextResponse.json({ error: 'Failed to remove share' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

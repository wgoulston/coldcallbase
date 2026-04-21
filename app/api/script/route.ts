import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('call_scripts')
    .select('content_markdown,updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Failed to fetch script' }, { status: 500 })
  return NextResponse.json({ script: data ?? null })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const content = typeof body?.content_markdown === 'string' ? body.content_markdown.trim() : ''
  if (!content) return NextResponse.json({ error: 'content_markdown is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('call_scripts')
    .upsert({
      user_id: user.id,
      content_markdown: content,
    }, { onConflict: 'user_id' })
    .select('content_markdown,updated_at')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save script' }, { status: 500 })
  return NextResponse.json({ script: data })
}

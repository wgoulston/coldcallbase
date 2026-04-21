import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SETTINGS_KEY = 'script_important_info'

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (user.app_metadata as Record<string, unknown>)?.role !== 'admin') return null
  return { user, supabase }
}

export async function GET() {
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await ctx.supabase
    .from('app_settings')
    .select('value_markdown,updated_at')
    .eq('key', SETTINGS_KEY)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  return NextResponse.json({ important_info_markdown: data?.value_markdown ?? '', updated_at: data?.updated_at ?? null })
}

export async function PUT(request: Request) {
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const importantInfo = typeof body?.important_info_markdown === 'string' ? body.important_info_markdown.trim() : ''

  const { data, error } = await ctx.supabase
    .from('app_settings')
    .upsert({
      key: SETTINGS_KEY,
      value_markdown: importantInfo,
    }, { onConflict: 'key' })
    .select('value_markdown,updated_at')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  return NextResponse.json({ important_info_markdown: data.value_markdown, updated_at: data.updated_at })
}

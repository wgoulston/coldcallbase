import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SETTINGS_KEY = 'script_important_info'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('app_settings')
    .select('value_markdown')
    .eq('key', SETTINGS_KEY)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Failed to fetch important info' }, { status: 500 })
  return NextResponse.json({ important_info_markdown: data?.value_markdown ?? '' })
}

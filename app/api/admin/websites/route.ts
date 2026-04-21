import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SiteStatus } from '@/lib/types'

const VALID_STATUSES: SiteStatus[] = ['in_progress', 'live', 'maintenance', 'cancelled']

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
    .from('client_websites')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch websites' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { business_name, domain, status, notes } = body

  if (!business_name || typeof business_name !== 'string' || !business_name.trim())
    return NextResponse.json({ error: 'business_name is required' }, { status: 400 })
  if (status !== undefined && !VALID_STATUSES.includes(status))
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })

  const { data, error } = await ctx.supabase
    .from('client_websites')
    .insert({
      business_name: business_name.trim(),
      domain: domain ? String(domain).trim() : null,
      status: status ?? 'in_progress',
      notes: notes ? String(notes).trim() : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create website' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

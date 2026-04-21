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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { business_name, domain, status, notes } = body

  if (business_name !== undefined && (typeof business_name !== 'string' || !business_name.trim()))
    return NextResponse.json({ error: 'business_name must be a non-empty string' }, { status: 400 })
  if (status !== undefined && !VALID_STATUSES.includes(status))
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })

  const patch: Record<string, unknown> = {}
  if (business_name !== undefined) patch.business_name = business_name.trim()
  if (domain !== undefined)        patch.domain = domain ? String(domain).trim() : null
  if (status !== undefined)        patch.status = status
  if (notes !== undefined)         patch.notes = notes ? String(notes).trim() : null

  const { data, error } = await ctx.supabase
    .from('client_websites')
    .update(patch)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update website' }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await ctx.supabase
    .from('client_websites')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

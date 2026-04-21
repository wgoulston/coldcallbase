import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (user.app_metadata as Record<string, unknown>)?.role !== 'admin') return null
  return user
}

export async function GET() {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })

  const { data: presenceRows } = await admin
    .from('user_presence')
    .select('user_id,last_seen_at')

  const presenceMap = new Map((presenceRows ?? []).map(row => [row.user_id, row.last_seen_at]))
  const usersWithPresence = data.users.map(user => ({
    ...user,
    last_active_at: presenceMap.get(user.id) ?? null,
  }))

  return NextResponse.json(usersWithPresence)
}

export async function POST(request: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email)
  if (error) return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 })
  return NextResponse.json(data.user, { status: 201 })
}

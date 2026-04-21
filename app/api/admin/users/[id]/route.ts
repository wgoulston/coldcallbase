import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (user.app_metadata as Record<string, unknown>)?.role !== 'admin') return null
  return user
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const caller = await assertAdmin()
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (caller.id === params.id) return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(params.id)
  if (error) return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

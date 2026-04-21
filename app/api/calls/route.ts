import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CallStatus } from '@/lib/types'
import { isInterestedOrCallback, sendCallStatusDiscordNotification } from '@/lib/notifications/discord'

const VALID_STATUSES: CallStatus[] = ['pending', 'interested', 'not_interested', 'callback', 'closed']

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('cold_calls')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { business_name, address, phone, website, lat, lng, status, notes, called_at } = body

  if (!business_name || typeof business_name !== 'string' || !business_name.trim())
    return NextResponse.json({ error: 'business_name is required' }, { status: 400 })
  if (!address || typeof address !== 'string' || !address.trim())
    return NextResponse.json({ error: 'address is required' }, { status: 400 })
  if (typeof lat !== 'number' || typeof lng !== 'number')
    return NextResponse.json({ error: 'lat and lng must be numbers' }, { status: 400 })
  if (status && !VALID_STATUSES.includes(status))
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })

  const { data, error } = await supabase
    .from('cold_calls')
    .insert({
      business_name: business_name.trim(),
      address: address.trim(),
      phone: phone ? String(phone).trim() : null,
      website: website ? String(website).trim() : null,
      lat,
      lng,
      status: status ?? 'pending',
      notes: notes ? String(notes).trim() : null,
      called_at: called_at ?? undefined,
      created_by: user.id,
      created_by_email: user.email,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create call', { code: error.code, message: error.message, details: error.details })
    return NextResponse.json({ error: 'Failed to create call' }, { status: 500 })
  }

  if (isInterestedOrCallback(data.status)) {
    try {
      await sendCallStatusDiscordNotification(data)
    } catch (notificationError) {
      console.error('Discord notification failed for call create', notificationError)
    }
  }

  return NextResponse.json(data, { status: 201 })
}

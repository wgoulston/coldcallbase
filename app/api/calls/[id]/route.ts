import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CallStatus } from '@/lib/types'
import { isInterestedOrCallback, sendCallStatusDiscordNotification } from '@/lib/notifications/discord'

const VALID_STATUSES: CallStatus[] = ['pending', 'interested', 'not_interested', 'callback', 'closed']

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { business_name, address, phone, website, lat, lng, status, notes, called_at } = body

  if (business_name !== undefined && (typeof business_name !== 'string' || !business_name.trim()))
    return NextResponse.json({ error: 'business_name must be a non-empty string' }, { status: 400 })
  if (address !== undefined && (typeof address !== 'string' || !address.trim()))
    return NextResponse.json({ error: 'address must be a non-empty string' }, { status: 400 })
  if (lat !== undefined && typeof lat !== 'number')
    return NextResponse.json({ error: 'lat must be a number' }, { status: 400 })
  if (lng !== undefined && typeof lng !== 'number')
    return NextResponse.json({ error: 'lng must be a number' }, { status: 400 })
  if (status !== undefined && !VALID_STATUSES.includes(status))
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })

  const { data: existingCall, error: existingError } = await supabase
    .from('cold_calls')
    .select('id,status')
    .eq('id', params.id)
    .single()

  if (existingError || !existingCall) {
    return NextResponse.json({ error: 'Call not found' }, { status: 404 })
  }

  const patch: Record<string, unknown> = {}
  if (business_name !== undefined) patch.business_name = business_name.trim()
  if (address !== undefined)       patch.address = address.trim()
  if (phone !== undefined)         patch.phone = phone ? String(phone).trim() : null
  if (website !== undefined)       patch.website = website ? String(website).trim() : null
  if (lat !== undefined)           patch.lat = lat
  if (lng !== undefined)           patch.lng = lng
  if (status !== undefined)        patch.status = status
  if (notes !== undefined)         patch.notes = notes ? String(notes).trim() : null
  if (called_at !== undefined)     patch.called_at = called_at

  const { data, error } = await supabase
    .from('cold_calls')
    .update(patch)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update call' }, { status: 500 })

  const transitionedToNotifyStatus =
    isInterestedOrCallback(data.status) &&
    existingCall.status !== data.status

  if (transitionedToNotifyStatus) {
    try {
      await sendCallStatusDiscordNotification(data)
    } catch (notificationError) {
      console.error('Discord notification failed for call update', notificationError)
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('cold_calls')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: 'Failed to delete call' }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

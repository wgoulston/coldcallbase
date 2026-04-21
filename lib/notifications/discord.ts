import type { CallStatus, ColdCall } from '@/lib/types'

const NOTIFY_STATUSES: CallStatus[] = ['interested', 'callback']

function shouldNotifyStatus(status: CallStatus) {
  return NOTIFY_STATUSES.includes(status)
}

export function isInterestedOrCallback(status: CallStatus) {
  return shouldNotifyStatus(status)
}

export async function sendCallStatusDiscordNotification(call: Pick<ColdCall, 'id' | 'business_name' | 'status' | 'address' | 'phone' | 'notes' | 'created_by_email'>) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl || !shouldNotifyStatus(call.status)) return

  const statusLabel = call.status === 'interested' ? 'Interested' : 'Call Back'
  const title = call.status === 'interested' ? 'New Interested Lead' : 'Callback Requested'

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title,
          color: call.status === 'interested' ? 5763719 : 3447003,
          fields: [
            { name: 'Business', value: call.business_name, inline: true },
            { name: 'Status', value: statusLabel, inline: true },
            { name: 'Phone', value: call.phone ?? 'N/A', inline: true },
            { name: 'Address', value: call.address },
            { name: 'Logged by', value: call.created_by_email ?? 'Unknown', inline: true },
            { name: 'Call ID', value: call.id, inline: true },
            { name: 'Notes', value: call.notes?.trim() || 'None' },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Discord webhook failed (${response.status})`)
  }
}

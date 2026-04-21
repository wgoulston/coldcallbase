import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/StatusBadge'
import { CallStatus, STATUS_COLORS, STATUS_LABELS } from '@/lib/types'
import Link from 'next/link'

const STAT_STATUSES: CallStatus[] = ['pending', 'interested', 'not_interested', 'callback', 'closed']

export default async function Dashboard() {
  const supabase = createClient()
  const { data: calls = [] } = await supabase
    .from('cold_calls')
    .select('*')
    .order('created_at', { ascending: false })

  const counts = STAT_STATUSES.reduce((acc, s) => {
    acc[s] = calls?.filter(c => c.status === s).length ?? 0
    return acc
  }, {} as Record<CallStatus, number>)

  const recent = calls?.slice(0, 8) ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{calls?.length ?? 0} total businesses contacted</p>
        </div>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2.5 sm:px-4 rounded-lg transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="hidden sm:inline">Open Map</span>
          <span className="sm:hidden">Map</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAT_STATUSES.map(status => {
          const c = STATUS_COLORS[status]
          return (
            <div key={status} className={`rounded-xl border p-4 space-y-2 ${c.bg} border-transparent`}>
              <StatusBadge status={status} />
              <p className="text-3xl font-bold text-gray-900">{counts[status]}</p>
            </div>
          )
        })}
      </div>

      {/* Recent calls */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent calls</h2>
          <Link href="/calls" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-gray-500 text-sm">No calls logged yet.</p>
            <Link href="/map" className="text-indigo-600 text-sm font-medium hover:underline mt-1 inline-block">
              Open the map to log your first call →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(call => (
              <div key={call.id} className="px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{call.business_name}</p>
                  <p className="text-sm text-gray-500 truncate">{call.address}</p>
                </div>
                <StatusBadge status={call.status as CallStatus} />
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(call.called_at).toLocaleDateString('en-GB')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/StatusBadge'
import { CallStatus } from '@/lib/types'
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="eyebrow mb-2">Overview</div>
          <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{calls?.length ?? 0} total businesses contacted</p>
        </div>
        <Link href="/map" className="btn-primary inline-flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="hidden sm:inline">Open Map</span>
          <span className="sm:hidden">Map</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-5">
        {STAT_STATUSES.map(status => (
          <div key={status} className="shrink-0 w-40 sm:w-auto card p-5 space-y-3">
            <p className="font-display font-bold text-4xl" style={{ color: 'var(--text)' }}>{counts[status]}</p>
            <StatusBadge status={status} />
          </div>
        ))}
      </div>

      {/* Recent calls */}
      <div className="card">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display font-bold text-sm tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Recent Calls</h2>
          <Link href="/calls" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>View all →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-16 text-center" style={{ background: 'var(--surface2)' }}>
            <svg className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>No calls logged yet.</p>
            <Link href="/map" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent)' }}>
              Open the map to log your first call →
            </Link>
          </div>
        ) : (
          <div style={{ background: 'var(--surface2)' }}>
            {recent.map((call, i) => (
              <Link
                key={call.id}
                href="/calls"
                className="px-5 py-4 flex items-center gap-4 transition-colors hover:bg-white/[0.02]"
                style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{call.business_name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                    {call.address}{call.created_by_email ? ` · ${call.created_by_email}` : ''}
                  </p>
                </div>
                <StatusBadge status={call.status as CallStatus} />
                <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>
                  {new Date(call.called_at).toLocaleDateString('en-GB')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/map',    label: 'Map View',   desc: 'Log calls on the map' },
          { href: '/calls',  label: 'All Calls',  desc: 'Browse & filter records' },
          { href: '/script', label: 'Call Script', desc: 'Your pitch guide' },
        ].map(({ href, label, desc }) => (
          <Link key={href} href={href} className="card p-4 block transition-colors" style={{ background: 'var(--surface)' }}>
            <p className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>{label}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{desc}</p>
          </Link>
        ))}
      </div>

    </div>
  )
}

'use client'
import { useEffect, useState, useCallback } from 'react'
import { ColdCall, CallStatus, STATUS_LABELS } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import CallModal from '@/components/CallModal'

const ALL_STATUSES: CallStatus[] = ['pending', 'interested', 'not_interested', 'callback', 'closed']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB')
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function renderLikelihood(likelihood: 'likely' | 'unlikely' | null) {
  if (!likelihood) return <span style={{ color: 'var(--border)' }}>—</span>
  const isLikely = likelihood === 'likely'
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{
        color: isLikely ? 'var(--accent)' : 'var(--red)',
        background: isLikely ? 'rgba(251,191,36,0.14)' : 'rgba(248,113,113,0.14)',
      }}
    >
      {isLikely ? 'Likely' : 'Unlikely'}
    </span>
  )
}

const th = 'text-left px-4 py-3 text-xs font-display font-bold tracking-widest uppercase'

export default function CallsPage() {
  const [calls, setCalls]               = useState<ColdCall[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all')
  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState<ColdCall | null>(null)

  const fetchCalls = useCallback(async () => {
    const res = await fetch('/api/calls')
    if (res.ok) setCalls(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  const filtered = calls.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchSearch = search === '' ||
      c.business_name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      (c.notes ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (c.likelihood ?? '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const openEdit = (call: ColdCall) => { setEditing(call); setModalOpen(true) }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow mb-2">Records</div>
          <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>All Calls</h1>
        </div>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search business, address, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
              style={{ color: 'var(--muted)' }}
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as CallStatus | 'all')}
          className="field sm:w-44"
        >
          <option value="all">All statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="py-16 flex justify-center" style={{ background: 'var(--surface2)' }}>
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
            No calls found.
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden" style={{ background: 'var(--surface2)' }}>
              {filtered.map((call, i) => (
                <button
                  key={call.id}
                  onClick={() => openEdit(call)}
                  className="w-full text-left px-4 py-4 space-y-2 transition-colors hover:bg-white/[0.02]"
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{call.business_name}</p>
                      <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>{call.address}</p>
                    </div>
                    <StatusBadge status={call.status as CallStatus} />
                  </div>
                  <div className="text-xs">{renderLikelihood(call.likelihood)}</div>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
                    {call.phone
                      ? <a href={`tel:${call.phone}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--accent)' }}>{call.phone}</a>
                      : <span>—</span>}
                    <span>{formatDate(call.called_at)}</span>
                  </div>
                  {call.follow_up_at && (
                    <p className="text-xs" style={{ color: 'var(--accent)' }}>
                      Follow-up: {formatDateTime(call.follow_up_at)}
                    </p>
                  )}
                  {call.website && <p className="text-xs truncate" style={{ color: 'var(--blue)' }}>{call.website.replace(/^https?:\/\//, '')}</p>}
                  {!call.website && <p className="text-xs italic" style={{ color: 'var(--muted)' }}>No website listed</p>}
                  {call.notes && <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>{call.notes}</p>}
                  {call.created_by_email && <p className="text-xs" style={{ color: 'var(--muted)' }}>by {call.created_by_email}</p>}
                </button>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block w-full">
              <table className="w-full min-w-full text-sm">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[22%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[20%]" />
                  <col className="w-[10%]" />
                  <col className="w-[4%]" />
                </colgroup>
                <thead>
                  <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                    <th className={th} style={{ color: 'var(--muted)' }}>Business</th>
                    <th className={th} style={{ color: 'var(--muted)' }}>Address</th>
                    <th className={th} style={{ color: 'var(--muted)' }}>Status</th>
                    <th className={th} style={{ color: 'var(--muted)' }}>Fit</th>
                    <th className={th} style={{ color: 'var(--muted)' }}>Activity</th>
                    <th className={`${th} hidden xl:table-cell`} style={{ color: 'var(--muted)' }}>Website</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody style={{ background: 'var(--surface2)' }}>
                  {filtered.map((call, i) => (
                    <tr
                      key={call.id}
                      className="transition-colors cursor-pointer hover:bg-white/[0.02]"
                      style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
                      onClick={() => openEdit(call)}
                    >
                      <td className="px-4 py-4 align-top">
                        <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{call.business_name}</p>
                        <div className="text-xs mt-1 truncate" style={{ color: 'var(--muted)' }}>
                          {call.phone
                            ? <a href={`tel:${call.phone}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--accent)' }}>{call.phone}</a>
                            : <span style={{ color: 'var(--border)' }}>No phone</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[220px] truncate align-top" style={{ color: 'var(--muted)' }}>
                        {call.address}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap align-top">
                        <StatusBadge status={call.status as CallStatus} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap align-top">
                        {renderLikelihood(call.likelihood)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                          Called: {formatDate(call.called_at)}
                        </p>
                        <p className="text-xs whitespace-nowrap mt-1" style={{ color: call.follow_up_at ? 'var(--accent)' : 'var(--border)' }}>
                          Follow-up: {call.follow_up_at ? formatDate(call.follow_up_at) : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap max-w-[160px] hidden xl:table-cell align-top" onClick={e => e.stopPropagation()}>
                        {call.website ? (
                          <a href={call.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs truncate max-w-full" style={{ color: 'var(--blue)' }}>
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {call.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        ) : (
                          <span className="text-xs italic" style={{ color: 'var(--border)' }}>None</span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(call)} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <CallModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSaved={fetchCalls}
        existing={editing}
      />
    </div>
  )
}

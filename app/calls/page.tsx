'use client'
import { useEffect, useState, useCallback } from 'react'
import { ColdCall, CallStatus, STATUS_LABELS } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import CallModal from '@/components/CallModal'

const ALL_STATUSES: CallStatus[] = ['pending', 'interested', 'not_interested', 'callback', 'closed']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB')
}

export default function CallsPage() {
  const [calls, setCalls]         = useState<ColdCall[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<ColdCall | null>(null)

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
      (c.notes ?? '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const openEdit = (call: ColdCall) => {
    setEditing(call)
    setModalOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Calls</h1>
        <span className="text-sm text-gray-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search business, address, notes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as CallStatus | 'all')}
          className="px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="all">All statuses</option>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">No calls found.</div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map(call => (
                <div key={call.id} className="px-4 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{call.business_name}</p>
                      <p className="text-sm text-gray-500 truncate">{call.address}</p>
                    </div>
                    <StatusBadge status={call.status as CallStatus} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{call.phone ?? '—'}</span>
                    <span>{formatDate(call.called_at)}</span>
                  </div>
                  {call.website && (
                    <a
                      href={call.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 truncate max-w-full"
                    >
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {call.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {call.notes && (
                    <p className="text-xs text-gray-500 line-clamp-2">{call.notes}</p>
                  )}
                  <button
                    onClick={() => openEdit(call)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                  >
                    Edit →
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Business</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-600">Address</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Called</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Website</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(call => (
                    <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                        {call.business_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-[220px] truncate">
                        {call.address}
                      </td>
                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {call.phone ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={call.status as CallStatus} />
                      </td>
                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {formatDate(call.called_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {call.website ? (
                          <a
                            href={call.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit
                          </a>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-500 max-w-[240px] truncate">
                        {call.notes ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => openEdit(call)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                        >
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

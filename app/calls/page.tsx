'use client'
import { useEffect, useState, useCallback } from 'react'
import { ColdCall, CallStatus, STATUS_LABELS } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import CallModal from '@/components/CallModal'

const ALL_STATUSES: CallStatus[] = ['pending', 'interested', 'not_interested', 'callback', 'closed']

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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">No calls found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Business</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Address</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Called</th>
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
                      {new Date(call.called_at).toLocaleDateString()}
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

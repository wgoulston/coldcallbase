'use client'
import { useState, useEffect } from 'react'
import { CallStatus, ColdCall, STATUS_LABELS } from '@/lib/types'

interface PlacePreset {
  business_name: string
  address: string
  phone?: string
  lat: number
  lng: number
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  existing?: ColdCall | null
  preset?: PlacePreset | null
}

const STATUSES: CallStatus[] = ['pending', 'interested', 'not_interested', 'callback', 'closed']

const empty = {
  business_name: '',
  address: '',
  phone: '',
  website: '',
  lat: 0,
  lng: 0,
  status: 'pending' as CallStatus,
  notes: '',
  called_at: new Date().toISOString().slice(0, 16),
}

export default function CallModal({ open, onClose, onSaved, existing, preset }: Props) {
  const [form, setForm]     = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (existing) {
      setForm({
        business_name: existing.business_name,
        address:       existing.address,
        phone:         existing.phone ?? '',
        website:       existing.website ?? '',
        lat:           existing.lat,
        lng:           existing.lng,
        status:        existing.status,
        notes:         existing.notes ?? '',
        called_at:     existing.called_at.slice(0, 16),
      })
    } else if (preset) {
      setForm({
        ...empty,
        business_name: preset.business_name,
        address:       preset.address,
        phone:         preset.phone ?? '',
        lat:           preset.lat,
        lng:           preset.lng,
        called_at:     new Date().toISOString().slice(0, 16),
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [existing, preset, open])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      called_at: new Date(form.called_at).toISOString(),
      phone:    form.phone    || null,
      website:  form.website  || null,
      notes:    form.notes    || null,
    }

    const url    = existing ? `/api/calls/${existing.id}` : '/api/calls'
    const method = existing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Something went wrong')
      setSaving(false)
      return
    }

    onSaved()
    onClose()
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!existing || !confirm('Delete this call record?')) return
    const res = await fetch(`/api/calls/${existing.id}`, { method: 'DELETE' })
    if (res.ok) { onSaved(); onClose() }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="font-semibold text-gray-900">
            {existing ? 'Edit Call' : 'Log a Call'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business name *</label>
            <input
              required
              value={form.business_name}
              onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Acme Plumbing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              required
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="123 Main St, City, State"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+44 1234 567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as CallStatus }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Called at</label>
              <input
                type="datetime-local"
                value={form.called_at}
                onChange={e => setForm(f => ({ ...f, called_at: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="What did they say? Follow-up details..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {saving ? 'Saving…' : existing ? 'Save changes' : 'Log call'}
            </button>

            {existing && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { CallLikelihood, CallStatus, ColdCall, STATUS_LABELS } from '@/lib/types'

interface PlacePreset {
  business_name: string
  address: string
  phone?: string
  website?: string
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
const LIKELIHOODS: { value: CallLikelihood; label: string }[] = [
  { value: 'likely', label: 'Likely' },
  { value: 'unlikely', label: 'Unlikely' },
]

const empty = {
  business_name: '',
  address: '',
  phone: '',
  website: '',
  lat: 0,
  lng: 0,
  status: 'pending' as CallStatus,
  likelihood: null as CallLikelihood | null,
  notes: '',
  called_at: new Date().toISOString().slice(0, 16),
  follow_up_at: '',
}

const lbl = 'block text-xs font-display font-bold tracking-widest uppercase mb-1.5'

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
        likelihood:    existing.likelihood ?? null,
        notes:         existing.notes ?? '',
        called_at:     existing.called_at.slice(0, 16),
        follow_up_at:  existing.follow_up_at ? existing.follow_up_at.slice(0, 16) : '',
      })
    } else if (preset) {
      setForm({
        ...empty,
        business_name: preset.business_name,
        address:       preset.address,
        phone:         preset.phone   ?? '',
        website:       preset.website ?? '',
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
      follow_up_at: form.follow_up_at ? new Date(form.follow_up_at).toISOString() : null,
      phone:   form.phone   || null,
      website: form.website || null,
      notes:   form.notes   || null,
      likelihood: form.likelihood ?? null,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto" style={{ background: 'var(--surface)' }}>
        <div className="sticky top-0 px-6 py-4 flex items-center justify-between rounded-t-2xl" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>
            {existing ? 'Edit Call' : 'Log a Call'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--muted)' }} className="hover:opacity-80 transition-opacity">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4" style={{ background: 'var(--surface2)' }}>
          {error && (
            <div className="rounded-lg px-4 py-2.5 text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <div>
            <label className={lbl} style={{ color: 'var(--muted)' }}>Business name *</label>
            <input required value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} className="field" placeholder="Acme Plumbing" />
          </div>

          <div>
            <label className={lbl} style={{ color: 'var(--muted)' }}>Address *</label>
            <input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="field" placeholder="123 High Street, Horsham" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl} style={{ color: 'var(--muted)' }}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="field" placeholder="+44 1234 567890" />
            </div>
            <div>
              <label className={lbl} style={{ color: 'var(--muted)' }}>Website</label>
              <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="field" placeholder="https://example.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl} style={{ color: 'var(--muted)' }}>Status *</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as CallStatus }))} className="field">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl} style={{ color: 'var(--muted)' }}>Pre-call fit</label>
              <select
                value={form.likelihood ?? ''}
                onChange={e => setForm(f => ({ ...f, likelihood: (e.target.value || null) as CallLikelihood | null }))}
                className="field"
              >
                <option value="">Unmarked</option>
                {LIKELIHOODS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl} style={{ color: 'var(--muted)' }}>Called at</label>
              <input type="datetime-local" value={form.called_at} onChange={e => setForm(f => ({ ...f, called_at: e.target.value }))} className="field" />
            </div>
            <div>
              <label className={lbl} style={{ color: 'var(--muted)' }}>Follow-up date</label>
              <input
                type="datetime-local"
                value={form.follow_up_at}
                onChange={e => setForm(f => ({ ...f, follow_up_at: e.target.value }))}
                className="field"
              />
            </div>
          </div>

          <div>
            <label className={lbl} style={{ color: 'var(--muted)' }}>Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="field resize-none" placeholder="What did they say? Follow-up details..." />
          </div>

          {existing && (
            <div className="rounded-lg px-4 py-3 space-y-1 text-xs" style={{ background: 'rgba(110,231,183,0.04)', border: '1px solid var(--border)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Logged by</span>
                <span style={{ color: 'var(--text)' }}>{existing.created_by_email ?? 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>Created</span>
                <span style={{ color: 'var(--text)' }}>
                  {new Date(existing.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : existing ? 'Save changes' : 'Log call'}
            </button>
            {existing && (
              <button type="button" onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

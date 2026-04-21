'use client'
import { useEffect, useState, useCallback } from 'react'
import { ClientWebsite, SiteStatus, SITE_STATUS_LABELS, SITE_STATUS_COLORS } from '@/lib/types'

type Tab = 'team' | 'sites'

interface TeamUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  app_metadata: Record<string, unknown>
}

const SITE_STATUSES: SiteStatus[] = ['in_progress', 'live', 'maintenance', 'cancelled']

const emptySite = {
  business_name: '',
  domain: '',
  status: 'in_progress' as SiteStatus,
  notes: '',
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('team')

  // --- Team state ---
  const [users, setUsers]           = useState<TeamUser[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting]     = useState(false)
  const [teamError, setTeamError]   = useState('')
  const [teamMsg, setTeamMsg]       = useState('')

  // --- Sites state ---
  const [sites, setSites]           = useState<ClientWebsite[]>([])
  const [siteForm, setSiteForm]     = useState(emptySite)
  const [editingSite, setEditingSite] = useState<ClientWebsite | null>(null)
  const [siteModalOpen, setSiteModalOpen] = useState(false)
  const [savingSite, setSavingSite] = useState(false)
  const [siteError, setSiteError]   = useState('')

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
  }, [])

  const fetchSites = useCallback(async () => {
    const res = await fetch('/api/admin/websites')
    if (res.ok) setSites(await res.json())
  }, [])

  useEffect(() => { fetchUsers(); fetchSites() }, [fetchUsers, fetchSites])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setTeamError('')
    setTeamMsg('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    if (res.ok) {
      setTeamMsg(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
      fetchUsers()
    } else {
      const d = await res.json()
      setTeamError(d.error ?? 'Failed to send invite')
    }
    setInviting(false)
  }

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from the team?`)) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) fetchUsers()
    else {
      const d = await res.json()
      setTeamError(d.error ?? 'Failed to remove user')
    }
  }

  const openNewSite = () => {
    setEditingSite(null)
    setSiteForm(emptySite)
    setSiteError('')
    setSiteModalOpen(true)
  }

  const openEditSite = (site: ClientWebsite) => {
    setEditingSite(site)
    setSiteForm({
      business_name: site.business_name,
      domain:        site.domain ?? '',
      status:        site.status,
      notes:         site.notes ?? '',
    })
    setSiteError('')
    setSiteModalOpen(true)
  }

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSite(true)
    setSiteError('')

    const payload = {
      ...siteForm,
      domain: siteForm.domain || null,
      notes:  siteForm.notes  || null,
    }

    const url    = editingSite ? `/api/admin/websites/${editingSite.id}` : '/api/admin/websites'
    const method = editingSite ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const d = await res.json()
      setSiteError(d.error ?? 'Something went wrong')
    } else {
      setSiteModalOpen(false)
      fetchSites()
    }
    setSavingSite(false)
  }

  const handleDeleteSite = async () => {
    if (!editingSite || !confirm(`Delete ${editingSite.business_name}?`)) return
    const res = await fetch(`/api/admin/websites/${editingSite.id}`, { method: 'DELETE' })
    if (res.ok) { setSiteModalOpen(false); fetchSites() }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage team and client websites</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['team', 'sites'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'team' ? 'Team' : 'Client Sites'}
          </button>
        ))}
      </div>

      {/* ---- TEAM TAB ---- */}
      {tab === 'team' && (
        <div className="space-y-5">
          {/* Invite form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Invite employee</h2>
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="email"
                required
                placeholder="employee@3ait.co.uk"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={inviting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
              >
                {inviting ? 'Sending…' : 'Send invite'}
              </button>
            </form>
            {teamMsg   && <p className="mt-2 text-sm text-green-700">{teamMsg}</p>}
            {teamError && <p className="mt-2 text-sm text-red-600">{teamError}</p>}
          </div>

          {/* Users list */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Team members ({users.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {users.map(u => (
                <div key={u.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Joined {new Date(u.created_at).toLocaleDateString('en-GB')}
                      {u.last_sign_in_at && ` · Last sign-in ${new Date(u.last_sign_in_at).toLocaleDateString('en-GB')}`}
                    </p>
                  </div>
                  {(u.app_metadata?.role === 'admin') && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">Admin</span>
                  )}
                  {(u.app_metadata?.role !== 'admin') && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---- SITES TAB ---- */}
      {tab === 'sites' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{sites.length} site{sites.length !== 1 ? 's' : ''}</p>
            <button
              onClick={openNewSite}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
            >
              + Add site
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {sites.length === 0 ? (
              <p className="py-16 text-center text-sm text-gray-400">No client sites yet.</p>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {sites.map(site => (
                    <button
                      key={site.id}
                      onClick={() => openEditSite(site)}
                      className="w-full text-left px-4 py-4 space-y-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900 truncate">{site.business_name}</p>
                        <SiteStatusBadge status={site.status} />
                      </div>
                      {site.domain
                        ? <p className="text-xs text-indigo-600 truncate">{site.domain}</p>
                        : <p className="text-xs text-gray-400 italic">No domain</p>}
                      {site.notes && <p className="text-xs text-gray-500 line-clamp-2">{site.notes}</p>}
                    </button>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-6 py-3 font-medium text-gray-600">Business</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Domain</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sites.map(site => (
                        <tr
                          key={site.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => openEditSite(site)}
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                            {site.business_name}
                          </td>
                          <td className="px-4 py-4 max-w-[180px] truncate" onClick={e => e.stopPropagation()}>
                            {site.domain ? (
                              <a
                                href={site.domain.startsWith('http') ? site.domain : `https://${site.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 text-xs"
                              >
                                {site.domain}
                              </a>
                            ) : (
                              <span className="text-gray-300 text-xs italic">None</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <SiteStatusBadge status={site.status} />
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-xs max-w-[240px] truncate">
                            {site.notes ?? <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={e => { e.stopPropagation(); openEditSite(site) }}
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
        </div>
      )}

      {/* ---- SITE MODAL ---- */}
      {siteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSiteModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-semibold text-gray-900">{editingSite ? 'Edit site' : 'Add client site'}</h2>
              <button onClick={() => setSiteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveSite} className="px-6 py-5 space-y-4">
              {siteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                  {siteError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business name *</label>
                <input
                  required
                  value={siteForm.business_name}
                  onChange={e => setSiteForm(f => ({ ...f, business_name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Acme Plumbing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <input
                  value={siteForm.domain}
                  onChange={e => setSiteForm(f => ({ ...f, domain: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="acmeplumbing.co.uk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={siteForm.status}
                  onChange={e => setSiteForm(f => ({ ...f, status: e.target.value as SiteStatus }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {SITE_STATUSES.map(s => (
                    <option key={s} value={s}>{SITE_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={siteForm.notes}
                  onChange={e => setSiteForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="e.g. Awaiting content from client…"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingSite}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  {savingSite ? 'Saving…' : editingSite ? 'Save changes' : 'Add site'}
                </button>
                {editingSite && (
                  <button
                    type="button"
                    onClick={handleDeleteSite}
                    className="px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const c = SITE_STATUS_COLORS[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {SITE_STATUS_LABELS[status]}
    </span>
  )
}

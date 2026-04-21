'use client'
import { useEffect, useState, useCallback } from 'react'
import { ClientWebsite, SiteStatus, SITE_STATUS_LABELS, SITE_STATUS_COLORS } from '@/lib/types'

type Tab = 'team' | 'sites' | 'content'

interface TeamUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  app_metadata: Record<string, unknown>
}

const SITE_STATUSES: SiteStatus[] = ['in_progress', 'live', 'maintenance', 'cancelled']
const emptySite = { business_name: '', domain: '', status: 'in_progress' as SiteStatus, notes: '' }
const lbl = 'block text-xs font-display font-bold tracking-widest uppercase mb-1.5'
const th  = 'text-left px-4 py-3 text-xs font-display font-bold tracking-widest uppercase'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('team')

  const [users, setUsers]             = useState<TeamUser[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting]       = useState(false)
  const [teamError, setTeamError]     = useState('')
  const [teamMsg, setTeamMsg]         = useState('')

  const [sites, setSites]                 = useState<ClientWebsite[]>([])
  const [siteForm, setSiteForm]           = useState(emptySite)
  const [editingSite, setEditingSite]     = useState<ClientWebsite | null>(null)
  const [siteModalOpen, setSiteModalOpen] = useState(false)
  const [savingSite, setSavingSite]       = useState(false)
  const [siteError, setSiteError]         = useState('')
  const [importantInfo, setImportantInfo] = useState('')
  const [contentSaving, setContentSaving] = useState(false)
  const [contentMsg, setContentMsg]       = useState('')
  const [contentError, setContentError]   = useState('')

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers(await res.json())
  }, [])

  const fetchSites = useCallback(async () => {
    const res = await fetch('/api/admin/websites')
    if (res.ok) setSites(await res.json())
  }, [])

  const fetchContentSettings = useCallback(async () => {
    const res = await fetch('/api/admin/settings')
    if (!res.ok) return
    const data = await res.json()
    setImportantInfo(data.important_info_markdown ?? '')
  }, [])

  useEffect(() => { fetchUsers(); fetchSites(); fetchContentSettings() }, [fetchUsers, fetchSites, fetchContentSettings])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true); setTeamError(''); setTeamMsg('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    if (res.ok) { setTeamMsg(`Invite sent to ${inviteEmail}`); setInviteEmail(''); fetchUsers() }
    else { const d = await res.json(); setTeamError(d.error ?? 'Failed to send invite') }
    setInviting(false)
  }

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from the team?`)) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) fetchUsers()
    else { const d = await res.json(); setTeamError(d.error ?? 'Failed to remove user') }
  }

  const openNewSite = () => { setEditingSite(null); setSiteForm(emptySite); setSiteError(''); setSiteModalOpen(true) }
  const openEditSite = (site: ClientWebsite) => {
    setEditingSite(site)
    setSiteForm({ business_name: site.business_name, domain: site.domain ?? '', status: site.status, notes: site.notes ?? '' })
    setSiteError('')
    setSiteModalOpen(true)
  }

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSite(true); setSiteError('')
    const payload = { ...siteForm, domain: siteForm.domain || null, notes: siteForm.notes || null }
    const url    = editingSite ? `/api/admin/websites/${editingSite.id}` : '/api/admin/websites'
    const method = editingSite ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { const d = await res.json(); setSiteError(d.error ?? 'Something went wrong') }
    else { setSiteModalOpen(false); fetchSites() }
    setSavingSite(false)
  }

  const handleDeleteSite = async () => {
    if (!editingSite || !confirm(`Delete ${editingSite.business_name}?`)) return
    const res = await fetch(`/api/admin/websites/${editingSite.id}`, { method: 'DELETE' })
    if (res.ok) { setSiteModalOpen(false); fetchSites() }
  }

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault()
    setContentSaving(true)
    setContentMsg('')
    setContentError('')

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ important_info_markdown: importantInfo }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setContentError(d.error ?? 'Failed to save content')
      setContentSaving(false)
      return
    }

    setContentMsg('Saved')
    setContentSaving(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      <div>
        <div className="eyebrow mb-2">Settings</div>
        <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>Admin</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Manage team and client websites</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
        {(['team', 'sites', 'content'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2.5 text-sm font-display font-bold tracking-wide border-b-2 transition-colors -mb-px"
            style={tab === t
              ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
              : { borderColor: 'transparent', color: 'var(--muted)' }
            }
          >
            {t === 'team' ? 'Team' : t === 'sites' ? 'Client Sites' : 'Content'}
          </button>
        ))}
      </div>

      {/* TEAM TAB */}
      {tab === 'team' && (
        <div className="space-y-5">
          <div className="card" style={{ background: 'var(--surface)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-display font-bold text-sm tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Invite Employee</h2>
            </div>
            <form onSubmit={handleInvite} className="px-5 py-5 flex gap-3" style={{ background: 'var(--surface2)' }}>
              <input
                type="email"
                required
                placeholder="employee@3ait.co.uk"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="field flex-1"
              />
              <button type="submit" disabled={inviting} className="btn-primary whitespace-nowrap">
                {inviting ? 'Sending…' : 'Send invite'}
              </button>
            </form>
            {teamMsg   && <p className="px-5 pb-4 text-sm" style={{ color: 'var(--accent)' }}>{teamMsg}</p>}
            {teamError && <p className="px-5 pb-4 text-sm" style={{ color: 'var(--red)' }}>{teamError}</p>}
          </div>

          <div className="card" style={{ background: 'var(--surface)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-display font-bold text-sm tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Team Members ({users.length})</h2>
            </div>
            <div style={{ background: 'var(--surface2)' }}>
              {users.map((u, i) => (
                <div
                  key={u.id}
                  className="px-5 py-4 flex items-center gap-4"
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{u.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      Joined {new Date(u.created_at).toLocaleDateString('en-GB')}
                      {u.last_sign_in_at && ` · Last sign-in ${new Date(u.last_sign_in_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`}
                    </p>
                  </div>
                  {u.app_metadata?.role === 'admin' ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-display font-bold tracking-wide" style={{ background: 'rgba(110,231,183,0.12)', color: 'var(--accent)', border: '1px solid rgba(110,231,183,0.2)' }}>Admin</span>
                  ) : (
                    <button onClick={() => handleDeleteUser(u.id, u.email)} className="text-xs font-medium transition-opacity hover:opacity-70" style={{ color: 'var(--red)' }}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SITES TAB */}
      {tab === 'sites' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{sites.length} site{sites.length !== 1 ? 's' : ''}</p>
            <button onClick={openNewSite} className="btn-primary">+ Add site</button>
          </div>

          <div className="card" style={{ background: 'var(--surface)' }}>
            {sites.length === 0 ? (
              <p className="py-16 text-center text-sm" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>No client sites yet.</p>
            ) : (
              <>
                {/* Mobile */}
                <div className="sm:hidden" style={{ background: 'var(--surface2)' }}>
                  {sites.map((site, i) => (
                    <button
                      key={site.id}
                      onClick={() => openEditSite(site)}
                      className="w-full text-left px-4 py-4 space-y-1.5 transition-colors hover:bg-white/[0.02]"
                      style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{site.business_name}</p>
                        <SiteStatusBadge status={site.status} />
                      </div>
                      {site.domain
                        ? <p className="text-xs truncate" style={{ color: 'var(--blue)' }}>{site.domain}</p>
                        : <p className="text-xs italic" style={{ color: 'var(--muted)' }}>No domain</p>}
                      {site.notes && <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>{site.notes}</p>}
                    </button>
                  ))}
                </div>

                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <th className={th} style={{ color: 'var(--muted)' }}>Business</th>
                        <th className={th} style={{ color: 'var(--muted)' }}>Domain</th>
                        <th className={th} style={{ color: 'var(--muted)' }}>Status</th>
                        <th className={th} style={{ color: 'var(--muted)' }}>Notes</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody style={{ background: 'var(--surface2)' }}>
                      {sites.map((site, i) => (
                        <tr
                          key={site.id}
                          className="transition-colors cursor-pointer hover:bg-white/[0.02]"
                          style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
                          onClick={() => openEditSite(site)}
                        >
                          <td className="px-4 py-4 font-medium max-w-[200px] truncate" style={{ color: 'var(--text)' }}>{site.business_name}</td>
                          <td className="px-4 py-4 max-w-[180px] truncate" onClick={e => e.stopPropagation()}>
                            {site.domain ? (
                              <a href={site.domain.startsWith('http') ? site.domain : `https://${site.domain}`} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: 'var(--blue)' }}>
                                {site.domain}
                              </a>
                            ) : (
                              <span className="text-xs italic" style={{ color: 'var(--border)' }}>None</span>
                            )}
                          </td>
                          <td className="px-4 py-4"><SiteStatusBadge status={site.status} /></td>
                          <td className="px-4 py-4 text-xs max-w-[240px] truncate" style={{ color: 'var(--muted)' }}>
                            {site.notes ?? <span style={{ color: 'var(--border)' }}>—</span>}
                          </td>
                          <td className="px-4 py-4">
                            <button onClick={e => { e.stopPropagation(); openEditSite(site) }} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Edit</button>
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

      {/* CONTENT TAB */}
      {tab === 'content' && (
        <div className="space-y-5">
          <div className="card" style={{ background: 'var(--surface)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-display font-bold text-sm tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
                Script Page Important Info
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Appears on the right side of the script page for all users. Supports markdown.
              </p>
            </div>
            <form onSubmit={handleSaveContent} className="px-5 py-5 space-y-4" style={{ background: 'var(--surface2)' }}>
              <textarea
                rows={12}
                value={importantInfo}
                onChange={e => setImportantInfo(e.target.value)}
                className="field resize-y font-mono text-sm"
                placeholder={'## Important\\n- New offer\\n- Team note\\n- Urgent follow-up process'}
              />
              {contentMsg && <p className="text-sm" style={{ color: 'var(--accent)' }}>{contentMsg}</p>}
              {contentError && <p className="text-sm" style={{ color: 'var(--red)' }}>{contentError}</p>}
              <div className="flex justify-end">
                <button type="submit" disabled={contentSaving} className="btn-primary">
                  {contentSaving ? 'Saving…' : 'Save content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SITE MODAL */}
      {siteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSiteModalOpen(false)} />
          <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto" style={{ background: 'var(--surface)' }}>
            <div className="sticky top-0 px-6 py-4 flex items-center justify-between rounded-t-2xl" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--text)' }}>{editingSite ? 'Edit site' : 'Add client site'}</h2>
              <button onClick={() => setSiteModalOpen(false)} style={{ color: 'var(--muted)' }} className="hover:opacity-80 transition-opacity">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveSite} className="px-6 py-5 space-y-4" style={{ background: 'var(--surface2)' }}>
              {siteError && (
                <div className="rounded-lg px-4 py-2.5 text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)' }}>
                  {siteError}
                </div>
              )}

              <div>
                <label className={lbl} style={{ color: 'var(--muted)' }}>Business name *</label>
                <input required value={siteForm.business_name} onChange={e => setSiteForm(f => ({ ...f, business_name: e.target.value }))} className="field" placeholder="Acme Plumbing" />
              </div>
              <div>
                <label className={lbl} style={{ color: 'var(--muted)' }}>Domain</label>
                <input value={siteForm.domain} onChange={e => setSiteForm(f => ({ ...f, domain: e.target.value }))} className="field" placeholder="acmeplumbing.co.uk" />
              </div>
              <div>
                <label className={lbl} style={{ color: 'var(--muted)' }}>Status</label>
                <select value={siteForm.status} onChange={e => setSiteForm(f => ({ ...f, status: e.target.value as SiteStatus }))} className="field">
                  {SITE_STATUSES.map(s => <option key={s} value={s}>{SITE_STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl} style={{ color: 'var(--muted)' }}>Notes</label>
                <textarea rows={3} value={siteForm.notes} onChange={e => setSiteForm(f => ({ ...f, notes: e.target.value }))} className="field resize-none" placeholder="e.g. Awaiting content from client…" />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button type="submit" disabled={savingSite} className="btn-primary flex-1">
                  {savingSite ? 'Saving…' : editingSite ? 'Save changes' : 'Add site'}
                </button>
                {editingSite && (
                  <button type="button" onClick={handleDeleteSite} className="btn-danger">Delete</button>
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
  const hex = SITE_STATUS_COLORS[status].hex
  return (
    <span
      style={{ background: `${hex}18`, color: hex, border: `1px solid ${hex}28` }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
    >
      {SITE_STATUS_LABELS[status]}
    </span>
  )
}

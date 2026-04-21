'use client'

import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const DEFAULT_SCRIPT = `# 3aIT Outreach Script

## Pricing
- **Static site:** £500-£800
- **Dynamic/reactive site:** £800+
- **Monthly maintenance:** from around £50/month (hosting, updates, minor fixes)

## 1) The opener
**You say**
Good morning/afternoon, is that [Business Name]? This is [Your Name] calling from 3aIT - may I speak with the owner for a moment?

## 2) Get to the owner
**If speaking to the owner**
Hi, it's [Your Name] from 3aIT. I noticed your business may be missing a modern website, and I wanted to reach out briefly. We build high-performing websites for local businesses - do you have two minutes?

**If speaking to staff**
No worries - could I grab two minutes with them? It's a quick call about the business website.

## 3) Pitch + pricing
At 3aIT, we build websites for local businesses focused on performance and lead generation.

Pricing starts from **£500-£800** for a straightforward static site, or **£800+** for something interactive (booking, ecommerce, custom enquiry flows).

If helpful, I can put together a **free preview concept** within a few days so you can see what an updated site could look like before making any decision.

## 4) The ask
Would you be open to me putting together a short concept and calling you back in a couple of days to walk you through it? It's free and there is no obligation.

## 5) Common objections
**"We already have a website."**
Understood - is it currently bringing in the level of enquiries you want?

**"How much does it cost?"**
Basic sites start at £500-£800; more advanced builds are £800+.

**"Can't afford it now."**
No pressure - can I send details so you have them for later?

## 6) Wrap up
**Interested:** Great - I will prepare something and call you back in a couple of days.

**Not now:** No problem - I will send a short email with my details from 3aIT.`

type Mode = 'default' | 'mine'

export default function ScriptPageClient() {
  const [mode, setMode] = useState<Mode>('default')
  const [mine, setMine] = useState(DEFAULT_SCRIPT)
  const [loadingMine, setLoadingMine] = useState(false)
  const [savingMine, setSavingMine] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [error, setError] = useState('')
  const [importantInfo, setImportantInfo] = useState('')

  useEffect(() => {
    if (mode !== 'mine') return
    let cancelled = false
    const run = async () => {
      setLoadingMine(true)
      setError('')
      const res = await fetch('/api/script')
      if (!res.ok) {
        if (!cancelled) setError('Failed to load your script')
        setLoadingMine(false)
        return
      }
      const payload = await res.json()
      if (!cancelled) {
        setMine(payload?.script?.content_markdown || DEFAULT_SCRIPT)
        setLoadingMine(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [mode])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const res = await fetch('/api/script/info')
      if (!res.ok) return
      const payload = await res.json()
      if (!cancelled) setImportantInfo(payload?.important_info_markdown || '')
    }
    run()
    return () => { cancelled = true }
  }, [])

  const activeContent = useMemo(() => (mode === 'default' ? DEFAULT_SCRIPT : mine), [mode, mine])

  const saveMyScript = async () => {
    setSavingMine(true)
    setSaveMsg('')
    setError('')
    const res = await fetch('/api/script', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_markdown: mine }),
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      setError(payload?.error ?? 'Failed to save your script')
      setSavingMine(false)
      return
    }
    setSavingMine(false)
    setSaveMsg('Saved')
    setTimeout(() => setSaveMsg(''), 1800)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <style>{`
        .md h1, .md h2, .md h3 { font-family: var(--font-display, inherit); color: var(--text); margin: 1rem 0 0.5rem; }
        .md h1 { font-size: 1.6rem; font-weight: 800; }
        .md h2 { font-size: 1.2rem; font-weight: 700; }
        .md p, .md li { color: var(--muted); line-height: 1.7; }
        .md ul { padding-left: 1.1rem; margin: 0.5rem 0 1rem; }
        .md strong { color: var(--accent2, #fbbf24); font-weight: 600; }
      `}</style>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="eyebrow mb-2">3aIT Sales</div>
              <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text)' }}>Call Script</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                Switch between default script and your personal version.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <label className="block text-xs font-display font-bold tracking-widest uppercase mb-1.5" style={{ color: 'var(--muted)' }}>
                Script source
              </label>
              <select value={mode} onChange={e => setMode(e.target.value as Mode)} className="field">
                <option value="default">Default script</option>
                <option value="mine">My script</option>
              </select>
            </div>
          </div>

          {mode === 'mine' && (
            <div className="card p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Edit in markdown. Your version is saved per user.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMine(DEFAULT_SCRIPT)}
                    className="px-3 py-1.5 rounded-lg text-xs border"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                  >
                    Reset to default
                  </button>
                  <button type="button" onClick={saveMyScript} disabled={savingMine || loadingMine} className="btn-primary text-sm px-4 py-2">
                    {savingMine ? 'Saving…' : 'Save script'}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
              {saveMsg && <p className="text-sm" style={{ color: 'var(--accent)' }}>{saveMsg}</p>}
              <textarea
                value={mine}
                onChange={e => setMine(e.target.value)}
                disabled={loadingMine}
                className="field min-h-[260px] font-mono text-sm"
                placeholder="Write your script in markdown..."
              />
            </div>
          )}

          <div className="card p-4 sm:p-6">
            <div className="md max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
        <aside className="card p-4 sm:p-5 xl:sticky xl:top-20">
          <h2 className="font-display font-bold text-sm tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
            Important Info
          </h2>
          <div className="md max-w-none text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {importantInfo || 'No important info set yet. Ask admin to add notes in Admin -> Content.'}
            </ReactMarkdown>
          </div>
        </aside>
      </div>
    </div>
  )
}


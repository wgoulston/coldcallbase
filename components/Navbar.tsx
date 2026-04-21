'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/',       label: 'Dashboard' },
  { href: '/map',    label: 'Map' },
  { href: '/calls',  label: 'All Calls' },
  { href: '/script', label: 'Script' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [open, setOpen]     = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  if (pathname === '/login') return null

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin((user?.app_metadata as Record<string, unknown>)?.role === 'admin')
    })
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const allLinks = isAdmin ? [...links, { href: '/admin', label: 'Admin' }] : links

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} className="fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0 font-display font-bold text-base" style={{ color: 'var(--accent)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            ColdCallBase
          </Link>

          <div className="hidden sm:flex items-center gap-0.5">
            {allLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={pathname === href
                  ? { background: 'rgba(110,231,183,0.1)', color: 'var(--accent)' }
                  : { color: 'var(--muted)' }
                }
                onMouseEnter={e => { if (pathname !== href) (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
                onMouseLeave={e => { if (pathname !== href) (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="hidden sm:block text-sm transition-colors"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          Sign out
        </button>

        <button
          onClick={() => setOpen(o => !o)}
          className="sm:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--muted)' }}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="sm:hidden px-4 py-3 space-y-1 shadow-xl" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          {allLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={pathname === href
                ? { background: 'rgba(110,231,183,0.1)', color: 'var(--accent)' }
                : { color: 'var(--muted)' }
              }
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}

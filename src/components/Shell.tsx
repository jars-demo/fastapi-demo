import Link from 'next/link'

import { REPO_URL } from '@/lib/site'

// Navigation and footer, shared by every page.

export function LogoMark({ size = 28 }: { size?: number }) {
  // Three books on a shelf; the teal one is Shelf.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#141412" />
      <rect x="8" y="9" width="4.5" height="14" rx="1.2" fill="#f5f2ea" />
      <rect x="13.8" y="7" width="4.5" height="16" rx="1.2" fill="#14b8a6" />
      <rect
        x="19.6"
        y="10"
        width="4.5"
        height="13"
        rx="1.2"
        fill="#f5f2ea"
        transform="rotate(12 21.85 23)"
      />
      <rect x="6.5" y="23.5" width="19" height="1.8" rx="0.9" fill="#f5f2ea" />
    </svg>
  )
}

const NAV = [
  { href: '/#build', label: 'What we build' },
  { href: '/workshop', label: 'Workshop' },
]

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-3 z-30 px-3 sm:top-4 sm:px-4">
        <nav
          aria-label="Main"
          className="glass-strong mx-auto flex h-13 max-w-5xl items-center justify-between gap-2 rounded-full pr-2 pl-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-full text-[17px] font-semibold tracking-[-0.02em]"
          >
            <LogoMark />
            <span className="hidden sm:inline">FastAPI Workshop</span>
          </Link>
          <ul className="flex items-center gap-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={REPO_URL}
                className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-85"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <LogoMark size={20} />
            FastAPI Workshop, a JARS Demo workshop
          </span>
          <span>
            MIT licensed ·{' '}
            <a className="hover:text-ink" href={REPO_URL}>
              GitHub
            </a>
          </span>
        </div>
      </footer>
    </>
  )
}

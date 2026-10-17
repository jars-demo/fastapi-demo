import type { Metadata } from 'next'
import Link from 'next/link'

import { CHAPTERS } from '@/lib/workshop'

export const metadata: Metadata = { title: 'Workshop' }

export default function WorkshopPage() {
  const total = CHAPTERS.reduce((sum, chapter) => sum + chapter.minutes, 0)
  return (
    <div className="relative">
      <div className="relative mx-auto max-w-3xl px-4 pt-16 pb-28">
        <header className="rise mb-12 flex flex-col gap-3">
          <span className="text-[12px] font-medium tracking-[0.16em] text-muted uppercase">
            The workshop · {CHAPTERS.length} chapters · about {total} minutes
          </span>
          <h1 className="font-display text-5xl leading-none tracking-[-0.03em] sm:text-6xl">
            Build a real <em className="text-gradient italic">API.</em>
          </h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-ink-2">
            From an empty folder to Shelf, a reading-list API with a database, auth, tests and a
            Docker image. Every chapter is short, hands-on, and ends with a way to check it worked.
          </p>
        </header>
        <ol className="flex flex-col gap-3">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.slug}>
              <Link
                href={`/workshop/${chapter.slug}`}
                className="glass lift flex items-start gap-5 rounded-panel p-5 sm:p-6"
              >
                <span className="w-12 shrink-0 font-display text-4xl leading-none text-accent-text tabular-nums">
                  {chapter.number}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[17px] font-semibold tracking-tight">{chapter.title}</span>
                  <span className="text-[15px] text-muted">{chapter.summary}</span>
                  <span className="text-[13px] text-muted">{chapter.minutes} minutes</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

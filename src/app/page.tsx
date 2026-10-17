import Link from 'next/link'

import { ApiDemo } from '@/components/ApiDemo'
import { CodeBlock } from '@/components/CopyButton'
import { MethodPill } from '@/components/MethodPill'
import { Shelfie } from '@/components/Shelfie'
import { ENDPOINTS, EXCHANGES, FEATURES, QUICKSTART, REPO_URL } from '@/lib/site'
import { CHAPTERS } from '@/lib/workshop'

export default function Home() {
  const minutes = CHAPTERS.reduce((sum, chapter) => sum + chapter.minutes, 0)
  const hours = Math.round((minutes / 60) * 2) / 2

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-28 px-4 pt-14 pb-28 sm:pt-20">
      {/* Hero */}
      <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <span className="rise inline-flex w-fit items-center gap-2 rounded-full bg-accent-wash px-3 py-1 text-[13px] font-medium text-accent-text">
            Free workshop · {CHAPTERS.length} chapters · about {hours} hours
          </span>
          <h1
            className="rise font-display text-[3.4rem] leading-[0.95] tracking-[-0.035em] text-balance sm:text-7xl"
            style={{ '--delay': '80ms' } as React.CSSProperties}
          >
            Build a real API with <em className="text-gradient italic">FastAPI.</em>
          </h1>
          <p
            className="rise max-w-xl text-[18px] leading-relaxed text-ink-2"
            style={{ '--delay': '160ms' } as React.CSSProperties}
          >
            Step by step, you build <strong className="text-ink">Shelf</strong>, a small
            reading-list API that is ready for the real world: validation, a database, helpful
            errors, auth, tests, logs and a Docker image. No magic, just Python with type hints.
          </p>
          <div
            className="rise flex flex-wrap gap-3"
            style={{ '--delay': '240ms' } as React.CSSProperties}
          >
            <Link
              href="/workshop/01-why-fastapi"
              className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[15px] font-medium text-canvas transition-transform hover:-translate-y-0.5"
            >
              Start the workshop
            </Link>
            <a
              href={REPO_URL}
              className="glass inline-flex h-12 items-center rounded-full px-6 text-[15px] font-medium transition-transform hover:-translate-y-0.5"
            >
              View the code
            </a>
          </div>
        </div>
        <div
          className="rise flex justify-center"
          style={{ '--delay': '200ms' } as React.CSSProperties}
        >
          <Shelfie />
        </div>
      </section>

      {/* What we build */}
      <section id="build" className="grid scroll-mt-24 gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <h2 className="font-display text-5xl leading-none tracking-[-0.03em]">
            Meet <em className="text-gradient italic">Shelf.</em>
          </h2>
          <p className="text-[17px] leading-relaxed text-ink-2">
            Want to read it, reading it, done. Shelf keeps the list. Reads are open; writes need a
            key. Small enough for one afternoon, real enough to deploy.
          </p>
          <ul className="glass flex flex-col divide-y divide-hairline rounded-panel px-4 py-1">
            {ENDPOINTS.map((endpoint) => (
              <li
                key={`${endpoint.method} ${endpoint.path}`}
                className="flex min-w-0 items-center gap-3 py-2.5"
              >
                <MethodPill method={endpoint.method} />
                <span className="flex min-w-0 flex-col">
                  <code className="truncate font-mono text-[13px] text-ink">{endpoint.path}</code>
                  <span className="text-[13px] text-muted">{endpoint.does}</span>
                </span>
                {endpoint.key && (
                  <span
                    className="ml-auto shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2"
                    title="Needs the X-API-Key header"
                  >
                    key
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <ApiDemo exchanges={EXCHANGES} />
          <p className="px-2 text-[13px] text-muted">
            Real requests and responses from the API you will build, trimmed for space.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col gap-8">
        <h2 className="max-w-2xl font-display text-5xl leading-none tracking-[-0.03em]">
          Everything a real API needs, <em className="text-gradient italic">nothing extra.</em>
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <Link
                href={`/workshop/${feature.chapter}`}
                className="glass lift flex h-full flex-col gap-2 rounded-panel p-6"
              >
                <span className="text-[17px] font-semibold tracking-tight">{feature.title}</span>
                <span className="text-[15px] leading-relaxed text-ink-2">{feature.body}</span>
                <span className="mt-auto pt-2 text-[13px] font-medium text-accent-text">
                  Chapter {feature.chapter.slice(0, 2)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Chapters */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-5xl leading-none tracking-[-0.03em]">
            Twelve short <em className="text-gradient italic">chapters.</em>
          </h2>
          <Link href="/workshop" className="text-[15px] font-medium text-accent-text">
            See them all
          </Link>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.slug}>
              <Link
                href={`/workshop/${chapter.slug}`}
                className="glass lift flex h-full items-start gap-4 rounded-card p-4"
              >
                <span className="font-display text-3xl leading-none text-accent-text tabular-nums">
                  {chapter.number}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold tracking-tight">{chapter.title}</span>
                  <span className="text-[13px] text-muted">{chapter.minutes} minutes</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Quick start */}
      <section className="glass-strong grid gap-8 rounded-panel p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div className="flex min-w-0 flex-col gap-4">
          <h2 className="font-display text-5xl leading-none tracking-[-0.03em]">
            Running in <em className="text-gradient italic">a minute.</em>
          </h2>
          <p className="text-[16px] leading-relaxed text-ink-2">
            You need{' '}
            <a
              className="font-medium text-accent-text underline underline-offset-4"
              href="https://docs.astral.sh/uv/"
            >
              uv
            </a>{' '}
            and git. uv installs Python 3.13 and the exact package versions for you. Then open the
            live docs and click around.
          </p>
          <Link
            href="/workshop/02-set-up"
            className="w-fit text-[15px] font-medium text-accent-text"
          >
            Full setup in chapter 02
          </Link>
        </div>
        <div className="min-w-0">
          <CodeBlock code={QUICKSTART} />
        </div>
      </section>
    </div>
  )
}

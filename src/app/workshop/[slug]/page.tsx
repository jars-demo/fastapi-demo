import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { MarkdownPre } from '@/components/MarkdownPre'
import { REPO_URL } from '@/lib/site'
import { CHAPTERS, findChapter } from '@/lib/workshop'

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({ slug: chapter.slug }))
}

export async function generateMetadata(props: PageProps<'/workshop/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const chapter = findChapter(slug)
  return { title: chapter ? `${chapter.number}. ${chapter.title}` : 'Workshop' }
}

export default async function ChapterPage(props: PageProps<'/workshop/[slug]'>) {
  const { slug } = await props.params
  const chapter = findChapter(slug)
  if (!chapter) notFound()
  const index = CHAPTERS.indexOf(chapter)
  const previous = CHAPTERS[index - 1]
  const next = CHAPTERS[index + 1]

  return (
    <article className="mx-auto max-w-3xl px-4 pt-16 pb-28">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link href="/workshop" className="hover:text-ink">
          Workshop
        </Link>{' '}
        / Chapter {chapter.number}
      </nav>
      <header className="rise mb-10 flex flex-col gap-3">
        <span className="text-[12px] font-medium tracking-[0.16em] text-muted uppercase">
          Chapter {chapter.number} · {chapter.minutes} minutes
        </span>
        <h1 className="font-display text-5xl leading-none tracking-[-0.03em] text-balance sm:text-6xl">
          {chapter.title}
        </h1>
        <p className="text-[17px] leading-relaxed text-ink-2">{chapter.summary}</p>
      </header>
      <div className="prose-workshop">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: MarkdownPre }}>
          {chapter.body}
        </ReactMarkdown>
      </div>
      <nav aria-label="Chapters" className="mt-14 grid gap-3 sm:grid-cols-2">
        {previous ? (
          <Link
            href={`/workshop/${previous.slug}`}
            className="glass lift flex flex-col gap-1 rounded-panel p-5"
          >
            <span className="text-[13px] text-muted">Previous</span>
            <span className="font-semibold">
              {previous.number}. {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/workshop/${next.slug}`}
            className="glass lift flex flex-col gap-1 rounded-panel p-5 text-right"
          >
            <span className="text-[13px] text-muted">Next</span>
            <span className="font-semibold">
              {next.number}. {next.title}
            </span>
          </Link>
        ) : (
          <a
            href={REPO_URL}
            className="glass lift flex flex-col gap-1 rounded-panel p-5 text-right"
          >
            <span className="text-[13px] text-muted">You made it</span>
            <span className="font-semibold">Star the repo and share your API</span>
          </a>
        )}
      </nav>
    </article>
  )
}

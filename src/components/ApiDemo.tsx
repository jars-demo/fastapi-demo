'use client'

import { useEffect, useState } from 'react'

import type { Exchange } from '@/lib/site'

// A request on top, its response below. It steps through the examples on its own until someone
// picks one, and never moves on its own for people who prefer reduced motion.

const STEP_MS = 4800

function statusTone(status: string): string {
  if (status.startsWith('2')) return 'bg-[#e7f6f2] text-[#0f766e]'
  if (status.startsWith('4')) return 'bg-[#fdecec] text-[#b91c1c]'
  return 'bg-surface-2 text-ink-2'
}

export function ApiDemo({ exchanges }: { exchanges: Exchange[] }) {
  const [index, setIndex] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % exchanges.length)
    }, STEP_MS)
    return () => window.clearInterval(timer)
  }, [auto, exchanges.length])

  const exchange = exchanges[index] ?? exchanges[0]
  if (!exchange) return null

  return (
    <div className="glass-strong flex min-w-0 flex-col gap-3 rounded-panel p-3 sm:p-4">
      <div role="tablist" aria-label="Example requests" className="flex flex-wrap gap-1.5">
        {exchanges.map((item, i) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => {
              setIndex(i)
              setAuto(false)
            }}
            className={`h-8 rounded-full px-3 text-[13px] font-medium transition-colors ${
              i === index ? 'bg-ink text-canvas' : 'text-ink-2 hover:bg-surface-2'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div key={index} className="swap flex min-w-0 flex-col gap-2" role="tabpanel">
        <div className="min-w-0 rounded-card bg-[#1c1b18] text-[#f5f2ea]">
          <div className="px-4 pt-3 font-mono text-[11px] tracking-wide text-[#b9b4a8] uppercase">
            Request
          </div>
          <pre className="px-4 pt-1.5 pb-4 font-mono text-[12.5px] leading-relaxed break-words whitespace-pre-wrap">
            <code>{exchange.request}</code>
          </pre>
        </div>
        <div className="min-w-0 rounded-card bg-surface shadow-soft">
          <div className="flex items-center justify-between gap-2 px-4 pt-3">
            <span className="font-mono text-[11px] tracking-wide text-muted uppercase">
              Response
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-[11.5px] font-semibold ${statusTone(exchange.status)}`}
            >
              {exchange.status}
            </span>
          </div>
          <pre className="overflow-x-auto px-4 pt-1.5 pb-4 font-mono text-[12.5px] leading-relaxed text-ink-2">
            <code>{exchange.response}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

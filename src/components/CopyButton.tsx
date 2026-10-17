'use client'

import { useState } from 'react'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'blocked'>('idle')
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setState('copied')
        } catch {
          setState('blocked')
        }
        window.setTimeout(() => setState('idle'), 1800)
      }}
      className="inline-flex h-9 items-center rounded-full bg-surface px-4 text-sm font-medium text-ink shadow-soft transition-colors hover:bg-surface-2"
    >
      <span aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'blocked' ? 'Select and copy' : label}
      </span>
    </button>
  )
}

export function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  return (
    <div className="overflow-hidden rounded-card bg-[#1c1b18] text-[#f5f2ea]">
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="font-mono text-[12px] text-[#b9b4a8]">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-4 pt-2 pb-4 font-mono text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

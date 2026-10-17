import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiDemo } from '@/components/ApiDemo'
import { MarkdownPre } from '@/components/MarkdownPre'
import { EXCHANGES } from '@/lib/site'

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('ApiDemo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockReducedMotion(false)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows the first exchange, then steps on by itself', () => {
    render(<ApiDemo exchanges={EXCHANGES} />)
    expect(screen.getByRole('tab', { name: 'Add a book' }).getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(screen.getByText('201 Created')).toBeDefined()

    act(() => vi.advanceTimersByTime(5000))

    expect(screen.getByText('200 OK')).toBeDefined()
  })

  it('stops stepping once someone picks an example', () => {
    render(<ApiDemo exchanges={EXCHANGES} />)
    fireEvent.click(screen.getByRole('tab', { name: 'No key' }))
    expect(screen.getByText('401 Unauthorized')).toBeDefined()

    act(() => vi.advanceTimersByTime(20_000))

    expect(screen.getByText('401 Unauthorized')).toBeDefined()
  })

  it('never moves on its own with reduced motion', () => {
    mockReducedMotion(true)
    render(<ApiDemo exchanges={EXCHANGES} />)

    act(() => vi.advanceTimersByTime(20_000))

    expect(screen.getByText('201 Created')).toBeDefined()
  })
})

describe('MarkdownPre', () => {
  afterEach(cleanup)

  it('adds a copy button to code blocks', () => {
    render(
      <MarkdownPre>
        <code>{'uv run pytest\n'}</code>
      </MarkdownPre>,
    )
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDefined()
    expect(screen.getByText('uv run pytest')).toBeDefined()
  })
})

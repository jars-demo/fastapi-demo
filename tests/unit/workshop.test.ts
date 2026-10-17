import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { ENDPOINTS, FEATURES } from '@/lib/site'
import { CHAPTERS, findChapter } from '@/lib/workshop'

const API = path.join(process.cwd(), 'api')

describe('workshop chapters', () => {
  it('has twelve chapters numbered in order', () => {
    expect(CHAPTERS.map((chapter) => chapter.number)).toEqual(
      Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
    )
  })

  it.each(CHAPTERS.map((chapter) => [chapter.slug, chapter] as const))(
    '%s has a title, summary, time and the standard sections',
    (_slug, chapter) => {
      expect(chapter.title.length).toBeGreaterThan(3)
      expect(chapter.summary.length).toBeGreaterThan(10)
      expect(chapter.minutes).toBeGreaterThan(0)
      expect(chapter.body).toMatch(/^## Goal$/m)
      expect(chapter.body).toMatch(/^## Check it works$/m)
      expect(chapter.body).toMatch(/^## Exercise$/m)
    },
  )

  it('finds chapters by slug', () => {
    expect(findChapter('08-auth')?.title).toBe('Protect writes with an API key')
    expect(findChapter('nope')).toBeUndefined()
  })
})

describe('the docs match the code', () => {
  it('every file a chapter mentions exists in api/', () => {
    const mentioned = new Set<string>()
    for (const chapter of CHAPTERS) {
      for (const match of chapter.body.matchAll(/\b((?:app|tests)\/[\w/]+\.py)\b/g)) {
        mentioned.add(match[1] ?? '')
      }
    }
    expect(mentioned.size).toBeGreaterThan(5)
    for (const file of mentioned) {
      expect(fs.existsSync(path.join(API, file)), `${file} is mentioned but missing`).toBe(true)
    }
  })

  it('every endpoint on the site is a real route', () => {
    const routers = path.join(API, 'app', 'routers')
    const source = fs
      .readdirSync(routers)
      .filter((file) => file.endsWith('.py'))
      .map((file) => fs.readFileSync(path.join(routers, file), 'utf8'))
      .join('\n')
    for (const endpoint of ENDPOINTS) {
      const route = endpoint.path.startsWith('/books')
        ? endpoint.path.slice('/books'.length)
        : endpoint.path
      const decorator = `@router.${endpoint.method.toLowerCase()}(\n    "${route}"`
      const inline = `@router.${endpoint.method.toLowerCase()}("${route}"`
      expect(
        source.includes(inline) || source.includes(decorator),
        `${endpoint.method} ${endpoint.path} not found in api/app/routers`,
      ).toBe(true)
    }
  })

  it('every feature card links to a real chapter', () => {
    for (const feature of FEATURES) {
      expect(findChapter(feature.chapter), feature.chapter).toBeDefined()
    }
  })
})

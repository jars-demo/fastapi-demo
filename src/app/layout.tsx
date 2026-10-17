import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'

import { Shell } from '@/components/Shell'

import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: {
    default: 'FastAPI Workshop · Build Shelf, a real API',
    template: '%s · FastAPI Workshop',
  },
  description:
    'A hands-on FastAPI workshop. Build Shelf, a small production-shaped reading-list API, with validation, a database, auth, tests, logs and Docker.',
}

export const viewport: Viewport = { themeColor: '#fbf8f1' }

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only rounded-full bg-ink px-4 py-2 text-canvas focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        <Shell>{children}</Shell>
      </body>
    </html>
  )
}

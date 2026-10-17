// The hero illustration: a little shelf of books. The teal one, Shelfie, has eyes and blinks.
// Hover the shelf and the books lean. All motion stops for people who prefer reduced motion.

const BOOKS = [
  { x: 20, w: 26, h: 118, fill: '#f3c9a8' },
  { x: 50, w: 20, h: 100, fill: '#141412' },
  { x: 74, w: 30, h: 128, fill: '#c9dff2' },
  { x: 154, w: 24, h: 108, fill: '#f5e3a3' },
  { x: 182, w: 30, h: 122, fill: '#e8d5f5' },
  { x: 216, w: 22, h: 96, fill: '#f3c9a8' },
]

const BASE = 168

export function Shelfie() {
  return (
    <svg
      viewBox="0 0 260 200"
      role="img"
      aria-label="A shelf of books. One teal book, Shelfie, looks back at you."
      className="shelf h-auto w-full max-w-[420px]"
    >
      <ellipse cx="130" cy="186" rx="118" ry="8" fill="rgb(20 20 18 / 0.06)" />
      <g>
        {BOOKS.map((book) => (
          <g key={book.x} className="book">
            <rect
              x={book.x}
              y={BASE - book.h}
              width={book.w}
              height={book.h}
              rx="4"
              fill={book.fill}
            />
            <rect
              x={book.x + 4}
              y={BASE - book.h + 14}
              width={book.w - 8}
              height="3"
              rx="1.5"
              fill="rgb(20 20 18 / 0.18)"
            />
            <rect
              x={book.x + 4}
              y={BASE - 22}
              width={book.w - 8}
              height="3"
              rx="1.5"
              fill="rgb(20 20 18 / 0.18)"
            />
          </g>
        ))}
      </g>
      {/* Shelfie */}
      <g className="idle-bob">
        <rect x="108" y="22" width="42" height="146" rx="6" fill="#14b8a6" />
        <rect x="108" y="22" width="42" height="146" rx="6" fill="url(#spine)" />
        <rect x="114" y="36" width="30" height="3" rx="1.5" fill="rgb(255 255 255 / 0.55)" />
        <rect x="114" y="148" width="30" height="3" rx="1.5" fill="rgb(255 255 255 / 0.55)" />
        <g className="blink">
          <ellipse cx="121" cy="78" rx="6" ry="7" fill="#fff" />
          <ellipse cx="137" cy="78" rx="6" ry="7" fill="#fff" />
          <circle cx="122.5" cy="79" r="3" fill="#141412" />
          <circle cx="138.5" cy="79" r="3" fill="#141412" />
        </g>
        <path
          d="M122 94q7 6 14 0"
          fill="none"
          stroke="#141412"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="115" cy="90" r="3.2" fill="rgb(255 140 120 / 0.55)" />
        <circle cx="143" cy="90" r="3.2" fill="rgb(255 140 120 / 0.55)" />
      </g>
      <rect x="8" y={BASE} width="244" height="9" rx="4.5" fill="#141412" />
      <defs>
        <linearGradient id="spine" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>
      </defs>
    </svg>
  )
}

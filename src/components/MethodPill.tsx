import type { Method } from '@/lib/site'

// Dark text on a light wash, so every method label passes contrast on its own.
const STYLES: Record<Method, string> = {
  GET: 'bg-[#e7f6f2] text-[#0f766e]',
  POST: 'bg-[#eaf0ff] text-[#1d4ed8]',
  PATCH: 'bg-[#fdf3dc] text-[#92400e]',
  DELETE: 'bg-[#fdecec] text-[#b91c1c]',
}

export function MethodPill({ method }: { method: Method }) {
  return (
    <span
      className={`inline-flex w-16 shrink-0 justify-center rounded-full py-0.5 font-mono text-[11.5px] font-semibold tracking-wide ${STYLES[method]}`}
    >
      {method}
    </span>
  )
}

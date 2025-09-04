'use client'

import Link from 'next/link'
import { computeBgColor } from '@/lib/status-engine'
import { DEFAULT_STATUS_CONFIG, type StatusConfig } from '@/types/status'

export default function DevSmokePage() {
  const tests = [] as { name: string; pass: boolean }[]

  // 1. blend overlay
  const blend = computeBgColor({ base: 'visited', overlays: ['photo'] })
  tests.push({
    name: 'blend overlay',
    pass: blend.bg === '#6f6b5e' && blend.filter === '' && blend.glow.length === 0,
  })

  // 2. glow overlay
  const glow = computeBgColor({ base: 'visited', overlays: ['want'] })
  tests.push({
    name: 'glow overlay',
    pass:
      glow.bg === '#4ea23a' &&
      glow.filter === 'drop-shadow(0 0 6px #f59e0b)' &&
      glow.glow.length === 1,
  })

  // 3. compose order priority
  const priority = computeBgColor(
    { base: 'visited', overlays: ['photo', 'want'] },
    DEFAULT_STATUS_CONFIG,
  )
  tests.push({ name: 'priority order', pass: priority.bg === '#8d6b55' })

  // 4. compose order as-is
  const cfgAsIs: StatusConfig = { ...DEFAULT_STATUS_CONFIG, compose: { order: 'as-is' } }
  const asIs = computeBgColor({ base: 'visited', overlays: ['photo', 'want'] }, cfgAsIs)
  tests.push({ name: 'as-is order', pass: asIs.bg === '#917849' })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Smoke Tests</h1>
        <Link href="/dev/pages" className="text-sm underline">
          /dev/pages
        </Link>
      </div>
      <table className="text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left">Test</th>
            <th className="p-2">Result</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((t) => (
            <tr key={t.name}>
              <td className="p-2">{t.name}</td>
              <td className="p-2">
                <span
                  className={`rounded px-2 py-1 text-white ${
                    t.pass ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {t.pass ? 'PASS' : 'FAIL'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


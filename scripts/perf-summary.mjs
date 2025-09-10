// scripts/perf-summary.mjs
import { promises as fs } from 'node:fs'
import { glob } from 'glob'

function percentile(arr, p) {
  if (!arr.length) return 0
  const a = [...arr].sort((x, y) => x - y)
  const i = Math.max(0, Math.min(a.length - 1, Math.ceil((p / 100) * a.length) - 1))
  return a[i]
}

const files = await glob('**/test-results/**/perf_raw.csv')
const by = {}
for (const f of files) {
  const txt = await fs.readFile(f, 'utf8')
  for (const line of txt.split('\n')) {
    if (!line.trim()) continue
    const [label, msStr] = line.split(',')
    const ms = Number(msStr)
    if (!Number.isFinite(ms)) continue
    ;(by[label] ??= []).push(ms)
  }
}

const rows = Object.entries(by).map(([label, list]) => ({
  label,
  count: list.length,
  p50: percentile(list, 50),
  p95: percentile(list, 95),
  max: Math.max(...list),
}))

let md = `### Perf P95 Summary\n\n| label | n | P50 | **P95** | max |\n|---|---:|---:|---:|---:|\n`
for (const r of rows) md += `| ${r.label} | ${r.count} | ${r.p50}ms | **${r.p95}ms** | ${r.max}ms |\n`
await fs.writeFile('perf-summary.md', md, 'utf8')
console.log(md)


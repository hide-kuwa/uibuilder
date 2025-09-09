'use client'
import { useEffect, useState } from 'react'
import { installPerfTap, summarizeP95, exportPerfCSV } from '@/lib/perfTap'

type Row = { label: string; count: number; p50: number; p95: number; max: number }

export default function PerfPanel() {
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    installPerfTap()
    const id = setInterval(() => setRows(summarizeP95()), 800)
    return () => clearInterval(id)
  }, [])

  if (typeof window !== 'undefined' && new URLSearchParams(location.search).get('perfPanel') !== '1') return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] rounded-xl bg-black/80 text-white p-3 text-xs shadow-lg backdrop-blur">
      <div className="font-semibold mb-2">Perf P95 (live)</div>
      <table className="min-w-[320px]">
        <thead>
          <tr>
            <th className="text-left pr-4">label</th>
            <th>n</th>
            <th>P50</th>
            <th>P95</th>
            <th>max</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="pr-4">{r.label}</td>
              <td className="text-right">{r.count}</td>
              <td className="text-right">{r.p50}ms</td>
              <td className="text-right font-semibold">{r.p95}ms</td>
              <td className="text-right">{r.max}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="mt-2 rounded bg-white/10 px-2 py-1 hover:bg-white/20"
        onClick={() => {
          const blob = new Blob([exportPerfCSV()], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'perf-p95.csv'
          a.click()
          URL.revokeObjectURL(url)
        }}
      >
        Export CSV
      </button>
    </div>
  )
}


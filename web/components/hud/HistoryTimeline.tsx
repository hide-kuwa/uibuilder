'use client'
import { useHistoryStore } from '@/store/historyStore'

export default function HistoryTimeline() {
  const { past, future, apply } = useHistoryStore(s => ({ past: s.past, future: s.future, apply: s.apply }))
  const prev = past.slice(-2)
  const next = future.slice(0, 2)
  const handle = (offset: number) => () => apply(offset)
  return (
    <div className="pointer-events-auto fixed bottom-2 right-2 flex items-center gap-1 text-xs text-zinc-200">
      <span className="opacity-60">←</span>
      {prev.map((_, i) => (
        <button
          key={`p${i}`}
          className="w-2 h-2 rounded-full bg-zinc-500 hover:bg-zinc-400"
          onClick={handle(i - prev.length)}
        />
      ))}
      <div className="w-2 h-2 rounded-full bg-white" />
      {next.map((_, i) => (
        <button
          key={`f${i}`}
          className="w-2 h-2 rounded-full bg-zinc-500 hover:bg-zinc-400"
          onClick={handle(i + 1)}
        />
      ))}
      <span className="opacity-60">→</span>
    </div>
  )
}

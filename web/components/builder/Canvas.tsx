'use client'
import * as React from 'react'

// Minimal client-only Canvas to unblock build; replace with full builder Canvas when ready
export function Canvas({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-black">
      <div
        ref={(n) => {
          // expose ref for callers expecting canvasRef.current
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (canvasRef) canvasRef.current = n as HTMLDivElement | null
        }}
        data-canvas-root
        className="relative w-[1200px] h-[720px] border border-zinc-800 rounded-lg overflow-hidden grid place-items-center text-zinc-300"
      >
        <div>Canvas is initializing…</div>
      </div>
    </div>
  )
}

export default Canvas


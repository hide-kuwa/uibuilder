import type { NextRequest } from 'next/server'

const HEARTBEAT_MS = 15000

export function GET(request: NextRequest): Response {
  const encoder = new TextEncoder()

  let timer: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (payload: string) => controller.enqueue(encoder.encode(payload))

      // Inform the client how often to retry if the connection drops.
      send('retry: 10000\n\n')

      const heartbeat = () => {
        const data = JSON.stringify({ op: 'heartbeat', at: Date.now() })
        send(`event: heartbeat\ndata: ${data}\n\n`)
      }

      timer = setInterval(heartbeat, HEARTBEAT_MS)
      heartbeat()

      const close = () => {
        if (timer) {
          clearInterval(timer)
          timer = null
        }
        try { controller.close() } catch {}
      }

      request.signal.addEventListener('abort', close, { once: true })
      if (request.signal.aborted) close()
    },
    cancel() {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
    },
  })
}

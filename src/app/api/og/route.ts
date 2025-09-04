import { ImageResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('pageId') || 'page'
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#111827',
          fontSize: 64,
          fontWeight: 600,
        }}
      >
        {id}
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

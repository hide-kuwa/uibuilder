import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#f9fafb,#e5e7eb)',
          color: '#111827',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 700 }}>UI Builder Map</div>
        <div style={{ fontSize: 32, marginTop: 16 }}>Discover and share UI components</div>
      </div>
    ),
    size
  )
}

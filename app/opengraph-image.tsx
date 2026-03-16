import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt     = 'GOSSI — Anonymous Campus Tea'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background:     '#080808',
          width:          '100%',
          height:         '100%',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          fontFamily:     'sans-serif',
        }}
      >
        {/* Gradient blob */}
        <div style={{
          position:     'absolute',
          width:        600,
          height:       600,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(255,45,85,0.25) 0%, rgba(191,90,242,0.15) 50%, transparent 75%)',
          top:          15,
          left:         300,
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span style={{ fontSize: 96, fontWeight: 900, color: '#fff', letterSpacing: -3 }}>GOSSI</span>
          <span style={{ fontSize: 80 }}>🔥</span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 32, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
          Anonymous campus tea &amp; confessions
        </p>

        {/* Anon badge */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          10,
          marginTop:    36,
          padding:      '12px 28px',
          background:   'rgba(255,255,255,0.06)',
          borderRadius: 40,
          border:       '1px solid rgba(255,255,255,0.1)',
        }}>
          <span style={{ fontSize: 28 }}>🫥</span>
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)' }}>
            No accounts · No names · No traces
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}

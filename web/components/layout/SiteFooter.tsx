'use client'
import { useEffect, useState } from 'react'

function openPopup(u: string) {
  window.open(u, '_blank', 'noopener,noreferrer,width=560,height=600')
}

function shareTo(site: 'x'|'line'|'facebook') {
  const url = encodeURIComponent(location.href)
  const text = encodeURIComponent(document.title)
  if (site === 'x')        openPopup(`https://x.com/intent/tweet?url=${url}&text=${text}`)
  else if (site === 'line')openPopup(`https://social-plugins.line.me/lineit/share?url=${url}`)
  else                     openPopup(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
}

async function systemShare() {
  const data = { title: document.title, url: location.href }
  if ((navigator as any).share) {
    try { await (navigator as any).share(data); return; } catch {}
  }
  await navigator.clipboard.writeText(data.url).catch(() => {})
  alert('リンクをコピーしました')
}

export default function SiteFooter() {
  const [year, setYear] = useState<string | null>(null)
  useEffect(() => {
    setYear(String(new Date().getFullYear()))
  }, [])

  return (
    <footer className="w-full border-t"
            style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}>
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3">
        <small className="text-[color:var(--muted)]" suppressHydrationWarning>
          © {year ?? ''} UI Builder
        </small>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={systemShare} title="端末の共有メニュー">共有</button>
          <button className="btn btn-sm" onClick={() => shareTo('x')} aria-label="Xで共有">X</button>
          <button className="btn btn-sm" onClick={() => shareTo('line')} aria-label="LINEで共有">LINE</button>
          <button className="btn btn-sm" onClick={() => shareTo('facebook')} aria-label="Facebookで共有">Facebook</button>
        </div>
      </div>
    </footer>
  )
}

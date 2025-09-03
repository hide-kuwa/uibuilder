'use client'
import dynamic from 'next/dynamic'

const animeP = () => import('animejs').then((m) => m.default)

export default function AnimePing() {
  return (
    <button
      className="rounded-lg bg-white/10 px-3 py-2"
      onClick={async (e) => {
        const anime = await animeP()
        const el = e.currentTarget
        anime.remove(el)
        anime({ targets: el, scale: [1, 1.08, 1], duration: 280, easing: 'easeInOutQuad' })
      }}
    >
      ping
    </button>
  )
}


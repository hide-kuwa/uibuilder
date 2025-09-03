'use client'
import AnimePing from '@/components/AnimePing'

export default function AnimeDevPage() {
  return (
    <div className="min-h-[50vh] grid place-items-center p-8">
      <div className="space-y-3 text-center">
        <div className="text-sm opacity-70">Anime.js smoke test</div>
        <AnimePing />
      </div>
    </div>
  )
}


'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h2 className="text-lg font-semibold">問題が発生しました</h2>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>再読み込み</Button>
        <Button onClick={() => router.push('/dev/pages')}>/dev/pages へ</Button>
      </div>
      <details className="mt-4 w-full max-w-lg text-left">
        <summary className="cursor-pointer text-sm opacity-70">詳細</summary>
        <pre className="mt-2 max-h-[50vh] overflow-auto whitespace-pre-wrap text-xs">{String(error.stack || error.message)}</pre>
      </details>
    </div>
  )
}

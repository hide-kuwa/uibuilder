'use client'

export default function PresetsSidebar() {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-2 text-sm font-medium text-gray-700">Presets</div>
      <ul className="space-y-2 text-sm">
        <li className="text-gray-600">Fade / Slide / Scale / Rotate</li>
        <li className="text-gray-600">Bounce / Ground bounce</li>
        <li className="text-gray-600">Arc zoom fade</li>
        <li className="text-gray-600">Follow path</li>
        <li className="text-gray-600">Card shuffle</li>
      </ul>
      <p className="mt-3 text-xs text-gray-500">
        ※ ここはプリセットの目次/説明プレースホルダーです。後で選択UIに差し替えてOK。
      </p>
    </div>
  )
}

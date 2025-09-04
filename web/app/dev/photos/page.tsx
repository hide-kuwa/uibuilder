'use client'
import DriveConnect from '@/components/drive/DriveConnect'
import DriveUploader from '@/components/drive/DriveUploader'

export default function DevPhotosPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium text-gray-700">Google Drive</div>
        <DriveConnect />
        <p className="mt-2 text-xs text-gray-500">最初に接続してからアップロードしてください。</p>
      </section>
      <DriveUploader defaultPref="東京都" />
    </div>
  )
}

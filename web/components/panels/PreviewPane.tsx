'use client'

export default function PreviewPane() {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-2 text-sm font-medium text-gray-700">Preview</div>
      <div className="grid h-48 place-items-center rounded-xl border bg-gradient-to-br from-gray-50 to-gray-100 text-sm text-gray-600">
        Preview area
      </div>
      <p className="mt-2 text-xs text-gray-500">
        /dev/actions では簡易プレビュー、詳細は /dev/motion を利用してください。
      </p>
    </div>
  )
}

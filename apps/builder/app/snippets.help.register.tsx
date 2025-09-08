// apps/builder/app/snippets.help.register.tsx
'use client'
import React from 'react'

// Snippets Help panel (append-only). Adds common formula templates.
function SnippetsHelpPanel() {
  return (
    <div className="p-3 space-y-3 text-sm">
      <b className="block">Snippets Help</b>
      <div className="space-y-2">
        {/* ⑤ 配列を文字列にまとめるパターン（map + join） */}
        <div>
          <div className="text-xs font-semibold opacity-70">5) 配列 → 文字列（map + join）</div>
          <pre className="whitespace-pre-wrap text-xs border rounded p-2">
{`// ラベルだけを抜き出して表示（, 区切り）
(Array.isArray(items) ? items.map(x => x?.label ?? '') : []).join(', ')`}
          </pre>
        </div>

        {/* ⑥ fallback関数による安全参照（存在しないプロパティを穏やかに処理） */}
        <div>
          <div className="text-xs font-semibold opacity-70">6) withFallback 関数で安全に参照</div>
          <pre className="whitespace-pre-wrap text-xs border rounded p-2">
{`// obj.user.name が無い場合は '—' を返す
withFallback(obj, 'user.name', '—')`}
          </pre>
        </div>
      </div>
      {/* 既存の補足メモが他所にあっても邪魔しない */}
    </div>
  )
}

// Soft-register as a right-pane tab when available (append-only)
if (typeof window !== 'undefined' && (window as any).registerRightPaneTab) {
  ;(window as any).registerRightPaneTab({
    key: 'snippets-help',
    label: 'Snippets Help',
    render: () => <SnippetsHelpPanel />,
  })
}

export default SnippetsHelpPanel


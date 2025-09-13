'use client'
type Props = { value: string; onChange: (v: string) => void; 'aria-label'?: string }

export default function ColorInput({ value, onChange, ...a }: Props) {
  const v = (value ?? '').trim()
  const isHex = /^#([0-9a-f]{3,8})$/i.test(v)
  return (
    <div className="flex items-center gap-2">
      {isHex && (
        <input type="color" value={v} onChange={(e)=>onChange(e.target.value)} aria-label={a['aria-label']} />
      )}
      <input
        type="text"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-40 rounded border px-2 py-1 text-xs font-mono"
        aria-label={a['aria-label']}
      />
      <div className="h-5 w-5 rounded border" style={{ background: value }} />
    </div>
  )}


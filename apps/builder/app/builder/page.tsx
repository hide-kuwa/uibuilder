import { Palette } from '@/components/palette/Palette'

export default function Page() {
  return (
    <div className="grid grid-cols-[280px_1fr_320px] h-dvh">
      <aside className="border-r overflow-auto">
        <div className="p-2 text-xs font-medium uppercase text-muted-foreground">Palette</div>
        <Palette />
      </aside>
      {/* center Canvas は既存の実装をそのまま */}
      {/* right Inspector も既存の実装をそのまま */}
    </div>
  )
}
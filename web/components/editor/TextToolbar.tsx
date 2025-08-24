import { useEditorStore } from '@/store/editorStore';

export default function TextToolbar() {
  const sel = useEditorStore((s) => s.textSel);
  const toggle = useEditorStore((s) => s.toggleRunStyle);
  if (!sel || !sel.rect || !sel.nodeId) return null;
  const style: React.CSSProperties = {
    left: sel.rect.x + sel.rect.w / 2,
    top: sel.rect.y,
    transform: 'translate(-50%, -8px)',
  };
  const apply = (s: any) => {
    toggle(sel.nodeId!, { from: sel.start, to: sel.end }, s);
  };
  const onMouseDown = (e: React.MouseEvent) => e.preventDefault();
  return (
    <div className="text-toolbar" style={style} role="toolbar" onMouseDown={onMouseDown} contentEditable={false}>
      <button aria-pressed="false" onClick={() => apply({ fontWeight: 700 })}>
        B
      </button>
      <button aria-pressed="false" onClick={() => apply({ italic: true })}>I</button>
      <button aria-pressed="false" onClick={() => apply({ underline: true })}>U</button>
    </div>
  );
}

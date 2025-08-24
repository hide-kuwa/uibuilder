import { useEffect, useRef } from 'react';
import type { TextNode } from '@/types/editor';
import { useEditorStore } from '@/store/editorStore';
import { readSelection } from '@/lib/text/selection';
import TextToolbar from './TextToolbar';

export default function TextEditor({ node }: { node: TextNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const updateText = useEditorStore((s) => s.updateText);
  const toggleEdit = useEditorStore((s) => s.toggleEditText);
  const setSel = useEditorStore((s) => s.setTextSelection);
  const clearSel = useEditorStore((s) => s.clearTextSelection);
  const sel = useEditorStore((s) => s.textSel);
  const toggleRun = useEditorStore((s) => s.toggleRunStyle);
  const composing = useRef(false);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      className="text-editor"
      contentEditable
      suppressContentEditableWarning
      style={{
        position: 'absolute',
        left: node.props?.x,
        top: node.props?.y,
        minWidth: 1,
        outline: 'none',
        whiteSpace: node.resizeMode === 'AUTO_WIDTH' ? 'nowrap' : 'pre-wrap',
        overflow: node.resizeMode === 'FIXED' ? 'hidden' : undefined,
        width: node.resizeMode === 'AUTO_WIDTH' ? undefined : node.props?.w,
        height: node.resizeMode === 'FIXED' ? node.props?.h : undefined,
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        color: node.style.color,
      }}
      onCompositionStart={() => {
        composing.current = true;
        clearSel();
      }}
      onCompositionEnd={(e) => {
        composing.current = false;
        updateText(node.id, (e.target as HTMLDivElement).innerText);
        const r = readSelection(ref.current!);
        setSel({ nodeId: node.id, start: r.start, end: r.end, rect: r.rect ?? undefined });
      }}
      onInput={(e) => {
        if (!composing.current) {
          updateText(node.id, (e.target as HTMLDivElement).innerText);
        }
      }}
      onSelect={() => {
        const r = readSelection(ref.current!);
        setSel({ nodeId: node.id, start: r.start, end: r.end, rect: r.rect ?? undefined });
      }}
      onBlur={() => clearSel()}
      onKeyUp={() => {
        const r = readSelection(ref.current!);
        setSel({ nodeId: node.id, start: r.start, end: r.end, rect: r.rect ?? undefined });
      }}
      onKeyDown={(e) => {
        if (composing.current) return;
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
          e.preventDefault();
          toggleRun(node.id, { from: sel?.start || 0, to: sel?.end || 0 }, { fontWeight: 700 });
        } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
          e.preventDefault();
          toggleRun(node.id, { from: sel?.start || 0, to: sel?.end || 0 }, { italic: true });
        } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
          e.preventDefault();
          toggleRun(node.id, { from: sel?.start || 0, to: sel?.end || 0 }, { underline: true });
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          toggleEdit(node.id, false);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          toggleEdit(node.id, false);
        }
      }}
    >
      {node.text}
      {node.edit?.active && sel?.nodeId === node.id && sel.start !== sel.end ? (
        <TextToolbar />
      ) : null}
    </div>
  );
}

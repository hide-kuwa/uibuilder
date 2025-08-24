import { useEffect, useRef } from 'react';
import type { TextNode } from '@/types/editor';
import { useEditorStore } from '@/store/editorStore';

export default function TextEditor({ node }: { node: TextNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const updateText = useEditorStore((s) => s.updateText);
  const toggleEdit = useEditorStore((s) => s.toggleEditText);
  const setSel = useEditorStore((s) => s.setTextSelection);
  const clearSel = useEditorStore((s) => s.clearTextSelection);
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
      onCompositionStart={() => (composing.current = true)}
      onCompositionEnd={(e) => {
        composing.current = false;
        updateText(node.id, (e.target as HTMLDivElement).innerText);
      }}
      onInput={(e) => {
        if (!composing.current) {
          updateText(node.id, (e.target as HTMLDivElement).innerText);
        }
      }}
      onSelect={() => {
        const sel = window.getSelection();
        if (sel) {
          const start = sel.anchorOffset || 0;
          const end = sel.focusOffset || 0;
          setSel({ nodeId: node.id, start, end });
        }
      }}
      onBlur={() => clearSel()}
      onKeyDown={(e) => {
        if (composing.current) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          toggleEdit(node.id, false);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          toggleEdit(node.id, false);
        }
      }}
    >
      {node.text}
    </div>
  );
}

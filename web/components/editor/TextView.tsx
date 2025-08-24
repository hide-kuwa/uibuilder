import type { TextNode } from '@/types/editor';

export default function TextView({ node }: { node: TextNode }) {
  const s = node.style;
  const lineHeight = s.lineHeight === 'AUTO' ? undefined : `${s.lineHeight?.px}px`;
  const letterSpacing = s.letterSpacing
    ? s.letterSpacing.unit === 'PX'
      ? `${s.letterSpacing.value}px`
      : `${s.letterSpacing.value}%`
    : undefined;
  const style: React.CSSProperties = {
    position: 'absolute',
    left: node.props?.x,
    top: node.props?.y,
    whiteSpace: node.resizeMode === 'AUTO_WIDTH' ? 'nowrap' : 'pre-wrap',
    overflow: node.resizeMode === 'FIXED' ? 'hidden' : undefined,
    width: node.resizeMode === 'AUTO_WIDTH' ? undefined : node.props?.w,
    height: node.resizeMode === 'FIXED' ? node.props?.h : undefined,
  };
  const spanStyle: React.CSSProperties = {
    fontFamily: s.fontFamily,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    lineHeight,
    letterSpacing,
    color: s.color,
    textAlign: s.textAlign,
    fontStyle: s.italic ? 'italic' : undefined,
    textDecoration: [s.underline && 'underline', s.strike && 'line-through']
      .filter(Boolean)
      .join(' '),
    textTransform: s.uppercase ? 'uppercase' : undefined,
  };

  const content = node.runs?.length
    ? (() => {
        const parts: React.ReactNode[] = [];
        let cursor = 0;
        for (const r of [...node.runs].sort((a, b) => a.from - b.from)) {
          if (cursor < r.from) parts.push(node.text.slice(cursor, r.from));
          const t = node.text.slice(r.from, r.to);
          parts.push(
            <span key={`${r.from}-${r.to}`} style={{
              fontWeight: r.style.fontWeight,
              fontStyle: r.style.italic ? 'italic' : undefined,
              color: r.style.color,
              textDecoration: r.style.link ? 'underline' : r.style.underline ? 'underline' : r.style.strike ? 'line-through' : undefined,
            }}>
              {r.style.link ? <a href={r.style.link}>{t}</a> : t}
            </span>
          );
          cursor = r.to;
        }
        if (cursor < node.text.length) parts.push(node.text.slice(cursor));
        return parts;
      })()
    : node.text;

  return (
    <div style={style}>
      <span style={spanStyle}>{content}</span>
    </div>
  );
}

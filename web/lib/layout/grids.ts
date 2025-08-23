import type { ColumnsGrid, RowsGrid, SquareGrid } from '@/types/editor';

interface Rect { x: number; y: number; w: number; h: number }

export function renderColumns(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  grid: ColumnsGrid,
  zoom: number
) {
  const { count, gutter, margin = 0, color = 'rgba(255,0,0,0.1)' } = grid;
  const colWidth =
    (rect.w - margin * 2 - gutter * (count - 1)) / Math.max(count, 1);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = rect.x + margin + i * (colWidth + gutter);
    ctx.fillRect(x, rect.y, colWidth, rect.h);
  }
  ctx.restore();
}

export function renderRows(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  grid: RowsGrid,
  zoom: number
) {
  const { count, gutter, margin = 0, color = 'rgba(255,0,0,0.1)' } = grid;
  const rowHeight =
    (rect.h - margin * 2 - gutter * (count - 1)) / Math.max(count, 1);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const y = rect.y + margin + i * (rowHeight + gutter);
    ctx.fillRect(rect.x, y, rect.w, rowHeight);
  }
  ctx.restore();
}

export function renderSquareGrid(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  grid: SquareGrid,
  zoom: number
) {
  const size = grid.size;
  const offset = grid.offset || 0;
  const color = grid.color || 'rgba(255,0,0,0.2)';
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 / zoom;
  for (let x = rect.x + offset; x < rect.x + rect.w; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, rect.y);
    ctx.lineTo(x, rect.y + rect.h);
    ctx.stroke();
  }
  for (let y = rect.y + offset; y < rect.y + rect.h; y += size) {
    ctx.beginPath();
    ctx.moveTo(rect.x, y);
    ctx.lineTo(rect.x + rect.w, y);
    ctx.stroke();
  }
  ctx.restore();
}

"use client";

export type InsertAPI = (parentId: string, index: number, node: any) => void;

declare global {
  interface Window {
    builder?: {
      insertNode?: InsertAPI;
      [key: string]: unknown;
    };
  }
}

export function registerInsertAPI(fn: InsertAPI) {
  if (typeof window === 'undefined') return;
  const target: Record<string, unknown> = (window as any).builder || {};
  target.insertNode = fn;
  (window as any).builder = target;
}

export function callInsertAPI(parentId: string, index: number, node: any) {
  if (typeof window === 'undefined') return;
  const fn = (window as any).builder?.insertNode;
  if (typeof fn === 'function') {
    fn(parentId, index, node);
    return;
  }
  window.dispatchEvent(
    new CustomEvent('builder.insertNode', {
      detail: { parentId, index, node },
    }),
  );
}

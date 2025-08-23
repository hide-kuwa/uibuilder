'use client';
import { useEffect } from 'react';
import { keyRouter } from '@/lib/input/keyRouter';

export default function KeyboardHandler() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => keyRouter(e);
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);
  return null;
}

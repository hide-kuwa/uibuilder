'use client';
import { useEffect } from 'react';
import { usePerfStore } from '@/store/perfStore';
import { useEditorStore } from '@/store/editorStore';

export default function PerfHUD() {
  const fps = usePerfStore((s) => s.fps);
  const commit = usePerfStore((s) => s.commitMs[s.commitMs.length - 1] || 0);
  const setFPS = usePerfStore((s) => s.setFPS);
  const show = useEditorStore((s) => s.prefs?.showPerfHud);

  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf: number;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFPS(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [setFPS]);

  if (process.env.NODE_ENV === 'production') return null;
  if (!show) return null;
  return (
    <div className="perf-hud">
      {fps.toFixed(0)} fps | {commit.toFixed(1)} ms
    </div>
  );
}

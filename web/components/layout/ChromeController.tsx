'use client';
import { useEffect } from 'react';
import { usePresetStore } from '@/store/presetStore';

export default function ChromeController() {
  const { header, footer } = usePresetStore(s => s.active().chrome);
  useEffect(() => {
    document.body.classList.toggle('hide-header', !header);
    document.body.classList.toggle('hide-footer', !footer);
  }, [header, footer]);
  return null;
}

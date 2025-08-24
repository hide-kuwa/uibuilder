'use client';

import { useEditorStore } from '@/store/editorStore';

export default function SaveIndicator() {
  const { saveQueue, lastSavedAt, isOffline } = useEditorStore((s) => ({
    saveQueue: s.saveQueue,
    lastSavedAt: s.lastSavedAt,
    isOffline: s.isOffline,
  }));
  let text = 'All changes saved';
  if (isOffline) text = 'Offline';
  else if (saveQueue.length > 0) text = 'Saving…';
  return <div className="text-xs text-gray-500">{text}</div>;
}

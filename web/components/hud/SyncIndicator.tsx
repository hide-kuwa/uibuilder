'use client';

import { useSyncStatus } from '@/lib/sync/SaveQueue';

export default function SyncIndicator() {
  const { status } = useSyncStatus();
  let text = 'Saved';
  if (status === 'syncing') text = 'Syncing…';
  else if (status === 'offline') text = 'Offline';
  return <div className="text-xs text-gray-500">{text}</div>;
}

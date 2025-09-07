// apps/preview/app/publish-summary/page.tsx
'use client';
import React from 'react';
import { PublishSummary } from '@chizu/registry';

export default function Page() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">Publish Summary Preview</h1>
      <PublishSummary flags={{ rounded: true, taxAdjust: false, manualAdjust: true }} />
    </main>
  );
}


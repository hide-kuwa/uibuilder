// apps/preview/app/render-smoke/page.tsx
'use client';
import React from 'react';
import * as R from '@chizu/registry';

export default function Page() {
  const Frame = (R as any)['Frame_Basic'];
  const Text = (R as any)['Text'];
  const runtime: any = {};
  if (typeof Frame !== 'function' || typeof Text !== 'function') {
    return <pre>missing: {String(typeof Frame)} {String(typeof Text)}</pre>;
  }
  return Frame(
    {
      header: <div>Header</div>,
      content: Text({ value: 'Hello from Text', runtime }),
      footer: <div>Footer</div>,
    },
    runtime
  );
}


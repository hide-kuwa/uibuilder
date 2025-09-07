// packages/chizu-ui/src/hooks/useLineage.ts
'use client';
import useSWR from 'swr';
import type { LineageGraph } from '@chizu/types/lineage';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useLineage() {
  const { data, error, isLoading } = useSWR<LineageGraph>('/api/lineage', fetcher, {
    revalidateOnFocus: false,
  });
  return { data, error, isLoading };
}


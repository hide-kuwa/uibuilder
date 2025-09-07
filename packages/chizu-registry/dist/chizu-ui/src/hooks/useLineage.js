// packages/chizu-ui/src/hooks/useLineage.ts
'use client';
import useSWR from 'swr';
const fetcher = (url) => fetch(url).then((r) => r.json());
export function useLineage() {
    const { data, error, isLoading } = useSWR('/api/lineage', fetcher, {
        revalidateOnFocus: false,
    });
    return { data, error, isLoading };
}

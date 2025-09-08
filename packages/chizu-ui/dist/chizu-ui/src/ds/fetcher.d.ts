import { FetchJSONOptions } from './types';
export declare function fetchJSON(url: string, opt?: FetchJSONOptions): Promise<any>;
export type DsFetchOptions = {
    timeoutMs?: number;
    retries?: number;
    backoffMs?: number;
    headers?: Record<string, string>;
    signal?: AbortSignal;
};
/**
 * fetchJSONv2: timeout / retries / backoff / headers 対応版
 * 既存の fetchJSON はそのまま。必要箇所だけこちらに切替可。
 */
export declare function fetchJSONv2(url: string, opts?: DsFetchOptions): Promise<any>;

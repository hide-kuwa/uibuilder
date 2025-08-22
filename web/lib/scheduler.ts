export function rafBatch<T extends (...args: any[]) => void>(fn: T): T {
  let queued = false;
  let lastArgs: any[];
  return ((...args: any[]) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...lastArgs);
    });
  }) as T;
}

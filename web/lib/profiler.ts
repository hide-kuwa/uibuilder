export async function withMeasure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const dur = performance.now() - start;
  try {
    performance.measure(name, {
      start: start,
      duration: dur,
    });
  } catch {
    // noop
  }
  return result;
}

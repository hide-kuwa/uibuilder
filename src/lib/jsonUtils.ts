export function safeParse<T = any>(input: string): { value?: T; error?: Error } {
  try {
    return { value: JSON.parse(input) as T };
  } catch (error) {
    return { error: error as Error };
  }
}

export function prettify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}


export type RecoInput = unknown;
export type RecoResult = { score: number; reason?: string };
export async function recommend(_input: RecoInput): Promise<RecoResult> {
  return { score: 0 };
}

export function projectRows(..._args: any[]): any[] { return []; }

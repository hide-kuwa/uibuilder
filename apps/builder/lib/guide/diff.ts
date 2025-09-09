// apps/builder/lib/guide/diff.ts
export function toUnifiedDiff(filePath: string, before: string, after: string) {
  return `--- a/${filePath}\n+++ b/${filePath}\n@@\n-${before}\n+${after}\n`
}


const tokens = new Map<string, { pageId: string; expiresAt: number }>();

export function createPreviewToken(pageId: string, ttlSeconds = 3600) {
  const token = Math.random().toString(36).slice(2, 10);
  const expiresAt = Date.now() + ttlSeconds * 1000;
  tokens.set(token, { pageId, expiresAt });
  return { token, expiresAt, pageId };
}

export function getPreviewToken(token: string) {
  const info = tokens.get(token);
  if (!info) return null;
  if (info.expiresAt < Date.now()) {
    tokens.delete(token);
    return null;
  }
  return info;
}

export function deletePreviewToken(token: string) {
  tokens.delete(token);
}

export function listPreviewTokens() {
  return Array.from(tokens.entries()).map(([token, v]) => ({ token, ...v }));
}

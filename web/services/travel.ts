/**
 * Placeholder travel service implementations.
 * Real logic will be copied from the travel app once available.
 */

export async function signInWithGoogle(): Promise<void> {
  throw new Error('signInWithGoogle not implemented');
}

export function onUser(_cb: (user: unknown) => void): () => void {
  // immediately emit null user; return unsubscribe noop
  _cb(null);
  return () => void 0;
}

export async function signOutNow(): Promise<void> {
  // no-op
}

export async function createMap(): Promise<{ id: string }> {
  return { id: 'stub' };
}

export async function getMap(): Promise<unknown> {
  return null;
}

export async function uploadMapPhoto(): Promise<null> {
  return null;
}

export async function requestFollow(): Promise<void> {}

export async function approveFollower(): Promise<void> {}

export async function setVisibility(): Promise<void> {}

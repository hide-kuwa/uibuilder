export function isMockEnabled(): boolean {
  const local = typeof localStorage !== 'undefined' && localStorage.getItem('useMock');
  if (local === 'true') return true;
  if (local === 'false') return false;
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}

/**
 * Mock travel service implementations using `localStorage`.
 * Replace with real Firebase logic once the travel app becomes available.
 */

type User = { uid: string }

let currentUser: User | null = null
const listeners = new Set<(u: User | null) => void>()

// load persisted user on module init in browser
if (typeof window !== 'undefined') {
  const raw = localStorage.getItem('demo-user')
  if (raw) currentUser = JSON.parse(raw)
}

const notify = () => listeners.forEach(cb => cb(currentUser))

export async function signInWithGoogle(): Promise<void> {
  currentUser = { uid: 'demo' }
  if (typeof window !== 'undefined')
    localStorage.setItem('demo-user', JSON.stringify(currentUser))
  notify()
}

export function onUser(cb: (user: User | null) => void): () => void {
  listeners.add(cb)
  cb(currentUser)
  return () => listeners.delete(cb)
}

export async function signOutNow(): Promise<void> {
  currentUser = null
  if (typeof window !== 'undefined') localStorage.removeItem('demo-user')
  notify()
}

export async function createMap(b64: string): Promise<{ id: string }> {
  if (!currentUser) throw new Error('no user')
  const id = Math.random().toString(36).slice(2, 10)
  if (typeof window !== 'undefined')
    localStorage.setItem(`map:${currentUser.uid}:${id}`, b64)
  return { id }
}

export async function getMap(uid: string, mapId: string): Promise<string | null> {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(`map:${uid}:${mapId}`)
}

export async function uploadMapPhoto(): Promise<null> {
  return null
}

export async function requestFollow(): Promise<void> {}

export async function approveFollower(): Promise<void> {}

export async function setVisibility(): Promise<void> {}


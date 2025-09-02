/**
 * Mock travel service implementations using `localStorage`.
 * Replace with real Firebase logic once the travel app becomes available.
 */

type User = { uid: string }
type Visibility = 'public' | 'followers' | 'private'

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
  if (typeof window !== 'undefined') {
    localStorage.setItem(`map:${currentUser.uid}:${id}`, b64)
    localStorage.setItem(`visibility:${currentUser.uid}:${id}`, 'public')
  }
  return { id }
}

export async function getMap(uid: string, mapId: string): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const vis =
    (localStorage.getItem(`visibility:${uid}:${mapId}`) as Visibility | null) ||
    'public'
  if (vis === 'private' && currentUser?.uid !== uid) return null
  if (vis === 'followers' && currentUser?.uid !== uid) {
    const key = `follow:${uid}:${currentUser?.uid}`
    if (!localStorage.getItem(key)) return null
  }
  return localStorage.getItem(`map:${uid}:${mapId}`)
}

export async function setVisibility(
  uid: string,
  mapId: string,
  v: Visibility,
): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.setItem(`visibility:${uid}:${mapId}`, v)
}

export async function uploadMapPhoto(
  uid: string,
  mapId: string,
  file: File,
): Promise<string> {
  if (typeof window === 'undefined') return ''
  const url = URL.createObjectURL(file)
  const key = `photos:${uid}:${mapId}`
  const arr = JSON.parse(localStorage.getItem(key) || '[]') as string[]
  arr.push(url)
  localStorage.setItem(key, JSON.stringify(arr))
  return url
}

export async function getMapPhotos(
  uid: string,
  mapId: string,
): Promise<string[]> {
  if (typeof window === 'undefined') return []
  const key = `photos:${uid}:${mapId}`
  return JSON.parse(localStorage.getItem(key) || '[]') as string[]
}

export async function requestFollow(ownerUid: string): Promise<void> {
  if (!currentUser || currentUser.uid === ownerUid) return
  if (typeof window === 'undefined') return
  localStorage.setItem(`request:${ownerUid}:${currentUser.uid}`, '1')
}

export async function getFollowRequests(ownerUid: string): Promise<string[]> {
  if (typeof window === 'undefined') return []
  return Object.keys(localStorage)
    .filter(k => k.startsWith(`request:${ownerUid}:`))
    .map(k => k.split(':')[2])
}

export async function approveFollower(
  ownerUid: string,
  followerUid: string,
): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`request:${ownerUid}:${followerUid}`)
  localStorage.setItem(`follow:${ownerUid}:${followerUid}`, '1')
}

export function isFollower(ownerUid: string, followerUid: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`follow:${ownerUid}:${followerUid}`) === '1'
}

export function hasPendingFollow(
  ownerUid: string,
  followerUid: string,
): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`request:${ownerUid}:${followerUid}`) === '1'
}

export async function getVisibility(
  uid: string,
  mapId: string,
): Promise<Visibility> {
  if (typeof window === 'undefined') return 'public'
  return (
    (localStorage.getItem(`visibility:${uid}:${mapId}`) as Visibility | null) ||
    'public'
  )
}


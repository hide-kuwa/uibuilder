import { auth, db, storage, googleProvider } from '@/lib/firebase'
// @ts-ignore firebase types
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
// @ts-ignore firebase types
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
// @ts-ignore firebase types
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export type User = { uid: string }
export type Visibility = 'public' | 'followers' | 'private'

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider)
}

export function onUser(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb)
}

export async function signOutNow(): Promise<void> {
  await signOut(auth)
}

export async function createMap(
  uid: string,
  data: { title?: string; paintB64: string; visibility?: Visibility },
): Promise<string> {
  const id = crypto.randomUUID()
  await setDoc(doc(collection(db, 'users', uid, 'maps'), id), {
    title: data.title ?? 'My Map',
    paintB64: data.paintB64,
    visibility: data.visibility ?? 'public',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

export async function getMap(
  uid: string,
  mapId: string,
): Promise<{ paintB64: string; visibility: Visibility; title?: string } | null> {
  const refDoc = doc(db, 'users', uid, 'maps', mapId)
  const snap = await getDoc(refDoc)
  if (!snap.exists()) return null
  const data = snap.data() as any
  return {
    paintB64: data.paintB64 ?? data.b64,
    visibility: (data.visibility ?? (data.public ? 'public' : 'private')) as Visibility,
    title: data.title,
  }
}

export async function setVisibility(
  uid: string,
  mapId: string,
  v: Visibility,
): Promise<void> {
  const refDoc = doc(db, 'users', uid, 'maps', mapId)
  await updateDoc(refDoc, { visibility: v })
}

export async function requestFollow(ownerUid: string): Promise<void> {
  const me = auth.currentUser
  if (!me) throw new Error('no user')
  const refDoc = doc(db, 'users', ownerUid, 'followers', me.uid)
  await setDoc(refDoc, {
    status: 'requested',
    createdAt: serverTimestamp(),
  })
}

export async function approveFollower(followerUid: string): Promise<void> {
  const me = auth.currentUser
  if (!me) throw new Error('no user')
  const refDoc = doc(db, 'users', me.uid, 'followers', followerUid)
  await updateDoc(refDoc, { status: 'approved' })
}

export async function listPendingFollowers(
  meUid: string,
): Promise<Array<{ uid: string; createdAt: any }>> {
  const q = query(
    collection(db, 'users', meUid, 'followers'),
    where('status', '==', 'requested'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ uid: d.id, ...(d.data() as any) }))
}

export type MapDoc = {
  title: string
  paintB64: string
  visibility: Visibility
  createdAt?: any
  updatedAt?: any
  _id?: string
  _owner?: string
}

export async function listPublicMaps(max = 30): Promise<MapDoc[]> {
  const qy = query(
    collectionGroup(db, 'maps'),
    where('visibility', '==', 'public'),
    orderBy('updatedAt', 'desc'),
    limit(max),
  )
  const snap = await getDocs(qy)
  return snap.docs.map(d => {
    const [, uid, , mapId] = d.ref.path.split('/')
    return { ...(d.data() as any), _id: mapId, _owner: uid } as MapDoc
  })
}

export async function listUserMaps(uid: string, max = 50): Promise<MapDoc[]> {
  const qy = query(
    collection(db, 'users', uid, 'maps'),
    orderBy('updatedAt', 'desc'),
    limit(max),
  )
  const snap = await getDocs(qy)
  return snap.docs.map(d => ({ ...(d.data() as any), _id: d.id, _owner: uid }) as MapDoc)
}

export async function listApprovedOwnersFor(meUid: string): Promise<string[]> {
  const qy = query(
    collectionGroup(db, 'followers'),
    where('__name__', '==', meUid),
    where('status', '==', 'approved'),
  )
  const snap = await getDocs(qy)
  const owners = new Set<string>()
  snap.forEach(d => {
    const parts = d.ref.path.split('/')
    if (parts.length >= 4) owners.add(parts[1])
  })
  return [...owners]
}

export async function listOwnerMapsForFeed(
  ownerUid: string,
  maxPerOwner = 10,
): Promise<MapDoc[]> {
  const qy = query(
    collection(db, 'users', ownerUid, 'maps'),
    where('visibility', 'in', ['public', 'followers']),
    orderBy('updatedAt', 'desc'),
    limit(maxPerOwner),
  )
  const snap = await getDocs(qy)
  return snap.docs.map(d => ({ ...(d.data() as any), _id: d.id, _owner: ownerUid }))
}

export async function listFollowingFeed(
  meUid: string,
  maxPerOwner = 5,
): Promise<MapDoc[]> {
  const owners = await listApprovedOwnersFor(meUid)
  if (!owners.length) return []
  const chunks = await Promise.all(
    owners.map(uid => listOwnerMapsForFeed(uid, maxPerOwner)),
  )
  const all = chunks.flat()
  all.sort((a, b) => {
    const ta = a.updatedAt?.toMillis?.() ?? 0
    const tb = b.updatedAt?.toMillis?.() ?? 0
    return tb - ta
  })
  return all
}

export async function getUserProfile(
  uid: string,
): Promise<{ displayName?: string; photoURL?: string } | null> {
  const s = await getDoc(doc(db, 'users', uid))
  return s.exists() ? (s.data() as { displayName?: string; photoURL?: string }) : null
}

export async function uploadMapPhoto(
  uid: string,
  mapId: string,
  file: File,
  caption?: string,
): Promise<string> {
  const fileId = Math.random().toString(36).slice(2)
  const storageRef = ref(storage, `maps/${uid}/${mapId}/${fileId}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  await addDoc(collection(db, 'users', uid, 'maps', mapId, 'photos'), {
    url,
    caption: caption ?? '',
    createdAt: serverTimestamp(),
  })
  return url
}

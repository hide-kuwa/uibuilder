import { auth, db, storage, googleProvider } from '@/lib/firebase'
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'
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

export async function createMap(b64: string): Promise<{ id: string }> {
  const user = auth.currentUser
  if (!user) throw new Error('no user')
  const refDoc = await addDoc(collection(db, 'users', user.uid, 'maps'), {
    b64,
    visibility: 'public',
    createdAt: serverTimestamp(),
  })
  return { id: refDoc.id }
}

export async function getMap(
  uid: string,
  mapId: string,
): Promise<{ b64: string; visibility: Visibility } | null> {
  const refDoc = doc(db, 'users', uid, 'maps', mapId)
  const snap = await getDoc(refDoc)
  if (!snap.exists()) return null
  const data = snap.data() as any
  return { b64: data.b64, visibility: data.visibility as Visibility }
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

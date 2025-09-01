import { collection, addDoc } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'
import { firebaseApp } from './firebase'
import { trackEvent } from './analytics'

export const createPlan = async (data: Record<string, any>) => {
  const db = getFirestore(firebaseApp)
  const ref = await addDoc(collection(db, 'plans'), data)
  trackEvent('plan_created')
  return ref.id
}

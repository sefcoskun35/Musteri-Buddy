import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

export async function getAllResults() {
  const snapshot = await getDocs(
    query(collection(db, 'results'), orderBy('completedAt', 'desc')),
  )

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))
}

export async function reopenExam(resultId) {
  await updateDoc(doc(db, 'results', resultId), {
    active: false,
  })
}

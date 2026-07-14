import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const normalizeText = (value) =>
  String(value ?? '').trim().toLocaleLowerCase('tr-TR')

function getParticipant() {
  return JSON.parse(
    sessionStorage.getItem('musteriBuddyParticipant') || 'null',
  )
}

export async function hasCompletedCategory(categoryId) {
  const participant = getParticipant()

  if (!participant) return false

  const snapshot = await getDocs(
    query(
      collection(db, 'results'),
      where('storeCode', '==', participant.storeCode),
    ),
  )

  return snapshot.docs.some((document) => {
    const result = document.data()

    return (
      result.active !== false &&
      result.categoryId === categoryId &&
      normalizeText(result.fullName) === normalizeText(participant.fullName)
    )
  })
}

export async function saveExamResult(result) {
  const participant = getParticipant()

  if (!participant) {
    throw new Error('Katılımcı bilgisi bulunamadı.')
  }

  const alreadyCompleted = await hasCompletedCategory(result.categoryId)

  if (alreadyCompleted) {
    throw new Error('Bu kategori sınavını daha önce tamamladınız.')
  }

  const documentReference = await addDoc(collection(db, 'results'), {
    fullName: participant.fullName,
    normalizedFullName: normalizeText(participant.fullName),
    storeCode: participant.storeCode,
    storeName: participant.storeName,
    categoryId: result.categoryId,
    categoryName: result.categoryName,
    correctCount: result.correctCount,
    wrongCount: result.wrongCount,
    totalQuestions: result.totalQuestions,
    score: result.score,
    duration: result.duration,
    attemptNumber: 1,
    active: true,
    completedAt: serverTimestamp(),
  })

  return documentReference.id
}

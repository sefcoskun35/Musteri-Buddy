import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

const QUESTIONS_COLLECTION = 'questions'

const normalizeText = (value) => String(value ?? '').trim()

export async function uploadQuestions(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Yüklenecek geçerli soru bulunamadı.')
  }

  const batchSize = 450
  let uploadedCount = 0

  for (let start = 0; start < rows.length; start += batchSize) {
    const chunk = rows.slice(start, start + batchSize)
    const batch = writeBatch(db)

    chunk.forEach((row) => {
      const questionRef = doc(collection(db, QUESTIONS_COLLECTION))

      batch.set(questionRef, {
        category: normalizeText(row.kategori),
        question: normalizeText(row.soru),
        options: [
          normalizeText(row.secenek_a),
          normalizeText(row.secenek_b),
          normalizeText(row.secenek_c),
          normalizeText(row.secenek_d),
        ],
        correctAnswer: normalizeText(row.dogru_secenek).toUpperCase(),
        explanation: normalizeText(row.aciklama),
        active: true,
        createdAt: serverTimestamp(),
      })
    })

    await batch.commit()
    uploadedCount += chunk.length
  }

  return uploadedCount
}

export async function getQuestionsByCategory(category) {
  const snapshot = await getDocs(collection(db, QUESTIONS_COLLECTION))
  const normalizedCategory = normalizeText(category).toLocaleLowerCase('tr-TR')

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data(),
    }))
    .filter((question) => {
      const questionCategory = normalizeText(
        question.category,
      ).toLocaleLowerCase('tr-TR')

      return question.active !== false && questionCategory === normalizedCategory
    })
}

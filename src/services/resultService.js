import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { createUserId } from './userService'

const RESULTS_COLLECTION = 'results'
const USERS_COLLECTION = 'users'
const PASSING_SCORE = 70

const normalizeText = (value) =>
  String(value ?? '').trim().toLocaleLowerCase('tr-TR')

function getParticipant() {
  try {
    return JSON.parse(
      sessionStorage.getItem('musteriBuddyParticipant') || 'null',
    )
  } catch {
    return null
  }
}

export async function hasCompletedCategory(categoryId) {
  const participant = getParticipant()

  if (!participant || !categoryId) {
    return false
  }

  const snapshot = await getDocs(
    query(
      collection(db, RESULTS_COLLECTION),
      where('storeCode', '==', participant.storeCode),
    ),
  )

  return snapshot.docs.some((resultDocument) => {
    const result = resultDocument.data()

    return (
      result.active !== false &&
      result.categoryId === categoryId &&
      normalizeText(result.fullName) ===
        normalizeText(participant.fullName)
    )
  })
}

export async function saveExamResult(result) {
  const participant = getParticipant()

  if (!participant) {
    throw new Error('Katılımcı bilgisi bulunamadı.')
  }

  const fullName = String(participant.fullName || '').trim()
  const storeCode = String(participant.storeCode || '').trim()
  const storeName = String(participant.storeName || '').trim()
  const categoryId = String(result?.categoryId || '').trim()
  const categoryName = String(
    result?.categoryName || result?.categoryId || '',
  ).trim()

  if (!fullName || !storeCode) {
    throw new Error('Katılımcı bilgileri eksik.')
  }

  if (!categoryId) {
    throw new Error('Kategori bilgisi bulunamadı.')
  }

  const alreadyCompleted = await hasCompletedCategory(categoryId)

  if (alreadyCompleted) {
    throw new Error('Bu kategori sınavını daha önce tamamladınız.')
  }

  const numericScore = Math.max(
    0,
    Math.min(100, Number(result.score || 0)),
  )

  const correctCount = Math.max(
    0,
    Number(result.correctCount || 0),
  )

  const wrongCount = Math.max(
    0,
    Number(result.wrongCount || 0),
  )

  const totalQuestions = Math.max(
    0,
    Number(result.totalQuestions || 0),
  )

  const duration = Math.max(
    0,
    Number(result.duration || 0),
  )

  const userId =
    participant.id || createUserId(fullName, storeCode)

  const userReference = doc(
    db,
    USERS_COLLECTION,
    userId,
  )

  const resultReference = doc(
    collection(db, RESULTS_COLLECTION),
  )

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userReference)

    if (userSnapshot.exists()) {
      const currentUser = userSnapshot.data()

      if (
        currentUser.blocked === true ||
        currentUser.active === false
      ) {
        throw new Error(
          currentUser.blockedReason ||
            'Bu kullanıcının sınava giriş yetkisi kapatılmıştır.',
        )
      }

      const previousExamCount = Number(
        currentUser.examCount || 0,
      )

      const previousTotalScore = Number(
        currentUser.totalScore || 0,
      )

      const nextExamCount = previousExamCount + 1
      const nextTotalScore =
        previousTotalScore + numericScore

      const previousCategories = Array.isArray(
        currentUser.completedCategories,
      )
        ? currentUser.completedCategories
        : []

      const completedCategories = categoryName
        ? Array.from(
            new Set([
              ...previousCategories,
              categoryName,
            ]),
          )
        : previousCategories

      transaction.update(userReference, {
        fullName,
        normalizedFullName: normalizeText(fullName),
        storeCode,
        storeName,

        examCount: nextExamCount,
        totalScore: nextTotalScore,
        averageScore: Math.round(
          nextTotalScore / nextExamCount,
        ),
        bestScore: Math.max(
          Number(currentUser.bestScore || 0),
          numericScore,
        ),
        lastScore: numericScore,

        passedExamCount:
          Number(currentUser.passedExamCount || 0) +
          (numericScore >= PASSING_SCORE ? 1 : 0),

        failedExamCount:
          Number(currentUser.failedExamCount || 0) +
          (numericScore < PASSING_SCORE ? 1 : 0),

        completedCategories,
        lastExamAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } else {
      transaction.set(userReference, {
        fullName,
        normalizedFullName: normalizeText(fullName),
        storeCode,
        storeName,

        active: true,
        blocked: false,
        blockedReason: '',

        examCount: 1,
        passedExamCount:
          numericScore >= PASSING_SCORE ? 1 : 0,
        failedExamCount:
          numericScore < PASSING_SCORE ? 1 : 0,
        totalScore: numericScore,
        averageScore: Math.round(numericScore),
        bestScore: numericScore,
        lastScore: numericScore,

        completedCategories: categoryName
          ? [categoryName]
          : [],

        lastExamAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    transaction.set(resultReference, {
      userId,
      fullName,
      normalizedFullName: normalizeText(fullName),
      storeCode,
      storeName,

      categoryId,
      categoryName,

      correctCount,
      wrongCount,
      totalQuestions,
      score: numericScore,
      duration,

      attemptNumber: 1,
      active: true,
      completedAt: serverTimestamp(),
    })
  })

  return resultReference.id
}
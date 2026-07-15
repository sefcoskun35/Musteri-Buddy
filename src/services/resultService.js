import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { createUserId } from './userService'

const RESULTS_COLLECTION = 'results'
const USERS_COLLECTION = 'users'
const LEADERBOARDS_COLLECTION = 'leaderboards'
const PASSING_SCORE = 70

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLocaleLowerCase('tr-TR')

const cleanText = (value) =>
  String(value ?? '').trim()

const createSafeDocumentId = (...parts) =>
  parts
    .map((part) =>
      cleanText(part)
        .toLocaleLowerCase('tr-TR')
        .replace(/[^a-z0-9çğıöşü_-]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
    )
    .filter(Boolean)
    .join('__')

const getParticipant = () => {
  try {
    return JSON.parse(
      sessionStorage.getItem(
        'musteriBuddyParticipant',
      ) || 'null',
    )
  } catch {
    return null
  }
}

const getParticipantIdentity = (
  participant,
) => {
  const fullName = cleanText(
    participant?.fullName,
  )

  const storeCode = cleanText(
    participant?.storeCode,
  )

  const storeName = cleanText(
    participant?.storeName,
  )

  const userId =
    cleanText(participant?.id) ||
    createUserId(
      fullName,
      storeCode,
    )

  return {
    userId,
    fullName,
    normalizedFullName:
      normalizeText(fullName),
    storeCode,
    storeName,
  }
}

const createResultId = (
  userId,
  categoryId,
) =>
  createSafeDocumentId(
    userId,
    categoryId,
  )

const createLeaderboardId = (
  storeCode,
  categoryId,
  userId,
) =>
  createSafeDocumentId(
    storeCode,
    categoryId,
    userId,
  )

const normalizeScore = (value) =>
  Math.max(
    0,
    Math.min(
      100,
      Number(value || 0),
    ),
  )

const normalizePositiveNumber = (
  value,
) =>
  Math.max(
    0,
    Number(value || 0),
  )

export async function hasCompletedCategory(
  categoryId,
) {
  const participant =
    getParticipant()

  const normalizedCategoryId =
    cleanText(categoryId)

  if (
    !participant ||
    !normalizedCategoryId
  ) {
    return false
  }

  const {
    userId,
    fullName,
    storeCode,
  } = getParticipantIdentity(
    participant,
  )

  if (
    !userId ||
    !fullName ||
    !storeCode
  ) {
    return false
  }

  const resultId =
    createResultId(
      userId,
      normalizedCategoryId,
    )

  if (!resultId) {
    return false
  }

  const resultSnapshot =
    await getDoc(
      doc(
        db,
        RESULTS_COLLECTION,
        resultId,
      ),
    )

  if (!resultSnapshot.exists()) {
    return false
  }

  return (
    resultSnapshot.data()
      ?.active !== false
  )
}

export async function saveExamResult(
  result,
) {
  const participant =
    getParticipant()

  if (!participant) {
    throw new Error(
      'Katılımcı bilgisi bulunamadı.',
    )
  }

  const {
    userId,
    fullName,
    normalizedFullName,
    storeCode,
    storeName,
  } = getParticipantIdentity(
    participant,
  )

  const categoryId =
    cleanText(result?.categoryId)

  const categoryName =
    cleanText(
      result?.categoryName ||
        result?.categoryId,
    )

  if (
    !userId ||
    !fullName ||
    !storeCode
  ) {
    throw new Error(
      'Katılımcı bilgileri eksik.',
    )
  }

  if (
    !categoryId ||
    !categoryName
  ) {
    throw new Error(
      'Kategori bilgisi bulunamadı.',
    )
  }

  const numericScore =
    normalizeScore(result?.score)

  const correctCount =
    normalizePositiveNumber(
      result?.correctCount,
    )

  const wrongCount =
    normalizePositiveNumber(
      result?.wrongCount,
    )

  const totalQuestions =
    normalizePositiveNumber(
      result?.totalQuestions,
    )

  const duration =
    normalizePositiveNumber(
      result?.duration,
    )

  const passed =
    numericScore >= PASSING_SCORE

  const resultId =
    createResultId(
      userId,
      categoryId,
    )

  const leaderboardId =
    createLeaderboardId(
      storeCode,
      categoryId,
      userId,
    )

  if (
    !resultId ||
    !leaderboardId
  ) {
    throw new Error(
      'Sonuç kimliği oluşturulamadı.',
    )
  }

  const userReference = doc(
    db,
    USERS_COLLECTION,
    userId,
  )

  const resultReference = doc(
    db,
    RESULTS_COLLECTION,
    resultId,
  )

  const leaderboardReference =
    doc(
      db,
      LEADERBOARDS_COLLECTION,
      leaderboardId,
    )

  await runTransaction(
    db,
    async (transaction) => {
      const [
        userSnapshot,
        resultSnapshot,
      ] = await Promise.all([
        transaction.get(
          userReference,
        ),
        transaction.get(
          resultReference,
        ),
      ])

      if (
        resultSnapshot.exists() &&
        resultSnapshot.data()
          ?.active !== false
      ) {
        throw new Error(
          'Bu kategori sınavını daha önce tamamladınız.',
        )
      }

      if (userSnapshot.exists()) {
        const currentUser =
          userSnapshot.data()

        if (
          currentUser.blocked ===
            true ||
          currentUser.active ===
            false
        ) {
          throw new Error(
            currentUser.blockedReason ||
              'Bu kullanıcının sınava giriş yetkisi kapatılmıştır.',
          )
        }

        const previousExamCount =
          Number(
            currentUser.examCount ||
              0,
          )

        const previousTotalScore =
          Number(
            currentUser.totalScore ||
              0,
          )

        const nextExamCount =
          previousExamCount + 1

        const nextTotalScore =
          previousTotalScore +
          numericScore

        const previousCategories =
          Array.isArray(
            currentUser.completedCategories,
          )
            ? currentUser.completedCategories
            : []

        const completedCategories =
          Array.from(
            new Set([
              ...previousCategories,
              categoryName,
            ]),
          )

        transaction.update(
          userReference,
          {
            fullName,
            normalizedFullName,
            storeCode,
            storeName,

            examCount:
              nextExamCount,
            totalScore:
              nextTotalScore,
            averageScore:
              Math.round(
                nextTotalScore /
                  nextExamCount,
              ),
            bestScore:
              Math.max(
                Number(
                  currentUser.bestScore ||
                    0,
                ),
                numericScore,
              ),
            lastScore:
              numericScore,

            passedExamCount:
              Number(
                currentUser.passedExamCount ||
                  0,
              ) +
              (passed ? 1 : 0),

            failedExamCount:
              Number(
                currentUser.failedExamCount ||
                  0,
              ) +
              (passed ? 0 : 1),

            completedCategories,
            lastExamAt:
              serverTimestamp(),
            updatedAt:
              serverTimestamp(),
          },
        )
      } else {
        transaction.set(
          userReference,
          {
            fullName,
            normalizedFullName,
            storeCode,
            storeName,

            active: true,
            blocked: false,
            blockedReason: '',

            examCount: 1,
            passedExamCount:
              passed ? 1 : 0,
            failedExamCount:
              passed ? 0 : 1,
            totalScore:
              numericScore,
            averageScore:
              Math.round(
                numericScore,
              ),
            bestScore:
              numericScore,
            lastScore:
              numericScore,

            completedCategories: [
              categoryName,
            ],

            lastExamAt:
              serverTimestamp(),
            lastLoginAt:
              serverTimestamp(),
            createdAt:
              serverTimestamp(),
            updatedAt:
              serverTimestamp(),
          },
        )
      }

      const resultData = {
        userId,
        fullName,
        normalizedFullName,
        storeCode,
        storeName,

        categoryId,
        categoryName,

        correctCount,
        wrongCount,
        totalQuestions,
        score: numericScore,
        duration,
        passed,
        passingScore:
          PASSING_SCORE,

        attemptNumber: 1,
        active: true,
        completedAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp(),
      }

      transaction.set(
        resultReference,
        resultData,
      )

      transaction.set(
        leaderboardReference,
        {
          resultId,
          userId,
          fullName,
          normalizedFullName,
          storeCode,
          storeName,

          categoryId,
          categoryName,

          score: numericScore,
          duration,
          correctCount,
          wrongCount,
          totalQuestions,

          passed,
          active: true,

          completedAt:
            serverTimestamp(),
          updatedAt:
            serverTimestamp(),
        },
      )
    },
  )

  return resultId
}
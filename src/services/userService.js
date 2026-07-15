import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const USERS_COLLECTION = 'users'

const normalizeText = (value) =>
  String(value ?? '').trim().toLocaleLowerCase('tr-TR')

const normalizeIdentifier = (value) =>
  normalizeText(value)
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const createUserId = (fullName, storeCode) => {
  const normalizedStoreCode =
    normalizeIdentifier(storeCode) || 'magaza'

  const normalizedFullName =
    normalizeIdentifier(fullName) || 'kullanici'

  return `${normalizedStoreCode}-${normalizedFullName}`
}

const prepareParticipant = (participant) => {
  const fullName = String(participant?.fullName || '').trim()
  const storeCode = String(participant?.storeCode || '').trim()
  const storeName = String(participant?.storeName || '').trim()

  if (!fullName) {
    throw new Error('Ad soyad bilgisi bulunamadı.')
  }

  if (!storeCode) {
    throw new Error('Mağaza kodu bilgisi bulunamadı.')
  }

  return {
    id: createUserId(fullName, storeCode),
    fullName,
    normalizedFullName: normalizeText(fullName),
    storeCode,
    storeName,
  }
}

export async function registerOrGetUser(participant) {
  const preparedParticipant = prepareParticipant(participant)
  const userReference = doc(
    db,
    USERS_COLLECTION,
    preparedParticipant.id,
  )

  const userSnapshot = await getDoc(userReference)

  if (userSnapshot.exists()) {
    const existingUser = {
      id: userSnapshot.id,
      ...userSnapshot.data(),
    }

    if (
      existingUser.blocked === true ||
      existingUser.active === false
    ) {
      throw new Error(
        existingUser.blockedReason ||
          'Bu kullanıcının sınava giriş yetkisi kapatılmıştır.',
      )
    }

    await updateDoc(userReference, {
      fullName: preparedParticipant.fullName,
      normalizedFullName:
        preparedParticipant.normalizedFullName,
      storeCode: preparedParticipant.storeCode,
      storeName: preparedParticipant.storeName,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      ...existingUser,
      fullName: preparedParticipant.fullName,
      normalizedFullName:
        preparedParticipant.normalizedFullName,
      storeCode: preparedParticipant.storeCode,
      storeName: preparedParticipant.storeName,
    }
  }

  const newUser = {
    fullName: preparedParticipant.fullName,
    normalizedFullName:
      preparedParticipant.normalizedFullName,
    storeCode: preparedParticipant.storeCode,
    storeName: preparedParticipant.storeName,

    active: true,
    blocked: false,
    blockedReason: '',

    examCount: 0,
    passedExamCount: 0,
    failedExamCount: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    lastScore: 0,

    completedCategories: [],
    lastExamAt: null,
    lastLoginAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(userReference, newUser)

  return {
    id: preparedParticipant.id,
    ...newUser,
  }
}

export async function getUserByParticipant(
  fullName,
  storeCode,
) {
  const userId = createUserId(fullName, storeCode)
  const userSnapshot = await getDoc(
    doc(db, USERS_COLLECTION, userId),
  )

  if (!userSnapshot.exists()) {
    return null
  }

  return {
    id: userSnapshot.id,
    ...userSnapshot.data(),
  }
}

export async function isUserAllowed(
  fullName,
  storeCode,
) {
  const user = await getUserByParticipant(
    fullName,
    storeCode,
  )

  if (!user) {
    return {
      allowed: true,
      user: null,
      reason: '',
    }
  }

  if (user.blocked === true) {
    return {
      allowed: false,
      user,
      reason:
        user.blockedReason ||
        'Bu kullanıcının sınava giriş yetkisi kapatılmıştır.',
    }
  }

  if (user.active === false) {
    return {
      allowed: false,
      user,
      reason: 'Bu kullanıcı pasif durumdadır.',
    }
  }

  return {
    allowed: true,
    user,
    reason: '',
  }
}

export async function updateUserExamStatistics({
  fullName,
  storeCode,
  storeName,
  score,
  categoryId,
  categoryName,
}) {
  const preparedParticipant = prepareParticipant({
    fullName,
    storeCode,
    storeName,
  })

  const numericScore = Math.max(
    0,
    Math.min(100, Number(score || 0)),
  )

  const userReference = doc(
    db,
    USERS_COLLECTION,
    preparedParticipant.id,
  )

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userReference)

    const categoryValue = String(
      categoryName || categoryId || '',
    ).trim()

    if (!userSnapshot.exists()) {
      transaction.set(userReference, {
        fullName: preparedParticipant.fullName,
        normalizedFullName:
          preparedParticipant.normalizedFullName,
        storeCode: preparedParticipant.storeCode,
        storeName: preparedParticipant.storeName,

        active: true,
        blocked: false,
        blockedReason: '',

        examCount: 1,
        passedExamCount: numericScore >= 70 ? 1 : 0,
        failedExamCount: numericScore >= 70 ? 0 : 1,
        totalScore: numericScore,
        averageScore: Math.round(numericScore),
        bestScore: numericScore,
        lastScore: numericScore,

        completedCategories: categoryValue
          ? [categoryValue]
          : [],

        lastExamAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return
    }

    const currentUser = userSnapshot.data()

    if (
      currentUser.blocked === true ||
      currentUser.active === false
    ) {
      throw new Error(
        currentUser.blockedReason ||
          'Bu kullanıcının işlem yetkisi kapatılmıştır.',
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

    const completedCategories = categoryValue
      ? Array.from(
          new Set([
            ...previousCategories,
            categoryValue,
          ]),
        )
      : previousCategories

    transaction.update(userReference, {
      fullName: preparedParticipant.fullName,
      normalizedFullName:
        preparedParticipant.normalizedFullName,
      storeCode: preparedParticipant.storeCode,
      storeName: preparedParticipant.storeName,

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
        numericScore >= 70
          ? increment(1)
          : Number(currentUser.passedExamCount || 0),

      failedExamCount:
        numericScore < 70
          ? increment(1)
          : Number(currentUser.failedExamCount || 0),

      completedCategories,
      lastExamAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })

  return preparedParticipant.id
}

export async function getAllUsers() {
  const snapshot = await getDocs(
    collection(db, USERS_COLLECTION),
  )

  return snapshot.docs
    .map((userDocument) => ({
      id: userDocument.id,
      ...userDocument.data(),
    }))
    .sort((firstUser, secondUser) => {
      const firstName = String(
        firstUser.fullName || '',
      )

      const secondName = String(
        secondUser.fullName || '',
      )

      return firstName.localeCompare(
        secondName,
        'tr',
      )
    })
}

export async function setUserBlockedStatus(
  userId,
  blocked,
  reason = '',
) {
  if (!userId) {
    throw new Error('Kullanıcı kimliği bulunamadı.')
  }

  const userReference = doc(
    db,
    USERS_COLLECTION,
    userId,
  )

  await updateDoc(userReference, {
    blocked: Boolean(blocked),
    active: !blocked,
    blockedReason: blocked
      ? String(reason || '').trim()
      : '',
    blockedAt: blocked
      ? serverTimestamp()
      : null,
    updatedAt: serverTimestamp(),
  })

  return true
}

export async function setUserActiveStatus(
  userId,
  active,
) {
  if (!userId) {
    throw new Error('Kullanıcı kimliği bulunamadı.')
  }

  await updateDoc(
    doc(db, USERS_COLLECTION, userId),
    {
      active: Boolean(active),
      blocked: active ? false : undefined,
      blockedReason: active ? '' : undefined,
      updatedAt: serverTimestamp(),
    },
  )

  return true
}

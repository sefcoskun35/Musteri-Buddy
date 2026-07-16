import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  getAllUsers,
  setUserBlockedStatus,
} from './userService'

const USERS_COLLECTION = 'users'
const RESULTS_COLLECTION = 'results'
const LEADERBOARDS_COLLECTION = 'leaderboards'
const BATCH_LIMIT = 450

const normalizeText = (value) =>
  String(value ?? '').trim()

const getTimestampValue = (value) => {
  if (!value) {
    return 0
  }

  if (
    typeof value?.toMillis ===
    'function'
  ) {
    return value.toMillis()
  }

  if (
    typeof value?.seconds ===
    'number'
  ) {
    return value.seconds * 1000
  }

  const date = new Date(value)

  return Number.isNaN(
    date.getTime(),
  )
    ? 0
    : date.getTime()
}

const deleteDocumentsInBatches =
  async (documentReferences) => {
    if (
      !Array.isArray(
        documentReferences,
      ) ||
      documentReferences.length === 0
    ) {
      return 0
    }

    let deletedCount = 0

    for (
      let start = 0;
      start <
      documentReferences.length;
      start += BATCH_LIMIT
    ) {
      const chunk =
        documentReferences.slice(
          start,
          start + BATCH_LIMIT,
        )

      const batch =
        writeBatch(db)

      chunk.forEach(
        (documentReference) => {
          batch.delete(
            documentReference,
          )
        },
      )

      await batch.commit()

      deletedCount +=
        chunk.length
    }

    return deletedCount
  }

const getDocumentsByUserId =
  async (
    collectionName,
    userId,
  ) => {
    const snapshot =
      await getDocs(
        query(
          collection(
            db,
            collectionName,
          ),
          where(
            'userId',
            '==',
            userId,
          ),
        ),
      )

    return snapshot.docs.map(
      (documentSnapshot) =>
        documentSnapshot.ref,
    )
  }

export async function getManagedUsers() {
  const users =
    await getAllUsers()

  return users
    .map((user) => ({
      id: user.id,

      fullName: normalizeText(
        user.fullName,
      ),

      normalizedFullName:
        normalizeText(
          user.normalizedFullName,
        ),

      storeCode: normalizeText(
        user.storeCode,
      ),

      storeName: normalizeText(
        user.storeName,
      ),

      examCount: Number(
        user.examCount || 0,
      ),

      totalScore: Number(
        user.totalScore || 0,
      ),

      averageScore: Number(
        user.averageScore || 0,
      ),

      bestScore: Number(
        user.bestScore || 0,
      ),

      lastScore: Number(
        user.lastScore || 0,
      ),

      passedExamCount: Number(
        user.passedExamCount || 0,
      ),

      failedExamCount: Number(
        user.failedExamCount || 0,
      ),

      categories: Array.isArray(
        user.completedCategories,
      )
        ? user.completedCategories
        : [],

      active:
        user.active !== false,

      blocked:
        user.blocked === true,

      blockedReason:
        normalizeText(
          user.blockedReason,
        ),

      blockedAt:
        user.blockedAt || null,

      lastExamAt:
        user.lastExamAt || null,

      lastLoginAt:
        user.lastLoginAt || null,

      createdAt:
        user.createdAt || null,

      updatedAt:
        user.updatedAt || null,

      lastExamAtValue:
        getTimestampValue(
          user.lastExamAt,
        ),

      lastLoginAtValue:
        getTimestampValue(
          user.lastLoginAt,
        ),
    }))
    .sort(
      (
        firstUser,
        secondUser,
      ) => {
        if (
          firstUser.blocked !==
          secondUser.blocked
        ) {
          return (
            Number(
              firstUser.blocked,
            ) -
            Number(
              secondUser.blocked,
            )
          )
        }

        if (
          secondUser.lastLoginAtValue !==
          firstUser.lastLoginAtValue
        ) {
          return (
            secondUser.lastLoginAtValue -
            firstUser.lastLoginAtValue
          )
        }

        return firstUser.fullName.localeCompare(
          secondUser.fullName,
          'tr',
        )
      },
    )
}

export async function blockManagedUser(
  user,
  reason = '',
) {
  if (!user?.id) {
    throw new Error(
      'Engellenecek kullanıcı bulunamadı.',
    )
  }

  await setUserBlockedStatus(
    user.id,
    true,
    reason,
  )

  return true
}

export async function unblockManagedUser(
  userId,
) {
  const normalizedUserId =
    normalizeText(userId)

  if (!normalizedUserId) {
    throw new Error(
      'Aktifleştirilecek kullanıcı bulunamadı.',
    )
  }

  await setUserBlockedStatus(
    normalizedUserId,
    false,
    '',
  )

  return true
}

export async function deleteManagedUser(
  user,
) {
  const userId =
    normalizeText(user?.id)

  if (!userId) {
    throw new Error(
      'Silinecek kullanıcı bulunamadı.',
    )
  }

  const [
    resultReferences,
    leaderboardReferences,
  ] = await Promise.all([
    getDocumentsByUserId(
      RESULTS_COLLECTION,
      userId,
    ),
    getDocumentsByUserId(
      LEADERBOARDS_COLLECTION,
      userId,
    ),
  ])

  const [
    deletedResultCount,
    deletedLeaderboardCount,
  ] = await Promise.all([
    deleteDocumentsInBatches(
      resultReferences,
    ),
    deleteDocumentsInBatches(
      leaderboardReferences,
    ),
  ])

  await deleteDoc(
    doc(
      db,
      USERS_COLLECTION,
      userId,
    ),
  )

  return {
    userId,
    deletedResultCount,
    deletedLeaderboardCount,
  }
}
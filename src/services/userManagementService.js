import {
  getAllUsers,
  setUserBlockedStatus,
} from './userService'

const getTimestampValue = (value) => {
  if (!value) {
    return 0
  }

  if (typeof value?.toMillis === 'function') {
    return value.toMillis()
  }

  if (typeof value?.seconds === 'number') {
    return value.seconds * 1000
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export async function getManagedUsers() {
  const users = await getAllUsers()

  return users
    .map((user) => ({
      id: user.id,
      fullName: String(user.fullName || '').trim(),
      normalizedFullName: String(
        user.normalizedFullName || '',
      ).trim(),

      storeCode: String(user.storeCode || '').trim(),
      storeName: String(user.storeName || '').trim(),

      examCount: Number(user.examCount || 0),
      totalScore: Number(user.totalScore || 0),
      averageScore: Number(user.averageScore || 0),
      bestScore: Number(user.bestScore || 0),
      lastScore: Number(user.lastScore || 0),

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

      active: user.active !== false,
      blocked: user.blocked === true,

      blockedReason: String(
        user.blockedReason || '',
      ).trim(),

      blockedAt: user.blockedAt || null,
      lastExamAt: user.lastExamAt || null,
      lastLoginAt: user.lastLoginAt || null,
      createdAt: user.createdAt || null,
      updatedAt: user.updatedAt || null,

      lastExamAtValue: getTimestampValue(
        user.lastExamAt,
      ),

      lastLoginAtValue: getTimestampValue(
        user.lastLoginAt,
      ),
    }))
    .sort((firstUser, secondUser) => {
      if (firstUser.blocked !== secondUser.blocked) {
        return Number(firstUser.blocked) -
          Number(secondUser.blocked)
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
    })
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

export async function unblockManagedUser(userId) {
  if (!userId) {
    throw new Error(
      'Aktifleştirilecek kullanıcı bulunamadı.',
    )
  }

  await setUserBlockedStatus(
    userId,
    false,
    '',
  )

  return true
}
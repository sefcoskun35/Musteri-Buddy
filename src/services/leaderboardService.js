import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const LEADERBOARDS_COLLECTION = 'leaderboards'
const DEFAULT_PAGE_SIZE = 100
const MAX_PAGE_SIZE = 500

const normalizeText = (value) =>
  String(value ?? '').trim()

const normalizePageSize = (value) => {
  const parsedValue = Number(value)

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.min(
    parsedValue,
    MAX_PAGE_SIZE,
  )
}

const mapLeaderboardDocument = (
  documentSnapshot,
) => ({
  id: documentSnapshot.id,
  ...documentSnapshot.data(),
})

const buildLeaderboardQuery = ({
  storeCode = '',
  categoryId = '',
  categoryName = '',
  activeOnly = true,
  pageSize = DEFAULT_PAGE_SIZE,
  lastDocument = null,
} = {}) => {
  const constraints = []

  if (normalizeText(storeCode)) {
    constraints.push(
      where(
        'storeCode',
        '==',
        normalizeText(storeCode),
      ),
    )
  }

  if (normalizeText(categoryId)) {
    constraints.push(
      where(
        'categoryId',
        '==',
        normalizeText(categoryId),
      ),
    )
  } else if (
    normalizeText(categoryName)
  ) {
    constraints.push(
      where(
        'categoryName',
        '==',
        normalizeText(categoryName),
      ),
    )
  }

  if (activeOnly) {
    constraints.push(
      where('active', '==', true),
    )
  }

  constraints.push(
    orderBy('score', 'desc'),
    orderBy('duration', 'asc'),
    orderBy('completedAt', 'asc'),
  )

  if (lastDocument) {
    constraints.push(
      startAfter(lastDocument),
    )
  }

  constraints.push(
    limit(
      normalizePageSize(pageSize),
    ),
  )

  return query(
    collection(
      db,
      LEADERBOARDS_COLLECTION,
    ),
    ...constraints,
  )
}

export async function getLeaderboardPage({
  storeCode = '',
  categoryId = '',
  categoryName = '',
  activeOnly = true,
  pageSize = DEFAULT_PAGE_SIZE,
  lastDocument = null,
} = {}) {
  const leaderboardQuery =
    buildLeaderboardQuery({
      storeCode,
      categoryId,
      categoryName,
      activeOnly,
      pageSize,
      lastDocument,
    })

  const snapshot =
    await getDocs(
      leaderboardQuery,
    )

  return {
    items: snapshot.docs.map(
      mapLeaderboardDocument,
    ),
    lastDocument:
      snapshot.docs[
        snapshot.docs.length - 1
      ] || null,
    hasMore:
      snapshot.docs.length ===
      normalizePageSize(pageSize),
  }
}

export async function getAllLeaderboardEntries({
  storeCode = '',
  categoryId = '',
  categoryName = '',
  activeOnly = true,
  batchSize = 250,
  maximumResults = 10000,
} = {}) {
  const safeBatchSize =
    normalizePageSize(batchSize)

  const safeMaximumResults =
    Math.max(
      safeBatchSize,
      Number(maximumResults) ||
        10000,
    )

  const entries = []
  let lastDocument = null
  let hasMore = true

  while (
    hasMore &&
    entries.length <
      safeMaximumResults
  ) {
    const remainingCount =
      safeMaximumResults -
      entries.length

    const currentPageSize =
      Math.min(
        safeBatchSize,
        remainingCount,
      )

    const page =
      await getLeaderboardPage({
        storeCode,
        categoryId,
        categoryName,
        activeOnly,
        pageSize:
          currentPageSize,
        lastDocument,
      })

    entries.push(...page.items)

    lastDocument =
      page.lastDocument

    hasMore =
      page.hasMore &&
      Boolean(lastDocument)
  }

  return entries
}

export async function getStoreCategoryLeaderboard({
  storeCode,
  categoryId = '',
  categoryName = '',
  pageSize = 100,
  lastDocument = null,
} = {}) {
  if (
    !normalizeText(storeCode)
  ) {
    throw new Error(
      'Mağaza kodu zorunludur.',
    )
  }

  if (
    !normalizeText(categoryId) &&
    !normalizeText(categoryName)
  ) {
    throw new Error(
      'Kategori bilgisi zorunludur.',
    )
  }

  return getLeaderboardPage({
    storeCode,
    categoryId,
    categoryName,
    activeOnly: true,
    pageSize,
    lastDocument,
  })
}
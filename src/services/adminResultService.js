import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const RESULTS_COLLECTION = 'results'
const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100

const normalizeText = (value) =>
  String(value ?? '').trim()

const normalizePageSize = (pageSize) => {
  const parsedPageSize = Number(pageSize)

  if (
    !Number.isInteger(parsedPageSize) ||
    parsedPageSize <= 0
  ) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.min(
    parsedPageSize,
    MAX_PAGE_SIZE,
  )
}

const mapResultDocument = (
  documentSnapshot,
) => ({
  id: documentSnapshot.id,
  ...documentSnapshot.data(),
})

const buildResultsQuery = ({
  pageSize = DEFAULT_PAGE_SIZE,
  lastDocument = null,
  storeCode = '',
  categoryName = '',
  activeOnly = true,
} = {}) => {
  const constraints = []

  if (activeOnly) {
    constraints.push(
      where('active', '!=', false),
    )
  }

  if (normalizeText(storeCode)) {
    constraints.push(
      where(
        'storeCode',
        '==',
        normalizeText(storeCode),
      ),
    )
  }

  if (normalizeText(categoryName)) {
    constraints.push(
      where(
        'categoryName',
        '==',
        normalizeText(categoryName),
      ),
    )
  }

  constraints.push(
    orderBy('completedAt', 'desc'),
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
      RESULTS_COLLECTION,
    ),
    ...constraints,
  )
}

export async function getResultsPage({
  pageSize = DEFAULT_PAGE_SIZE,
  lastDocument = null,
  storeCode = '',
  categoryName = '',
  activeOnly = true,
} = {}) {
  const resultsQuery =
    buildResultsQuery({
      pageSize,
      lastDocument,
      storeCode,
      categoryName,
      activeOnly,
    })

  const snapshot =
    await getDocs(resultsQuery)

  const items = snapshot.docs.map(
    mapResultDocument,
  )

  return {
    items,
    lastDocument:
      snapshot.docs[
        snapshot.docs.length - 1
      ] || null,
    hasMore:
      snapshot.docs.length ===
      normalizePageSize(pageSize),
  }
}

export async function getAllResults({
  batchSize = 100,
  storeCode = '',
  categoryName = '',
  activeOnly = true,
  maximumResults = 5000,
} = {}) {
  const safeBatchSize =
    normalizePageSize(batchSize)

  const safeMaximumResults =
    Math.max(
      safeBatchSize,
      Number(
        maximumResults,
      ) || 5000,
    )

  const allResults = []
  let lastDocument = null
  let hasMore = true

  while (
    hasMore &&
    allResults.length <
      safeMaximumResults
  ) {
    const remainingCount =
      safeMaximumResults -
      allResults.length

    const currentPageSize =
      Math.min(
        safeBatchSize,
        remainingCount,
      )

    const page =
      await getResultsPage({
        pageSize:
          currentPageSize,
        lastDocument,
        storeCode,
        categoryName,
        activeOnly,
      })

    allResults.push(
      ...page.items,
    )

    lastDocument =
      page.lastDocument

    hasMore =
      page.hasMore &&
      Boolean(lastDocument)
  }

  return allResults
}

export async function getStoreCategoryResults({
  storeCode,
  categoryName,
  pageSize = DEFAULT_PAGE_SIZE,
  lastDocument = null,
} = {}) {
  if (
    !normalizeText(storeCode) ||
    !normalizeText(categoryName)
  ) {
    throw new Error(
      'Mağaza kodu ve kategori adı zorunludur.',
    )
  }

  return getResultsPage({
    pageSize,
    lastDocument,
    storeCode,
    categoryName,
    activeOnly: true,
  })
}

export async function reopenExam(
  resultId,
) {
  const normalizedResultId =
    normalizeText(resultId)

  if (!normalizedResultId) {
    throw new Error(
      'Sonuç kimliği bulunamadı.',
    )
  }

  await updateDoc(
    doc(
      db,
      RESULTS_COLLECTION,
      normalizedResultId,
    ),
    {
      active: false,
    },
  )
}
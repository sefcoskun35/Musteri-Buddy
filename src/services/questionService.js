import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

const QUESTIONS_COLLECTION = 'questions'
const ANSWER_LETTERS = ['A', 'B', 'C', 'D']
const BATCH_LIMIT = 450

const CATEGORY_DEFINITIONS = {
  health: {
    name: 'Health',
    aliases: [
      'health',
      'healthy',
      'healt',
    ],
  },
  'personal care': {
    name: 'Personal Care',
    aliases: [
      'personal care',
      'personalcare',
      'personel care',
      'personelcare',
    ],
  },
  'hair care': {
    name: 'Hair Care',
    aliases: [
      'hair care',
      'haircare',
    ],
  },
  'general merchandise': {
    name: 'General Merchandise',
    aliases: [
      'general merchandise',
      'generalmerchandise',
    ],
  },
}

const preserveText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return ''
  }

  return String(value)
}

const hasText = (value) =>
  preserveText(value).trim().length > 0

const normalizeCategoryKey = (value) => {
  const normalizedValue =
    preserveText(value)
      .trim()
      .toLocaleLowerCase('tr-TR')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')

  const matchedCategory =
    Object.entries(
      CATEGORY_DEFINITIONS,
    ).find(
      ([categoryKey, definition]) =>
        categoryKey ===
          normalizedValue ||
        definition.aliases.includes(
          normalizedValue,
        ),
    )

  return matchedCategory
    ? matchedCategory[0]
    : normalizedValue
}

const getCategoryName = (value) => {
  const categoryKey =
    normalizeCategoryKey(value)

  return (
    CATEGORY_DEFINITIONS[
      categoryKey
    ]?.name ||
    preserveText(value).trim()
  )
}

const normalizeCorrectAnswer = (
  value,
) => {
  if (
    typeof value === 'number' &&
    Number.isInteger(value)
  ) {
    if (
      value >= 0 &&
      value <= 3
    ) {
      return ANSWER_LETTERS[value]
    }

    if (
      value >= 1 &&
      value <= 4
    ) {
      return ANSWER_LETTERS[
        value - 1
      ]
    }
  }

  const normalizedValue =
    preserveText(value)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '')

  if (
    ANSWER_LETTERS.includes(
      normalizedValue,
    )
  ) {
    return normalizedValue
  }

  const numericValue =
    Number(normalizedValue)

  if (
    Number.isInteger(
      numericValue,
    ) &&
    numericValue >= 1 &&
    numericValue <= 4
  ) {
    return ANSWER_LETTERS[
      numericValue - 1
    ]
  }

  if (
    Number.isInteger(
      numericValue,
    ) &&
    numericValue >= 0 &&
    numericValue <= 3
  ) {
    return ANSWER_LETTERS[
      numericValue
    ]
  }

  return ''
}

const getOptionText = (option) => {
  if (
    option &&
    typeof option === 'object' &&
    !Array.isArray(option)
  ) {
    return preserveText(
      option.text ??
        option.label ??
        option.value,
    )
  }

  return preserveText(option)
}

const createOptions = (
  data,
  correctAnswer,
) => {
  const sourceOptions =
    Array.isArray(data.options) &&
    data.options.length >= 4
      ? data.options
      : [
          data.secenek_a,
          data.secenek_b,
          data.secenek_c,
          data.secenek_d,
        ]

  const correctIndex =
    ANSWER_LETTERS.indexOf(
      correctAnswer,
    )

  return ANSWER_LETTERS.map(
    (_, index) => {
      const sourceOption =
        sourceOptions[index]

      const objectCorrect =
        sourceOption &&
        typeof sourceOption ===
          'object' &&
        sourceOption.isCorrect === true

      return {
        text:
          getOptionText(
            sourceOption,
          ),
        isCorrect:
          correctIndex >= 0
            ? index === correctIndex
            : objectCorrect,
      }
    },
  )
}

const mapQuestionDocument = (
  documentSnapshot,
) => {
  const data =
    documentSnapshot.data()

  const correctAnswer =
    normalizeCorrectAnswer(
      data.correctAnswer ??
        data.dogru_secenek,
    )

  return {
    id: documentSnapshot.id,
    ...data,

    category: preserveText(
      data.category ??
        data.kategori,
    ),

    categoryKey:
      normalizeCategoryKey(
        data.categoryKey ??
          data.category ??
          data.kategori,
      ),

    question: preserveText(
      data.question ??
        data.soru,
    ),

    correctAnswer,

    options: createOptions(
      data,
      correctAnswer,
    ),
  }
}

const isValidQuestion = (
  question,
  requestedCategoryKey,
) => {
  const options =
    Array.isArray(question.options)
      ? question.options
      : []

  const correctOptionCount =
    options.filter(
      (option) =>
        option.isCorrect === true,
    ).length

  return (
    question.active !== false &&
    question.categoryKey ===
      requestedCategoryKey &&
    hasText(question.question) &&
    options.length === 4 &&
    options.every((option) =>
      hasText(option.text),
    ) &&
    correctOptionCount === 1
  )
}

const deleteDocumentsInBatches =
  async (documents) => {
    let deletedCount = 0

    for (
      let start = 0;
      start < documents.length;
      start += BATCH_LIMIT
    ) {
      const batch =
        writeBatch(db)

      const chunk =
        documents.slice(
          start,
          start + BATCH_LIMIT,
        )

      chunk.forEach(
        (documentSnapshot) => {
          batch.delete(
            documentSnapshot.ref,
          )
        },
      )

      await batch.commit()

      deletedCount +=
        chunk.length
    }

    return deletedCount
  }

const getCategoryDocuments =
  async (categoryKey) => {
    const snapshot =
      await getDocs(
        collection(
          db,
          QUESTIONS_COLLECTION,
        ),
      )

    return snapshot.docs.filter(
      (documentSnapshot) => {
        const data =
          documentSnapshot.data()

        const documentCategoryKey =
          normalizeCategoryKey(
            data.categoryKey ??
              data.category ??
              data.kategori,
          )

        return (
          documentCategoryKey ===
          categoryKey
        )
      },
    )
  }

const replaceCategoryQuestions =
  async (
    categoryKey,
    categoryRows,
  ) => {
    const existingDocuments =
      await getCategoryDocuments(
        categoryKey,
      )

    await deleteDocumentsInBatches(
      existingDocuments,
    )

    let uploadedCount = 0

    for (
      let start = 0;
      start <
      categoryRows.length;
      start += BATCH_LIMIT
    ) {
      const batch =
        writeBatch(db)

      const chunk =
        categoryRows.slice(
          start,
          start + BATCH_LIMIT,
        )

      chunk.forEach((row) => {
        const correctAnswer =
          normalizeCorrectAnswer(
            row.dogru_secenek,
          )

        const optionTexts = [
          preserveText(
            row.secenek_a,
          ),
          preserveText(
            row.secenek_b,
          ),
          preserveText(
            row.secenek_c,
          ),
          preserveText(
            row.secenek_d,
          ),
        ]

        const questionReference =
          doc(
            collection(
              db,
              QUESTIONS_COLLECTION,
            ),
          )

        batch.set(
          questionReference,
          {
            category:
              getCategoryName(
                row.kategori,
              ),

            categoryKey,

            question:
              preserveText(
                row.soru,
              ),

            options:
              optionTexts.map(
                (
                  text,
                  index,
                ) => ({
                  text,
                  isCorrect:
                    ANSWER_LETTERS[
                      index
                    ] ===
                    correctAnswer,
                }),
              ),

            correctAnswer,

            explanation:
              preserveText(
                row.aciklama,
              ),

            active: true,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
        )
      })

      await batch.commit()

      uploadedCount +=
        chunk.length
    }

    return uploadedCount
  }

export async function uploadQuestions(
  rows,
) {
  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    throw new Error(
      'Yüklenecek soru bulunamadı.',
    )
  }

  const validRows = rows.filter(
    (row) => {
      const correctAnswer =
        normalizeCorrectAnswer(
          row?.dogru_secenek,
        )

      return (
        hasText(row?.kategori) &&
        hasText(row?.soru) &&
        hasText(row?.secenek_a) &&
        hasText(row?.secenek_b) &&
        hasText(row?.secenek_c) &&
        hasText(row?.secenek_d) &&
        Boolean(correctAnswer)
      )
    },
  )

  if (
    validRows.length === 0
  ) {
    throw new Error(
      'Excel dosyasında geçerli soru bulunamadı.',
    )
  }

  const categoryGroups =
    new Map()

  validRows.forEach((row) => {
    const categoryKey =
      normalizeCategoryKey(
        row.kategori,
      )

    if (
      !categoryGroups.has(
        categoryKey,
      )
    ) {
      categoryGroups.set(
        categoryKey,
        [],
      )
    }

    categoryGroups
      .get(categoryKey)
      .push(row)
  })

  let uploadedCount = 0

  for (
    const [
      categoryKey,
      categoryRows,
    ] of categoryGroups
  ) {
    uploadedCount +=
      await replaceCategoryQuestions(
        categoryKey,
        categoryRows,
      )
  }

  return uploadedCount
}

export async function getQuestionsByCategory(
  category,
) {
  const requestedCategoryKey =
    normalizeCategoryKey(category)

  try {
    const categorySnapshot =
      await getDocs(
        query(
          collection(
            db,
            QUESTIONS_COLLECTION,
          ),
          where(
            'categoryKey',
            '==',
            requestedCategoryKey,
          ),
        ),
      )

    const categoryQuestions =
      categorySnapshot.docs
        .map(
          mapQuestionDocument,
        )
        .filter((question) =>
          isValidQuestion(
            question,
            requestedCategoryKey,
          ),
        )

    if (
      categoryQuestions.length > 0
    ) {
      return categoryQuestions
    }
  } catch (error) {
    console.warn(
      'Kategori sorgusu çalışmadı:',
      error,
    )
  }

  const allSnapshot =
    await getDocs(
      collection(
        db,
        QUESTIONS_COLLECTION,
      ),
    )

  return allSnapshot.docs
    .map(mapQuestionDocument)
    .filter((question) =>
      isValidQuestion(
        question,
        requestedCategoryKey,
      ),
    )
}
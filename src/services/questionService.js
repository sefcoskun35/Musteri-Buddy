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

const CATEGORY_CONFIG = {
  health: {
    canonicalName: 'Health',
    aliases: [
      'Health',
      'Healthy',
      'Healt',
      'health',
      'healthy',
      'healt',
    ],
  },
  'personal care': {
    canonicalName: 'Personal Care',
    aliases: [
      'Personal Care',
      'personal care',
      'PersonalCare',
      'personalcare',
      'personal-care',
    ],
  },
  'hair care': {
    canonicalName: 'Hair Care',
    aliases: [
      'Hair Care',
      'hair care',
      'HairCare',
      'haircare',
      'hair-care',
    ],
  },
  'general merchandise': {
    canonicalName: 'General Merchandise',
    aliases: [
      'General Merchandise',
      'general merchandise',
      'GeneralMerchandise',
      'generalmerchandise',
      'general-merchandise',
    ],
  },
}

const normalizeText = (value) =>
  String(value ?? '').trim()

const normalizeCategory = (value) => {
  const normalizedValue = normalizeText(value)
    .toLocaleLowerCase('tr-TR')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const aliases = {
    health: 'health',
    healthy: 'health',
    healt: 'health',

    'personal care': 'personal care',
    personalcare: 'personal care',

    'hair care': 'hair care',
    haircare: 'hair care',

    'general merchandise':
      'general merchandise',
    generalmerchandise:
      'general merchandise',
  }

  return (
    aliases[normalizedValue] ||
    normalizedValue
  )
}

const getCategoryConfig = (value) => {
  const normalizedCategory =
    normalizeCategory(value)

  return (
    CATEGORY_CONFIG[
      normalizedCategory
    ] || {
      canonicalName:
        normalizeText(value),
      aliases: [
        normalizeText(value),
      ].filter(Boolean),
    }
  )
}

const getCanonicalCategoryName = (
  value,
) =>
  getCategoryConfig(value)
    .canonicalName

const normalizeCorrectAnswer = (
  value,
) => {
  const normalizedValue =
    normalizeText(value)
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
    numericValue >= 0 &&
    numericValue <= 3
  ) {
    return ANSWER_LETTERS[
      numericValue
    ]
  }

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

  return ''
}

const normalizeOptions = (
  options,
  correctAnswer,
) => {
  const normalizedCorrectAnswer =
    normalizeCorrectAnswer(
      correctAnswer,
    )

  const sourceOptions =
    Array.isArray(options)
      ? options
      : []

  return ANSWER_LETTERS.map(
    (letter, index) => {
      const sourceOption =
        sourceOptions[index]

      const text =
        typeof sourceOption ===
        'string'
          ? normalizeText(
              sourceOption,
            )
          : normalizeText(
              sourceOption?.text ??
                sourceOption?.label ??
                sourceOption?.value,
            )

      const isCorrect =
        typeof sourceOption
          ?.isCorrect ===
        'boolean'
          ? sourceOption.isCorrect
          : letter ===
            normalizedCorrectAnswer

      return {
        text,
        isCorrect,
      }
    },
  )
}

const normalizeQuestionDocument = (
  documentSnapshot,
) => {
  const data =
    documentSnapshot.data()

  const correctAnswer =
    normalizeCorrectAnswer(
      data.correctAnswer,
    )

  return {
    id: documentSnapshot.id,
    ...data,
    category: normalizeText(
      data.category,
    ),
    question: normalizeText(
      data.question,
    ),
    correctAnswer,
    options: normalizeOptions(
      data.options,
      correctAnswer,
    ),
  }
}

const isValidQuestion = (
  question,
  requestedCategory,
) => {
  const questionCategory =
    normalizeCategory(
      question.category,
    )

  const hasValidOptions =
    Array.isArray(
      question.options,
    ) &&
    question.options.length ===
      4 &&
    question.options.every(
      (option) =>
        Boolean(
          normalizeText(
            option.text,
          ),
        ),
    )

  const correctOptionCount =
    question.options.filter(
      (option) =>
        option.isCorrect === true,
    ).length

  return (
    question.active !== false &&
    questionCategory ===
      requestedCategory &&
    Boolean(
      normalizeText(
        question.question,
      ),
    ) &&
    hasValidOptions &&
    correctOptionCount === 1
  )
}

export async function uploadQuestions(
  rows,
) {
  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    throw new Error(
      'Yüklenecek geçerli soru bulunamadı.',
    )
  }

  const validRows = rows.filter(
    (row) => {
      const category =
        normalizeText(
          row?.kategori,
        )

      const question =
        normalizeText(
          row?.soru,
        )

      const options = [
        normalizeText(
          row?.secenek_a,
        ),
        normalizeText(
          row?.secenek_b,
        ),
        normalizeText(
          row?.secenek_c,
        ),
        normalizeText(
          row?.secenek_d,
        ),
      ]

      const correctAnswer =
        normalizeCorrectAnswer(
          row?.dogru_secenek,
        )

      return (
        category &&
        question &&
        options.every(Boolean) &&
        correctAnswer
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

  const batchSize = 450
  let uploadedCount = 0

  for (
    let start = 0;
    start < validRows.length;
    start += batchSize
  ) {
    const chunk =
      validRows.slice(
        start,
        start + batchSize,
      )

    const batch =
      writeBatch(db)

    chunk.forEach((row) => {
      const questionRef = doc(
        collection(
          db,
          QUESTIONS_COLLECTION,
        ),
      )

      const category =
        getCanonicalCategoryName(
          row.kategori,
        )

      const correctAnswer =
        normalizeCorrectAnswer(
          row.dogru_secenek,
        )

      const optionTexts = [
        normalizeText(
          row.secenek_a,
        ),
        normalizeText(
          row.secenek_b,
        ),
        normalizeText(
          row.secenek_c,
        ),
        normalizeText(
          row.secenek_d,
        ),
      ]

      batch.set(questionRef, {
        category,
        categoryKey:
          normalizeCategory(
            category,
          ),
        question:
          normalizeText(row.soru),
        options:
          optionTexts.map(
            (text, index) => ({
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
          normalizeText(
            row.aciklama,
          ),
        active: true,
        createdAt:
          serverTimestamp(),
      })
    })

    await batch.commit()

    uploadedCount +=
      chunk.length
  }

  return uploadedCount
}

export async function getQuestionsByCategory(
  category,
) {
  const requestedCategory =
    normalizeCategory(category)

  const categoryConfig =
    getCategoryConfig(category)

  const uniqueAliases = [
    ...new Set(
      categoryConfig.aliases
        .map(normalizeText)
        .filter(Boolean),
    ),
  ].slice(0, 30)

  let snapshot

  try {
    snapshot = await getDocs(
      query(
        collection(
          db,
          QUESTIONS_COLLECTION,
        ),
        where(
          'category',
          'in',
          uniqueAliases,
        ),
      ),
    )
  } catch (queryError) {
    console.warn(
      'Kategori sorgusu çalışmadı, categoryKey sorgusu deneniyor:',
      queryError,
    )

    snapshot = await getDocs(
      query(
        collection(
          db,
          QUESTIONS_COLLECTION,
        ),
        where(
          'categoryKey',
          '==',
          requestedCategory,
        ),
      ),
    )
  }

  return snapshot.docs
    .map(
      normalizeQuestionDocument,
    )
    .filter((question) =>
      isValidQuestion(
        question,
        requestedCategory,
      ),
    )
}
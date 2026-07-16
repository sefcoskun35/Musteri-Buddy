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
    name: 'Health',
    aliases: [
      'Health',
      'HEALTH',
      'health',
      'Healthy',
      'HEALTHY',
      'healthy',
      'Healt',
      'HEALT',
      'healt',
    ],
  },
  'personal care': {
    name: 'Personal Care',
    aliases: [
      'Personal Care',
      'PERSONAL CARE',
      'personal care',
      'PersonalCare',
      'PERSONALCARE',
      'personalcare',
      'Personel Care',
      'PERSONEL CARE',
      'personel care',
      'PersonelCare',
      'PERSONELCARE',
      'personelcare',
    ],
  },
  'hair care': {
    name: 'Hair Care',
    aliases: [
      'Hair Care',
      'HAIR CARE',
      'hair care',
      'HairCare',
      'HAIRCARE',
      'haircare',
    ],
  },
  'general merchandise': {
    name: 'General Merchandise',
    aliases: [
      'General Merchandise',
      'GENERAL MERCHANDISE',
      'general merchandise',
      'GeneralMerchandise',
      'GENERALMERCHANDISE',
      'generalmerchandise',
    ],
  },
}

const preserveText = (value) =>
  value === null || value === undefined
    ? ''
    : String(value)

const trimmedText = (value) =>
  preserveText(value).trim()

const hasContent = (value) =>
  trimmedText(value).length > 0

const normalizeCategory = (value) => {
  const normalizedValue =
    trimmedText(value)
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
    'personel care': 'personal care',
    personelcare: 'personal care',

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
  const categoryKey =
    normalizeCategory(value)

  return (
    CATEGORY_CONFIG[categoryKey] || {
      name: trimmedText(value),
      aliases: [
        trimmedText(value),
      ].filter(Boolean),
    }
  )
}

const normalizeCorrectAnswer = (value) => {
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
    trimmedText(value)
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

const normalizeOptions = (
  data,
  correctAnswer,
) => {
  let sourceOptions =
    Array.isArray(data.options)
      ? data.options
      : []

  if (sourceOptions.length < 4) {
    sourceOptions = [
      data.secenek_a,
      data.secenek_b,
      data.secenek_c,
      data.secenek_d,
    ]
  }

  const correctIndex =
    ANSWER_LETTERS.indexOf(
      correctAnswer,
    )

  return ANSWER_LETTERS.map(
    (_, index) => {
      const sourceOption =
        sourceOptions[index]

      const objectIsCorrect =
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
            : objectIsCorrect,
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
      normalizeCategory(
        data.categoryKey ??
          data.category ??
          data.kategori,
      ),
    question: preserveText(
      data.question ??
        data.soru,
    ),
    correctAnswer,
    options: normalizeOptions(
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
    hasContent(question.question) &&
    options.length === 4 &&
    options.every(
      (option) =>
        hasContent(option.text),
    ) &&
    correctOptionCount === 1
  )
}

const mergeSnapshots = (
  snapshots,
) => {
  const documentMap =
    new Map()

  snapshots.forEach(
    (snapshot) => {
      snapshot?.docs?.forEach(
        (documentSnapshot) => {
          documentMap.set(
            documentSnapshot.id,
            documentSnapshot,
          )
        },
      )
    },
  )

  return [
    ...documentMap.values(),
  ]
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
        trimmedText(
          row?.kategori,
        )

      const question =
        preserveText(
          row?.soru,
        )

      const options = [
        preserveText(
          row?.secenek_a,
        ),
        preserveText(
          row?.secenek_b,
        ),
        preserveText(
          row?.secenek_c,
        ),
        preserveText(
          row?.secenek_d,
        ),
      ]

      const correctAnswer =
        normalizeCorrectAnswer(
          row?.dogru_secenek,
        )

      return (
        category &&
        hasContent(question) &&
        options.every(
          hasContent,
        ) &&
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
      const questionReference =
        doc(
          collection(
            db,
            QUESTIONS_COLLECTION,
          ),
        )

      const categoryConfig =
        getCategoryConfig(
          row.kategori,
        )

      const category =
        categoryConfig.name

      const categoryKey =
        normalizeCategory(category)

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

      batch.set(
        questionReference,
        {
          category,
          categoryKey,

          question:
            preserveText(
              row.soru,
            ),

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

export async function getQuestionsByCategory(
  category,
) {
  const requestedCategoryKey =
    normalizeCategory(category)

  const categoryConfig =
    getCategoryConfig(category)

  const snapshots = []

  try {
    const categoryKeySnapshot =
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

    snapshots.push(
      categoryKeySnapshot,
    )
  } catch (error) {
    console.warn(
      'categoryKey sorgusu çalışmadı:',
      error,
    )
  }

  const categoryAliases = [
    ...new Set(
      categoryConfig.aliases
        .map(trimmedText)
        .filter(Boolean),
    ),
  ].slice(0, 30)

  if (categoryAliases.length > 0) {
    try {
      const categorySnapshot =
        await getDocs(
          query(
            collection(
              db,
              QUESTIONS_COLLECTION,
            ),
            where(
              'category',
              'in',
              categoryAliases,
            ),
          ),
        )

      snapshots.push(
        categorySnapshot,
      )
    } catch (error) {
      console.warn(
        'Eski kategori sorgusu çalışmadı:',
        error,
      )
    }
  }

  const documents =
    mergeSnapshots(snapshots)

  return documents
    .map(
      normalizeQuestionDocument,
    )
    .filter((question) =>
      isValidQuestion(
        question,
        requestedCategoryKey,
      ),
    )
}
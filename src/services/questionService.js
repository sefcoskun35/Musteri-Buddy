import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

const QUESTIONS_COLLECTION = 'questions'
const ANSWER_LETTERS = ['A', 'B', 'C', 'D']

const normalizeText = (value) =>
  String(value ?? '').trim()

const normalizeCategory = (value) =>
  normalizeText(value).toLocaleLowerCase('tr-TR')

const normalizeCorrectAnswer = (value) => {
  const normalizedValue = normalizeText(value).toUpperCase()

  if (ANSWER_LETTERS.includes(normalizedValue)) {
    return normalizedValue
  }

  const numericValue = Number(normalizedValue)

  if (
    Number.isInteger(numericValue) &&
    numericValue >= 0 &&
    numericValue <= 3
  ) {
    return ANSWER_LETTERS[numericValue]
  }

  return ''
}

const normalizeOptions = (
  options,
  correctAnswer,
) => {
  const normalizedCorrectAnswer =
    normalizeCorrectAnswer(correctAnswer)

  const sourceOptions = Array.isArray(options)
    ? options
    : []

  return ANSWER_LETTERS.map(
    (letter, index) => {
      const sourceOption =
        sourceOptions[index]

      const optionText =
        typeof sourceOption === 'string'
          ? normalizeText(sourceOption)
          : normalizeText(
              sourceOption?.text ??
                sourceOption?.label ??
                sourceOption?.value,
            )

      const optionIsCorrect =
        typeof sourceOption?.isCorrect ===
        'boolean'
          ? sourceOption.isCorrect
          : letter === normalizedCorrectAnswer

      return {
        text: optionText,
        isCorrect: optionIsCorrect,
      }
    },
  )
}

export async function uploadQuestions(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(
      'Yüklenecek geçerli soru bulunamadı.',
    )
  }

  const validRows = rows.filter((row) => {
    const category = normalizeText(row?.kategori)
    const question = normalizeText(row?.soru)

    const options = [
      normalizeText(row?.secenek_a),
      normalizeText(row?.secenek_b),
      normalizeText(row?.secenek_c),
      normalizeText(row?.secenek_d),
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
  })

  if (validRows.length === 0) {
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
    const chunk = validRows.slice(
      start,
      start + batchSize,
    )

    const batch = writeBatch(db)

    chunk.forEach((row) => {
      const questionRef = doc(
        collection(
          db,
          QUESTIONS_COLLECTION,
        ),
      )

      const correctAnswer =
        normalizeCorrectAnswer(
          row.dogru_secenek,
        )

      const optionTexts = [
        normalizeText(row.secenek_a),
        normalizeText(row.secenek_b),
        normalizeText(row.secenek_c),
        normalizeText(row.secenek_d),
      ]

      batch.set(questionRef, {
        category: normalizeText(
          row.kategori,
        ),
        question: normalizeText(row.soru),
        options: optionTexts.map(
          (text, index) => ({
            text,
            isCorrect:
              ANSWER_LETTERS[index] ===
              correctAnswer,
          }),
        ),
        correctAnswer,
        explanation: normalizeText(
          row.aciklama,
        ),
        active: true,
        createdAt: serverTimestamp(),
      })
    })

    await batch.commit()
    uploadedCount += chunk.length
  }

  return uploadedCount
}

export async function getQuestionsByCategory(
  category,
) {
  const snapshot = await getDocs(
    collection(
      db,
      QUESTIONS_COLLECTION,
    ),
  )

  const normalizedCategory =
    normalizeCategory(category)

  return snapshot.docs
    .map((document) => {
      const data = document.data()

      const correctAnswer =
        normalizeCorrectAnswer(
          data.correctAnswer,
        )

      return {
        id: document.id,
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
    })
    .filter((question) => {
      const questionCategory =
        normalizeCategory(
          question.category,
        )

      const hasValidOptions =
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every(
          (option) =>
            normalizeText(option.text),
        )

      const hasCorrectOption =
        question.options.some(
          (option) =>
            option.isCorrect === true,
        )

      return (
        question.active !== false &&
        questionCategory ===
          normalizedCategory &&
        normalizeText(question.question) &&
        hasValidOptions &&
        hasCorrectOption
      )
    })
}
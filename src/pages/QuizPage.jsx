import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiLoader,
  FiShield,
  FiX,
} from 'react-icons/fi'
import { getQuestionsByCategory } from '../services/questionService'
import {
  hasCompletedCategory,
  saveExamResult,
} from '../services/resultService'
import '../styles/quiz.css'

const ANSWER_FEEDBACK_DELAY = 1500
const ANSWER_LETTERS = ['A', 'B', 'C', 'D']

const CATEGORY_NAMES = {
  health: 'Health',
  healthy: 'Health',
  healt: 'Health',
  'personal-care': 'Personal Care',
  'hair-care': 'Hair Care',
  'general-merchandise': 'General Merchandise',
}

const ANSWER_COLORS = [
  {
    main: '#08b981',
    light: '#31dda4',
    border: 'rgba(8, 185, 129, 0.36)',
    soft: 'rgba(8, 185, 129, 0.08)',
    shadow: 'rgba(8, 185, 129, 0.24)',
  },
  {
    main: '#168ff5',
    light: '#40b1ff',
    border: 'rgba(22, 143, 245, 0.33)',
    soft: 'rgba(22, 143, 245, 0.08)',
    shadow: 'rgba(22, 143, 245, 0.22)',
  },
  {
    main: '#8d5cf6',
    light: '#ab82ff',
    border: 'rgba(141, 92, 246, 0.32)',
    soft: 'rgba(141, 92, 246, 0.08)',
    shadow: 'rgba(141, 92, 246, 0.22)',
  },
  {
    main: '#ff8709',
    light: '#ffa43c',
    border: 'rgba(255, 135, 9, 0.34)',
    soft: 'rgba(255, 135, 9, 0.08)',
    shadow: 'rgba(255, 135, 9, 0.22)',
  },
]

const normalizeText = (value) =>
  String(value ?? '').trim()

const shuffleArray = (items) => {
  if (!Array.isArray(items)) {
    return []
  }

  const shuffledItems = [...items]

  for (
    let index = shuffledItems.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    )

    const currentItem =
      shuffledItems[index]

    shuffledItems[index] =
      shuffledItems[randomIndex]

    shuffledItems[randomIndex] =
      currentItem
  }

  return shuffledItems
}

const normalizeCorrectAnswer = (value) => {
  if (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 3
  ) {
    return value
  }

  const normalizedValue =
    normalizeText(value).toUpperCase()

  const letterIndex =
    ANSWER_LETTERS.indexOf(
      normalizedValue,
    )

  if (letterIndex >= 0) {
    return letterIndex
  }

  const numericValue =
    Number(normalizedValue)

  if (
    Number.isInteger(numericValue) &&
    numericValue >= 0 &&
    numericValue <= 3
  ) {
    return numericValue
  }

  if (
    Number.isInteger(numericValue) &&
    numericValue >= 1 &&
    numericValue <= 4
  ) {
    return numericValue - 1
  }

  return -1
}

const normalizeQuestion = (question) => {
  const correctAnswerIndex =
    normalizeCorrectAnswer(
      question?.correctAnswer,
    )

  const rawOptions = Array.isArray(
    question?.options,
  )
    ? question.options
    : []

  const options = ANSWER_LETTERS.map(
    (letter, index) => {
      const rawOption =
        rawOptions[index]

      const text =
        typeof rawOption === 'string'
          ? normalizeText(rawOption)
          : normalizeText(
              rawOption?.text ??
                rawOption?.label ??
                rawOption?.value,
            )

      const isCorrect =
        typeof rawOption?.isCorrect ===
        'boolean'
          ? rawOption.isCorrect
          : index ===
            correctAnswerIndex

      return {
        text,
        isCorrect,
      }
    },
  )

  let detectedCorrectIndex =
    options.findIndex(
      (option) =>
        option.isCorrect === true,
    )

  if (
    detectedCorrectIndex < 0 &&
    correctAnswerIndex >= 0
  ) {
    options.forEach(
      (option, index) => {
        option.isCorrect =
          index === correctAnswerIndex
      },
    )

    detectedCorrectIndex =
      correctAnswerIndex
  }

  return {
    id:
      normalizeText(question?.id) ||
      `${Date.now()}-${Math.random()}`,
    question: normalizeText(
      question?.question,
    ),
    options,
    correctAnswer:
      detectedCorrectIndex,
  }
}

const prepareQuiz = (
  questions,
  questionCount,
) =>
  shuffleArray(questions)
    .slice(0, questionCount)
    .map((question) => ({
      ...question,
      options: shuffleArray(
        question.options,
      ),
    }))

function QuizPage() {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const feedbackTimerRef =
    useRef(null)

  const isDemo =
    sessionStorage.getItem(
      'musteriBuddyMode',
    ) === 'demo'

  const [questions, setQuestions] =
    useState([])
  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0)
  const [answers, setAnswers] =
    useState({})
  const [seconds, setSeconds] =
    useState(0)
  const [
    isLoading,
    setIsLoading,
  ] = useState(true)
  const [isSaving, setIsSaving] =
    useState(false)
  const [
    isAnswerLocked,
    setIsAnswerLocked,
  ] = useState(false)
  const [error, setError] =
    useState('')

  const categoryName =
    CATEGORY_NAMES[categoryId] || ''

  useEffect(() => {
    let isMounted = true

    const loadQuestions = async () => {
      try {
        setIsLoading(true)
        setError('')
        setQuestions([])
        setCurrentIndex(0)
        setAnswers({})
        setSeconds(0)
        setIsAnswerLocked(false)

        if (!categoryName) {
          throw new Error(
            'Kategori bilgisi bulunamadı.',
          )
        }

        if (!isDemo) {
          const alreadyCompleted =
            await hasCompletedCategory(
              categoryId,
            )

          if (alreadyCompleted) {
            throw new Error(
              'Bu kategori sınavını daha önce tamamladınız.',
            )
          }
        }

        const loadedQuestions =
          await getQuestionsByCategory(
            categoryName,
          )

        const normalizedQuestions =
          Array.isArray(
            loadedQuestions,
          )
            ? loadedQuestions
                .map(
                  normalizeQuestion,
                )
                .filter(
                  (question) => {
                    const validOptions =
                      question.options
                        .length === 4 &&
                      question.options
                        .every(
                          (option) =>
                            Boolean(
                              option.text,
                            ),
                        )

                    const correctCount =
                      question.options
                        .filter(
                          (option) =>
                            option.isCorrect ===
                            true,
                        ).length

                    return (
                      Boolean(
                        question.question,
                      ) &&
                      validOptions &&
                      correctCount === 1
                    )
                  },
                )
            : []

        const requiredCount =
          isDemo ? 5 : 10

        if (
          normalizedQuestions.length <
          requiredCount
        ) {
          throw new Error(
            `${categoryName} kategorisinde ${normalizedQuestions.length} geçerli soru bulundu. En az ${requiredCount} soru gerekir.`,
          )
        }

        const preparedQuestions =
          prepareQuiz(
            normalizedQuestions,
            requiredCount,
          )

        if (
          preparedQuestions.length !==
          requiredCount
        ) {
          throw new Error(
            'Sınav soruları hazırlanamadı.',
          )
        }

        if (isMounted) {
          setQuestions(
            preparedQuestions,
          )
        }
      } catch (loadError) {
        console.error(
          'Quiz yükleme hatası:',
          loadError,
        )

        if (isMounted) {
          setError(
            loadError?.message ||
              'Sorular yüklenemedi.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadQuestions()

    return () => {
      isMounted = false
    }
  }, [
    categoryId,
    categoryName,
    isDemo,
  ])

  useEffect(() => {
    if (
      isLoading ||
      error ||
      questions.length === 0 ||
      isSaving
    ) {
      return undefined
    }

    const timerId =
      window.setInterval(() => {
        setSeconds(
          (currentSeconds) =>
            currentSeconds + 1,
        )
      }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [
    isLoading,
    error,
    questions.length,
    isSaving,
  ])

  useEffect(() => {
    return () => {
      if (
        feedbackTimerRef.current
      ) {
        window.clearTimeout(
          feedbackTimerRef.current,
        )
      }
    }
  }, [])

  const currentQuestion =
    questions[currentIndex] || null

  const selectedAnswer =
    currentQuestion
      ? answers[
          currentQuestion.id
        ]
      : undefined

  const progress =
    questions.length > 0
      ? ((currentIndex + 1) /
          questions.length) *
        100
      : 0

  const selectedOption =
    currentQuestion &&
    selectedAnswer !== undefined
      ? currentQuestion.options[
          selectedAnswer
        ]
      : null

  const answerIsCorrect =
    selectedOption?.isCorrect ===
    true

  const formattedTime =
    useMemo(() => {
      const minutes = Math.floor(
        seconds / 60,
      )

      const remainingSeconds =
        seconds % 60

      return `${String(
        minutes,
      ).padStart(2, '0')}:${String(
        remainingSeconds,
      ).padStart(2, '0')}`
    }, [seconds])

  const finishQuiz = async (
    completedAnswers,
  ) => {
    if (isSaving) {
      return
    }

    const correctCount =
      questions.reduce(
        (total, question) => {
          const selectedIndex =
            completedAnswers[
              question.id
            ]

          const selectedOptionItem =
            question.options[
              selectedIndex
            ]

          return (
            total +
            (selectedOptionItem
              ?.isCorrect
              ? 1
              : 0)
          )
        },
        0,
      )

    const result = {
      categoryId,
      categoryName,
      correctCount,
      wrongCount:
        questions.length -
        correctCount,
      totalQuestions:
        questions.length,
      score: Math.round(
        (correctCount /
          questions.length) *
          100,
      ),
      duration: seconds,
      isDemo,
      completedAt:
        new Date().toISOString(),
    }

    try {
      setIsSaving(true)

      if (!isDemo) {
        await saveExamResult(result)
      }

      sessionStorage.setItem(
        'musteriBuddyResult',
        JSON.stringify(result),
      )

      navigate('/sonuc')
    } catch (saveError) {
      console.error(
        'Sonuç kaydetme hatası:',
        saveError,
      )

      setIsAnswerLocked(false)

      setError(
        saveError?.message ||
          'Sınav sonucu kaydedilemedi.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const moveToNextQuestion = (
    updatedAnswers,
  ) => {
    if (
      currentIndex >=
      questions.length - 1
    ) {
      finishQuiz(
        updatedAnswers,
      )
      return
    }

    setCurrentIndex(
      (index) => index + 1,
    )

    setIsAnswerLocked(false)
  }

  const handleSelect = (
    optionIndex,
  ) => {
    if (
      !currentQuestion ||
      isAnswerLocked ||
      isSaving ||
      selectedAnswer !== undefined
    ) {
      return
    }

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]:
        optionIndex,
    }

    setAnswers(updatedAnswers)
    setIsAnswerLocked(true)

    feedbackTimerRef.current =
      window.setTimeout(() => {
        moveToNextQuestion(
          updatedAnswers,
        )
      }, ANSWER_FEEDBACK_DELAY)
  }

  const getAnswerClassName = (
    option,
    index,
  ) => {
    if (
      selectedAnswer === undefined
    ) {
      return ''
    }

    if (option.isCorrect) {
      return 'answer-option-correct'
    }

    if (
      selectedAnswer === index
    ) {
      return 'answer-option-wrong'
    }

    return 'answer-option-disabled'
  }

  const getAnswerVisuals = (
    option,
    index,
  ) => {
    const baseColor =
      ANSWER_COLORS[index] ||
      ANSWER_COLORS[0]

    const isSelected =
      selectedAnswer === index

    const isRevealed =
      selectedAnswer !== undefined

    if (
      isRevealed &&
      option.isCorrect
    ) {
      return {
        card: {
          opacity: 1,
          border:
            '3px solid #04b26f',
          borderLeft:
            '9px solid #04b26f',
          background:
            'linear-gradient(145deg, #f5fff9, #dcfbed)',
          boxShadow:
            '0 18px 32px rgba(2, 164, 103, 0.25)',
        },
        letter: {
          background:
            'linear-gradient(145deg, #38e5a1, #04ad6c)',
        },
        check: {
          color: '#ffffff',
          border: '0',
          background:
            'linear-gradient(145deg, #38e5a1, #04ad6c)',
        },
        textColor: '#063f2f',
      }
    }

    if (
      isRevealed &&
      isSelected &&
      !option.isCorrect
    ) {
      return {
        card: {
          opacity: 1,
          border:
            '3px solid #eb3856',
          borderLeft:
            '9px solid #eb3856',
          background:
            'linear-gradient(145deg, #fff7f9, #ffe1e8)',
          boxShadow:
            '0 18px 32px rgba(224, 46, 78, 0.22)',
        },
        letter: {
          background:
            'linear-gradient(145deg, #ff758c, #e93455)',
        },
        check: {
          color: '#ffffff',
          border: '0',
          background:
            'linear-gradient(145deg, #ff758c, #e93455)',
        },
        textColor: '#71142a',
      }
    }

    if (isRevealed) {
      return {
        card: {
          opacity: 0.46,
          filter:
            'saturate(0.45)',
        },
        letter: {
          background:
            'linear-gradient(145deg, #aebdca, #8296aa)',
        },
        check: {
          color: '#91a1b0',
        },
        textColor: '#647589',
      }
    }

    return {
      card: {
        border:
          `2px solid ${baseColor.border}`,
        borderLeft:
          `7px solid ${baseColor.main}`,
        background:
          `radial-gradient(circle at 78% 130%, ${baseColor.soft}, transparent 50%), linear-gradient(145deg, #ffffff, #f9fcff)`,
        boxShadow:
          '0 12px 24px rgba(9, 54, 101, 0.09)',
      },
      letter: {
        background:
          `linear-gradient(145deg, ${baseColor.light}, ${baseColor.main})`,
        boxShadow:
          `0 11px 22px ${baseColor.shadow}`,
      },
      check: {
        color: baseColor.main,
        border:
          `3px solid ${baseColor.main}`,
      },
      textColor: '#062653',
    }
  }

  if (isLoading) {
    return (
      <main className="quiz-state-page">
        <FiLoader className="loading-icon" />

        <h1>
          Sorular hazırlanıyor
        </h1>

        <p>
          Lütfen kısa bir süre
          bekleyin.
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="quiz-state-page">
        <FiAlertCircle className="error-icon" />

        <h1>
          Sınav açılamadı
        </h1>

        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            navigate('/kategoriler')
          }
        >
          Kategorilere Dön
        </button>
      </main>
    )
  }

  if (
    questions.length === 0 ||
    !currentQuestion
  ) {
    return (
      <main className="quiz-state-page">
        <FiAlertCircle className="error-icon" />

        <h1>
          Soru bulunamadı
        </h1>

        <p>
          Bu kategori için geçerli
          soru bulunamadı.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate('/kategoriler')
          }
        >
          Kategorilere Dön
        </button>
      </main>
    )
  }

  return (
    <main className="quiz-page">
      <header className="quiz-header">
        <button
          type="button"
          className="quiz-back-button"
          aria-label="Kategorilere dön"
          disabled={
            isAnswerLocked ||
            isSaving
          }
          onClick={() =>
            navigate('/kategoriler')
          }
        >
          <FiArrowLeft />
        </button>

        <div className="quiz-heading">
          <span>
            {isDemo
              ? 'Demo sınavı'
              : 'Resmî sınav'}
          </span>

          <strong>
            {categoryName}
          </strong>
        </div>

        <div className="quiz-timer">
          <FiClock />

          <span>
            {formattedTime}
          </span>
        </div>
      </header>

      <section className="quiz-container">
        <div className="quiz-progress-info">
          <span>
            Soru {currentIndex + 1} /{' '}
            {questions.length}
          </span>

          <span>
            %{Math.round(progress)}
          </span>
        </div>

        <div
          className="quiz-progress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(
            progress,
          )}
          style={{
            height: '18px',
            minHeight: '18px',
            padding: '3px',
            overflow: 'visible',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              minWidth: '12px',
            }}
          />
        </div>

        <article className="question-card">
          <span className="question-label">
            Soru {currentIndex + 1}
          </span>

          <h1>
            {currentQuestion.question}
          </h1>

          <div className="answer-list">
            {currentQuestion.options.map(
              (option, index) => {
                const answerLetter =
                  ANSWER_LETTERS[index]

                const isSelected =
                  selectedAnswer === index

                const visuals =
                  getAnswerVisuals(
                    option,
                    index,
                  )

                return (
                  <button
                    type="button"
                    key={`${currentQuestion.id}-${index}`}
                    className={`answer-option ${getAnswerClassName(
                      option,
                      index,
                    )}`}
                    style={{
                      minHeight:
                        'clamp(68px, 9vh, 96px)',
                      fontWeight: 900,
                      transition:
                        'all 180ms ease',
                      ...visuals.card,
                    }}
                    disabled={
                      isAnswerLocked ||
                      isSaving
                    }
                    onClick={() =>
                      handleSelect(
                        index,
                      )
                    }
                    aria-pressed={
                      isSelected
                    }
                  >
                    <span
                      className="answer-letter"
                      style={{
                        fontWeight: 900,
                        ...visuals.letter,
                      }}
                    >
                      {answerLetter}
                    </span>

                    <span
                      className="answer-text"
                      style={{
                        color:
                          visuals.textColor,
                        fontWeight: 900,
                      }}
                    >
                      {option.text}
                    </span>

                    <span
                      className="answer-check"
                      style={
                        visuals.check
                      }
                    >
                      {selectedAnswer !==
                        undefined &&
                      option.isCorrect ? (
                        <FiCheck />
                      ) : isSelected ? (
                        <FiX />
                      ) : null}
                    </span>
                  </button>
                )
              },
            )}
          </div>

          {selectedAnswer ===
          undefined ? (
            <div className="quiz-selection-hint">
              En doğru olduğunu
              düşündüğünüz seçeneğe
              dokunun.
            </div>
          ) : (
            <div
              className={`quiz-answer-feedback ${
                answerIsCorrect
                  ? 'correct'
                  : 'wrong'
              }`}
            >
              {answerIsCorrect ? (
                <FiCheck />
              ) : (
                <FiX />
              )}

              <div>
                <strong>
                  {answerIsCorrect
                    ? 'Doğru cevap'
                    : 'Yanlış cevap'}
                </strong>

                <span>
                  {answerIsCorrect
                    ? 'Harika seçim. Sonraki soruya geçiliyor.'
                    : 'Doğru seçenek yeşil renkle gösterildi.'}
                </span>
              </div>
            </div>
          )}

          {isSaving && (
            <div className="quiz-saving-state">
              <FiLoader />

              <span>
                Sonuç kaydediliyor...
              </span>
            </div>
          )}
        </article>

        <div className="quiz-notice">
          <FiShield />

          <span>
            {isDemo
              ? 'Demo sonucu sıralamaya dahil edilmez.'
              : 'Sınav sonucu güvenli şekilde kaydedilecektir.'}
          </span>
        </div>
      </section>
    </main>
  )
}

export default QuizPage
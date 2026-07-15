import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiLoader,
  FiShield,
  FiX,
} from 'react-icons/fi'
import { categoryNames } from '../data/questions'
import { getQuestionsByCategory } from '../services/questionService'
import {
  hasCompletedCategory,
  saveExamResult,
} from '../services/resultService'
import { prepareQuiz } from '../utils/quiz'
import '../styles/quiz.css'

const ANSWER_FEEDBACK_DELAY = 1500

function QuizPage() {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const feedbackTimerRef = useRef(null)

  const isDemo =
    sessionStorage.getItem('musteriBuddyMode') === 'demo'

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [seconds, setSeconds] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAnswerLocked, setIsAnswerLocked] =
    useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadQuestions() {
      try {
        setIsLoading(true)
        setError('')

        const categoryName = categoryNames[categoryId]

        if (!categoryName) {
          navigate('/kategoriler', {
            replace: true,
          })

          return
        }

        if (!isDemo) {
          const alreadyCompleted =
            await hasCompletedCategory(categoryId)

          if (alreadyCompleted) {
            throw new Error(
              'Bu kategori sınavını daha önce tamamladınız. Yeni sınav hakkı için sistem yöneticisine başvurun.',
            )
          }
        }

        const firestoreQuestions =
          await getQuestionsByCategory(categoryName)

        const preparedQuestions =
          firestoreQuestions.map((question) => ({
            id: question.id,
            question: question.question,
            options: question.options,
            correctAnswer: [
              'A',
              'B',
              'C',
              'D',
            ].indexOf(
              String(
                question.correctAnswer || '',
              ).toUpperCase(),
            ),
          }))

        const requiredCount = isDemo ? 5 : 10

        if (
          preparedQuestions.length < requiredCount
        ) {
          throw new Error(
            `${categoryName} kategorisinde en az ${requiredCount} geçerli soru bulunmalıdır.`,
          )
        }

        if (isMounted) {
          setQuestions(
            prepareQuiz(
              preparedQuestions,
              requiredCount,
            ),
          )
        }
      } catch (loadError) {
        console.error(loadError)

        if (isMounted) {
          setError(
            loadError?.message ||
              'Sorular yüklenemedi. Veritabanını kontrol edin.',
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
  }, [categoryId, isDemo, navigate])

  useEffect(() => {
    if (
      isLoading ||
      error ||
      !questions.length ||
      isSaving
    ) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1)
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [
    isLoading,
    error,
    questions.length,
    isSaving,
  ])

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(
          feedbackTimerRef.current,
        )
      }
    }
  }, [])

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(
      totalSeconds / 60,
    )

    const remainingSeconds =
      totalSeconds % 60

    return `${String(minutes).padStart(
      2,
      '0',
    )}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <main className="quiz-state-page">
        <FiLoader className="loading-icon" />

        <h1>Sorular hazırlanıyor</h1>

        <p>
          Sınavınız güvenli şekilde hazırlanıyor.
          Lütfen kısa bir süre bekleyin.
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="quiz-state-page">
        <FiAlertCircle className="error-icon" />

        <h1>Sınav açılamadı</h1>

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

  const currentQuestion =
    questions[currentIndex]

  const selectedAnswer =
    answers[currentQuestion.id]

  const progress =
    ((currentIndex + 1) / questions.length) *
    100

  const finishQuiz = async (
    completedAnswers = answers,
  ) => {
    if (isSaving) {
      return
    }

    const correctCount = questions.reduce(
      (total, question) => {
        const selectedIndex =
          completedAnswers[question.id]

        const selectedOption =
          question.options[selectedIndex]

        return (
          total +
          (selectedOption?.isCorrect ? 1 : 0)
        )
      },
      0,
    )

    const result = {
      categoryId,
      categoryName:
        categoryNames[categoryId],
      correctCount,
      wrongCount:
        questions.length - correctCount,
      totalQuestions: questions.length,
      score: Math.round(
        (correctCount / questions.length) *
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
      console.error(saveError)

      setIsAnswerLocked(false)

      setError(
        saveError?.message ||
          'Sınav sonucu kaydedilemedi. Lütfen tekrar deneyin.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const moveToNextQuestion = (
    completedAnswers,
  ) => {
    if (
      currentIndex ===
      questions.length - 1
    ) {
      finishQuiz(completedAnswers)
      return
    }

    setCurrentIndex(
      (value) => value + 1,
    )

    setIsAnswerLocked(false)
  }

  const handleSelect = (optionIndex) => {
    if (
      isAnswerLocked ||
      isSaving ||
      selectedAnswer !== undefined
    ) {
      return
    }

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: optionIndex,
    }

    setAnswers(updatedAnswers)
    setIsAnswerLocked(true)

    feedbackTimerRef.current =
      window.setTimeout(() => {
        moveToNextQuestion(updatedAnswers)
      }, ANSWER_FEEDBACK_DELAY)
  }

  const getAnswerClassName = (
    option,
    index,
  ) => {
    if (selectedAnswer === undefined) {
      return ''
    }

    const isSelected =
      selectedAnswer === index

    if (option.isCorrect) {
      return 'answer-option-correct'
    }

    if (isSelected && !option.isCorrect) {
      return 'answer-option-wrong'
    }

    return 'answer-option-disabled'
  }

  const selectedOption =
    selectedAnswer !== undefined
      ? currentQuestion.options[
          selectedAnswer
        ]
      : null

  const answerIsCorrect =
    selectedOption?.isCorrect === true

  return (
    <main className="quiz-page">
      <header className="quiz-header">
        <button
          type="button"
          className="quiz-back-button"
          aria-label="Kategorilere dön"
          disabled={
            isAnswerLocked || isSaving
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
            {categoryNames[categoryId]}
          </strong>
        </div>

        <div
          className="quiz-timer"
          aria-label={`Geçen süre ${formatTime(
            seconds,
          )}`}
        >
          <FiClock />

          <span>{formatTime(seconds)}</span>
        </div>
      </header>

      <section className="quiz-container">
        <div
          className="quiz-progress-info"
          style={{
            minHeight: '30px',
            padding: '0 4px',
          }}
        >
          <span
            style={{
              fontWeight: 900,
              color: '#ffffff',
              textShadow:
                '0 4px 12px rgba(0, 44, 94, 0.26)',
            }}
          >
            Soru {currentIndex + 1} /{' '}
            {questions.length}
          </span>

          <span
            style={{
              minWidth: '48px',
              padding: '6px 10px',
              borderRadius: '999px',
              color: '#ffffff',
              background:
                'rgba(3, 42, 88, 0.22)',
              border:
                '1px solid rgba(255, 255, 255, 0.22)',
              boxShadow:
                'inset 0 1px 0 rgba(255, 255, 255, 0.16)',
              fontWeight: 900,
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter:
                'blur(10px)',
            }}
          >
            %{Math.round(progress)}
          </span>
        </div>

        <div
          className="quiz-progress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(progress)}
          style={{
            position: 'relative',
            width: '100%',
            height: '18px',
            minHeight: '18px',
            padding: '3px',
            overflow: 'visible',
            borderRadius: '999px',
            border:
              '1px solid rgba(255, 255, 255, 0.52)',
            background:
              'linear-gradient(180deg, rgba(231, 251, 255, 0.92) 0%, rgba(199, 235, 246, 0.82) 100%)',
            boxShadow:
              '0 7px 18px rgba(0, 53, 112, 0.15), inset 0 2px 5px rgba(4, 63, 112, 0.17), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: `${progress}%`,
              height: '100%',
              minWidth: '12px',
              overflow: 'visible',
              borderRadius: '999px',
              background:
                'linear-gradient(90deg, #9BF05D 0%, #54E576 30%, #17D394 65%, #08B99A 100%)',
              boxShadow:
                '0 0 15px rgba(44, 232, 147, 0.62), 0 3px 8px rgba(2, 143, 108, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.62)',
              transition:
                'width 360ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '0',
                overflow: 'hidden',
                borderRadius: '999px',
                background:
                  'linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.16) 34%, rgba(255, 255, 255, 0.56) 49%, rgba(255, 255, 255, 0.12) 64%, transparent 100%)',
              }}
            />

            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                right: '-7px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                transform: 'translateY(-50%)',
                border:
                  '3px solid rgba(255, 255, 255, 0.96)',
                background:
                  'linear-gradient(145deg, #50E99E, #06B98C)',
                boxShadow:
                  '0 0 0 3px rgba(33, 222, 145, 0.22), 0 3px 9px rgba(0, 105, 82, 0.3)',
              }}
            />
          </div>
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
                const isSelected =
                  selectedAnswer === index

                const answerLetter =
                  String.fromCharCode(
                    65 + index,
                  )

                return (
                  <button
                    type="button"
                    key={`${currentQuestion.id}-${index}`}
                    className={`answer-option ${getAnswerClassName(
                      option,
                      index,
                    )}`}
                    disabled={
                      isAnswerLocked ||
                      isSaving
                    }
                    onClick={() =>
                      handleSelect(index)
                    }
                    aria-label={`${answerLetter} seçeneği: ${option.text}`}
                    aria-pressed={isSelected}
                  >
                    <span
                      className="answer-letter"
                      aria-hidden="true"
                    >
                      {answerLetter}
                    </span>

                    <span className="answer-text">
                      {option.text}
                    </span>

                    <span
                      className="answer-check"
                      aria-hidden="true"
                    >
                      {selectedAnswer !==
                        undefined &&
                      option.isCorrect ? (
                        <FiCheck />
                      ) : isSelected &&
                        !option.isCorrect ? (
                        <FiX />
                      ) : null}
                    </span>
                  </button>
                )
              },
            )}
          </div>

          {selectedAnswer !== undefined && (
            <div
              className={`quiz-answer-feedback ${
                answerIsCorrect
                  ? 'correct'
                  : 'wrong'
              }`}
              role="status"
              aria-live="polite"
            >
              {answerIsCorrect ? (
                <>
                  <FiCheck />

                  <div>
                    <strong>
                      Doğru cevap
                    </strong>

                    <span>
                      Harika seçim. Sonraki
                      soruya geçiliyor.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <FiX />

                  <div>
                    <strong>
                      Yanlış cevap
                    </strong>

                    <span>
                      Doğru seçenek yeşil
                      renkle gösterildi.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {selectedAnswer === undefined && (
            <div className="quiz-selection-hint">
              En doğru olduğunu düşündüğünüz
              seçeneğe dokunun. Seçimin ardından
              sonraki soruya otomatik geçilir.
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

          {isDemo
            ? 'Demo sonucu mağaza sıralamasına dahil edilmez.'
            : 'Sınav sonucu güvenli şekilde otomatik kaydedilecektir.'}
        </div>
      </section>
    </main>
  )
}

export default QuizPage
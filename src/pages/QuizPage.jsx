import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiLoader,
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

function QuizPage() {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const isDemo = sessionStorage.getItem('musteriBuddyMode') === 'demo'

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [seconds, setSeconds] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadQuestions() {
      try {
        setIsLoading(true)
        setError('')

        const categoryName = categoryNames[categoryId]

        if (!categoryName) {
          navigate('/kategoriler', { replace: true })
          return
        }

        if (!isDemo) {
          const alreadyCompleted = await hasCompletedCategory(categoryId)

          if (alreadyCompleted) {
            throw new Error(
              'Bu kategori sınavını daha önce tamamladınız. Yeni sınav hakkı için sistem yöneticisine başvurun.',
            )
          }
        }

        const firestoreQuestions = await getQuestionsByCategory(categoryName)

        const preparedQuestions = firestoreQuestions.map((question) => ({
          id: question.id,
          question: question.question,
          options: question.options,
          correctAnswer: ['A', 'B', 'C', 'D'].indexOf(
            String(question.correctAnswer || '').toUpperCase(),
          ),
        }))

        const requiredCount = isDemo ? 5 : 10

        if (preparedQuestions.length < requiredCount) {
          throw new Error(
            `${categoryName} kategorisinde en az ${requiredCount} geçerli soru bulunmalıdır.`,
          )
        }

        if (isMounted) {
          setQuestions(prepareQuiz(preparedQuestions, requiredCount))
        }
      } catch (loadError) {
        console.error(loadError)

        if (isMounted) {
          setError(
            loadError.message ||
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
    if (isLoading || error || !questions.length) return undefined

    const timer = setInterval(() => {
      setSeconds((value) => value + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isLoading, error, questions.length])

  if (isLoading) {
    return (
      <main className="quiz-state-page">
        <FiLoader className="loading-icon" />
        <h1>Sorular hazırlanıyor</h1>
        <p>Lütfen kısa bir süre bekleyin.</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="quiz-state-page">
        <FiAlertCircle className="error-icon" />
        <h1>Sınav açılamadı</h1>
        <p>{error}</p>

        <button type="button" onClick={() => navigate('/kategoriler')}>
          Kategorilere Dön
        </button>
      </main>
    )
  }

  const currentQuestion = questions[currentIndex]
  const selectedAnswer = answers[currentQuestion.id]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const handleSelect = (optionIndex) => {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: optionIndex,
    }))
  }

  const finishQuiz = async () => {
    if (isSaving) return

    const correctCount = questions.reduce((total, question) => {
      const selectedIndex = answers[question.id]
      const selectedOption = question.options[selectedIndex]

      return total + (selectedOption?.isCorrect ? 1 : 0)
    }, 0)

    const result = {
      categoryId,
      categoryName: categoryNames[categoryId],
      correctCount,
      wrongCount: questions.length - correctCount,
      totalQuestions: questions.length,
      score: Math.round((correctCount / questions.length) * 100),
      duration: seconds,
      isDemo,
      completedAt: new Date().toISOString(),
    }

    try {
      setIsSaving(true)

      if (!isDemo) {
        await saveExamResult(result)
      }

      sessionStorage.setItem('musteriBuddyResult', JSON.stringify(result))
      navigate('/sonuc')
    } catch (saveError) {
      console.error(saveError)
      setError('Sınav sonucu kaydedilemedi. Lütfen tekrar deneyin.')
    } finally {
      setIsSaving(false)
    }
  }

  const goNext = () => {
    if (selectedAnswer === undefined || isSaving) return

    if (currentIndex === questions.length - 1) {
      finishQuiz()
      return
    }

    setCurrentIndex((value) => value + 1)
  }

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }

  return (
    <main className="quiz-page">
      <header className="quiz-header">
        <button
          type="button"
          className="quiz-back-button"
          onClick={() => navigate('/kategoriler')}
        >
          <FiArrowLeft />
        </button>

        <div className="quiz-heading">
          <span>{isDemo ? 'Demo sınavı' : 'Resmî sınav'}</span>
          <strong>{categoryNames[categoryId]}</strong>
        </div>

        <div className="quiz-timer">
          <FiClock />
          {formatTime(seconds)}
        </div>
      </header>

      <section className="quiz-container">
        <div className="quiz-progress-info">
          <span>
            Soru {currentIndex + 1} / {questions.length}
          </span>
          <span>%{Math.round(progress)}</span>
        </div>

        <div className="quiz-progress">
          <div style={{ width: `${progress}%` }} />
        </div>

        <article className="question-card">
          <span className="question-label">Soru {currentIndex + 1}</span>

          <h1>{currentQuestion.question}</h1>

          <div className="answer-list">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index

              return (
                <button
                  type="button"
                  key={`${currentQuestion.id}-${index}`}
                  className={`answer-option ${
                    isSelected ? 'answer-option-selected' : ''
                  }`}
                  onClick={() => handleSelect(index)}
                >
                  <span className="answer-letter">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="answer-text">{option.text}</span>

                  <span className="answer-check">
                    {isSelected ? <FiCheck /> : null}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="quiz-next-button"
            disabled={selectedAnswer === undefined || isSaving}
            onClick={goNext}
          >
            <span>
              {isSaving
                ? 'Sonuç Kaydediliyor...'
                : currentIndex === questions.length - 1
                  ? 'Sınavı Bitir'
                  : 'Sonraki Soru'}
            </span>

            {isSaving ? <FiLoader /> : <FiArrowRight />}
          </button>
        </article>

        <div className="quiz-notice">
          {isDemo ? (
            <>
              <FiX />
              Demo sonucu sıralamaya dahil edilmez.
            </>
          ) : (
            <>
              <FiCheck />
              Sınav sonucu otomatik olarak kaydedilecektir.
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default QuizPage

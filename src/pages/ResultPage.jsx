import { useNavigate } from 'react-router-dom'
import {
  FiAward,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiRefreshCw,
  FiXCircle,
} from 'react-icons/fi'
import '../styles/result.css'

function ResultPage() {
  const navigate = useNavigate()
  const result = JSON.parse(
    sessionStorage.getItem('musteriBuddyResult') || 'null',
  )

  if (!result) {
    navigate('/', { replace: true })
    return null
  }

  const passed = result.score >= 70

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes} dk ${seconds} sn`
  }

  const goCategories = () => {
    navigate('/kategoriler')
  }

  const restartDemo = () => {
    if (!result.isDemo) return
    navigate(`/quiz/${result.categoryId}`)
  }

  return (
    <main className="result-page">
      <section className="result-card">
        <div
          className={`result-icon ${
            passed ? 'result-icon-success' : 'result-icon-fail'
          }`}
        >
          {passed ? <FiAward /> : <FiXCircle />}
        </div>

        <span className="result-eyebrow">
          {result.isDemo ? 'Demo tamamlandı' : 'Sınav tamamlandı'}
        </span>

        <h1>{passed ? 'Tebrikler!' : 'Gelişime devam'}</h1>

        <p>
          {passed
            ? `${result.categoryName} kategorisinde başarılı oldunuz.`
            : `${result.categoryName} kategorisinde geçme puanına ulaşamadınız.`}
        </p>

        <div className="score-circle">
          <strong>{result.score}</strong>
          <span>puan</span>
        </div>

        <div className="result-stats">
          <div>
            <FiCheckCircle />
            <strong>{result.correctCount}</strong>
            <span>Doğru</span>
          </div>

          <div>
            <FiXCircle />
            <strong>{result.wrongCount}</strong>
            <span>Yanlış</span>
          </div>

          <div>
            <FiClock />
            <strong>{formatTime(result.duration)}</strong>
            <span>Süre</span>
          </div>
        </div>

        <div className="result-actions">
          <button type="button" className="result-primary" onClick={goCategories}>
            <FiHome />
            Kategorilere Dön
          </button>

          {result.isDemo && (
            <button
              type="button"
              className="result-secondary"
              onClick={restartDemo}
            >
              <FiRefreshCw />
              Tekrar Dene
            </button>
          )}
        </div>

        {!result.isDemo && (
          <div className="result-info">
            Gerçek sınav sonucu kayıt aşamasında sisteme gönderilecektir.
          </div>
        )}
      </section>
    </main>
  )
}

export default ResultPage

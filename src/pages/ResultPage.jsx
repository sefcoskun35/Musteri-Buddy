import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiAward,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiRefreshCw,
  FiTrendingUp,
  FiXCircle,
} from 'react-icons/fi'
import '../styles/result.css'

const PASS_SCORE = 70

function ResultPage() {
  const navigate = useNavigate()

  const result = JSON.parse(
    sessionStorage.getItem('musteriBuddyResult') || 'null',
  )

  useEffect(() => {
    if (!result) {
      navigate('/', { replace: true })
    }
  }, [navigate, result])

  if (!result) return null

  const score = Number(result.score || 0)
  const passed = score >= PASS_SCORE
  const percentage = Math.max(0, Math.min(score, 100))

  const formatTime = (seconds) => {
    const minute = Math.floor(Number(seconds || 0) / 60)
    const second = Number(seconds || 0) % 60

    return `${minute} dk ${second
      .toString()
      .padStart(2, '0')} sn`
  }

  return (
    <main className="result-page">
      <section className="result-card premium-card">

        <div
          className={`result-badge ${
            passed ? 'success' : 'fail'
          }`}
        >
          {passed ? 'GEÇTİNİZ' : 'KALDINIZ'}
        </div>

        <div
          className={`result-icon ${
            passed
              ? 'result-icon-success'
              : 'result-icon-fail'
          }`}
        >
          {passed ? <FiAward /> : <FiXCircle />}
        </div>

        <span className="result-category">
          {result.categoryName}
        </span>

        <h1>
          {passed
            ? 'Harika Bir İş Çıkardınız!'
            : 'Biraz Daha Çalışabilirsiniz'}
        </h1>

        <p className="result-description">
          {passed
            ? 'Bu kategoride başarıyla geçtiniz. Tebrik ederiz.'
            : 'Geçme puanına ulaşamadınız. Biraz daha çalışarak tekrar deneyebilirsiniz.'}
        </p>

        <div
          className="premium-score-circle"
          style={{
            '--progress': `${percentage}%`,
          }}
        >
          <div className="premium-score-inner">
            <strong>{score}</strong>
            <span>PUAN</span>
          </div>
        </div>

        <div className="result-progress-info">
          <span>Geçme Puanı</span>

          <strong>{PASS_SCORE}</strong>
        </div>

        <div className="premium-stats">

          <div className="stat-card success">
            <FiCheckCircle />
            <strong>{result.correctCount}</strong>
            <span>Doğru</span>
          </div>

          <div className="stat-card danger">
            <FiXCircle />
            <strong>{result.wrongCount}</strong>
            <span>Yanlış</span>
          </div>

          <div className="stat-card info">
            <FiClock />
            <strong>
              {formatTime(result.duration)}
            </strong>
            <span>Süre</span>
          </div>

        </div>

        <div className="performance-card">
          <FiTrendingUp />

          <div>
            <span>Başarı Durumu</span>

            <strong>
              %{percentage}
            </strong>
          </div>
        </div>

        <div className="result-actions">

          <button
            type="button"
            className="result-primary"
            onClick={() =>
              navigate('/kategoriler')
            }
          >
            <FiHome />
            Kategorilere Dön
          </button>

          {result.isDemo && (
            <button
              type="button"
              className="result-secondary"
              onClick={() =>
                navigate(
                  `/quiz/${result.categoryId}`,
                )
              }
            >
              <FiRefreshCw />
              Tekrar Dene
            </button>
          )}

        </div>

        {!result.isDemo && (
          <div className="result-info">
            Sonucunuz başarıyla sisteme
            kaydedildi.
          </div>
        )}
      </section>
    </main>
  )
}

export default ResultPage
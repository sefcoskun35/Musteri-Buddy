import { useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiPlay,
} from 'react-icons/fi'
import '../styles/categories.css'

const categories = [
  {
    id: 'health',
    title: 'Health',
    description: 'Sağlık ve iyi yaşam ürünleri',
    questionCount: 10,
  },
  {
    id: 'personal-care',
    title: 'Personal Care',
    description: 'Kişisel bakım ve günlük ihtiyaçlar',
    questionCount: 10,
  },
  {
    id: 'hair-care',
    title: 'Hair Care',
    description: 'Saç bakımı ve ürün bilgisi',
    questionCount: 10,
  },
  {
    id: 'general-merchandise',
    title: 'General Merchandise',
    description: 'Genel ürün ve satış bilgisi',
    questionCount: 10,
  },
]

function CategoryPage() {
  const navigate = useNavigate()
  const participant = JSON.parse(
    sessionStorage.getItem('musteriBuddyParticipant') || 'null',
  )
  const isDemo = sessionStorage.getItem('musteriBuddyMode') === 'demo'

  return (
    <main className="category-page">
      <header className="category-header">
        <button
          type="button"
          className="icon-button"
          onClick={() => navigate('/')}
          aria-label="Geri dön"
        >
          <FiArrowLeft />
        </button>

        <div>
          <span className="category-eyebrow">
            {isDemo ? 'Demo modu' : 'Kategori sınavları'}
          </span>
          <h1>Kategorini seç</h1>
        </div>

        <div className="profile-pill">
          {participant?.storeCode || 'Demo'}
        </div>
      </header>

      <section className="category-hero">
        <div>
          <span>Hoş geldiniz</span>
          <h2>{participant?.fullName || 'Demo Katılımcısı'}</h2>
          <p>
            Her kategori için bilgi seviyenizi ölçebilir ve sonuçlarınızı
            takip edebilirsiniz.
          </p>
        </div>

        <div className="hero-stat">
          <strong>4</strong>
          <span>Aktif kategori</span>
        </div>
      </section>

      <section className="category-grid">
        {categories.map((category, index) => (
          <article className="category-card" key={category.id}>
            <div className="category-number">
              {String(index + 1).padStart(2, '0')}
            </div>

            <div className="category-card-content">
              <span className="status-badge">
                <FiCheckCircle />
                Sınava hazır
              </span>

              <h3>{category.title}</h3>
              <p>{category.description}</p>

              <div className="category-meta">
                <span>
                  <FiClock />
                  Yaklaşık 8 dakika
                </span>
                <span>{isDemo ? 5 : category.questionCount} soru</span>
              </div>
            </div>

            <button
              type="button"
              className="category-action"
              onClick={() => navigate(`/quiz/${category.id}`)}
              aria-label={`${category.title} sınavını başlat`}
            >
              <FiPlay />
            </button>
          </article>
        ))}
      </section>
    </main>
  )
}

export default CategoryPage

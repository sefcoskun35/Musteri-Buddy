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

const styles = `
  .category-page {
    width: 100%;
    min-height: 100dvh;
    padding:
      calc(18px + env(safe-area-inset-top))
      max(18px, env(safe-area-inset-right))
      calc(24px + env(safe-area-inset-bottom))
      max(18px, env(safe-area-inset-left));
    background:
      radial-gradient(
        circle at 90% 0%,
        rgba(37, 211, 185, 0.17),
        transparent 32%
      ),
      #f3f7f7;
    color: #10253e;
  }

  .category-shell {
    width: min(1120px, 100%);
    margin: 0 auto;
  }

  .category-header {
    display: grid;
    grid-template-columns: 50px minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
  }

  .category-header .icon-button {
    width: 50px;
    height: 50px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid #d9e4e7;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.9);
    color: #10253e;
    font-size: 22px;
    box-shadow: 0 8px 24px rgba(16, 37, 62, 0.06);
  }

  .category-heading {
    min-width: 0;
  }

  .category-eyebrow {
    display: block;
    margin-bottom: 3px;
    color: #11b6a3;
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .category-heading h1 {
    margin: 0;
    font-size: clamp(25px, 4vw, 38px);
    line-height: 1.08;
    letter-spacing: -0.045em;
  }

  .profile-pill {
    min-width: 72px;
    min-height: 42px;
    display: grid;
    place-items: center;
    padding: 0 15px;
    border-radius: 999px;
    background: #10253e;
    color: #ffffff;
    font-size: 14px;
    font-weight: 850;
    letter-spacing: 0.06em;
  }

  .category-welcome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 18px;
    padding: 17px 19px;
    border: 1px solid rgba(16, 37, 62, 0.08);
    border-radius: 19px;
    background: #102c3b;
    color: #ffffff;
    box-shadow: 0 14px 34px rgba(16, 44, 59, 0.12);
  }

  .category-welcome > div {
    min-width: 0;
  }

  .category-welcome span {
    display: block;
    margin-bottom: 3px;
    color: #56dec9;
    font-size: 12px;
    font-weight: 800;
  }

  .category-welcome strong {
    display: block;
    overflow: hidden;
    font-size: clamp(20px, 4vw, 28px);
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-welcome p {
    margin: 5px 0 0;
    color: rgba(255, 255, 255, 0.68);
    font-size: 12px;
    line-height: 1.45;
  }

  .category-count {
    flex: 0 0 auto;
    text-align: right;
  }

  .category-count strong {
    font-size: 27px;
  }

  .category-count small {
    display: block;
    margin-top: 2px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 13px;
  }

  .category-card {
    position: relative;
    min-width: 0;
    min-height: 142px;
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) 48px;
    align-items: center;
    gap: 13px;
    padding: 16px;
    overflow: hidden;
    border: 1px solid #dce6e8;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(16, 37, 62, 0.055);
    transition:
      transform 160ms ease,
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  .category-card:hover {
    transform: translateY(-2px);
    border-color: rgba(17, 182, 163, 0.38);
    box-shadow: 0 15px 34px rgba(16, 37, 62, 0.09);
  }

  .category-number {
    align-self: flex-start;
    color: #d5e0e5;
    font-size: 31px;
    font-weight: 900;
    letter-spacing: -0.06em;
  }

  .category-card-content {
    min-width: 0;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
    color: #049a87;
    font-size: 10px;
    font-weight: 800;
  }

  .status-badge svg {
    width: 14px;
    height: 14px;
  }

  .category-card h3 {
    margin: 0;
    color: #10253e;
    font-size: clamp(19px, 2.5vw, 25px);
    line-height: 1.15;
    letter-spacing: -0.035em;
  }

  .category-card p {
    margin: 5px 0 10px;
    overflow: hidden;
    color: #73849a;
    font-size: 11px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 13px;
    color: #8493a6;
    font-size: 10px;
  }

  .category-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .category-meta svg {
    width: 13px;
    height: 13px;
  }

  .category-action {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 16px;
    background: #17baa9;
    color: #ffffff;
    font-size: 20px;
    box-shadow: 0 9px 20px rgba(23, 186, 169, 0.24);
    transition:
      transform 160ms ease,
      background 160ms ease;
  }

  .category-action:hover {
    background: #08a894;
    transform: scale(1.04);
  }

  .category-action:active {
    transform: scale(0.96);
  }

  @media (max-width: 700px) {
    .category-page {
      padding:
        calc(12px + env(safe-area-inset-top))
        max(12px, env(safe-area-inset-right))
        calc(16px + env(safe-area-inset-bottom))
        max(12px, env(safe-area-inset-left));
    }

    .category-header {
      grid-template-columns: 44px minmax(0, 1fr) auto;
      gap: 10px;
      margin-bottom: 11px;
    }

    .category-header .icon-button {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      font-size: 20px;
    }

    .category-eyebrow {
      margin-bottom: 2px;
      font-size: 9px;
    }

    .category-heading h1 {
      font-size: clamp(23px, 7vw, 30px);
    }

    .profile-pill {
      min-width: 61px;
      min-height: 38px;
      padding: 0 12px;
      font-size: 12px;
    }

    .category-welcome {
      margin-bottom: 11px;
      padding: 12px 14px;
      border-radius: 16px;
    }

    .category-welcome span {
      font-size: 10px;
    }

    .category-welcome strong {
      font-size: 19px;
    }

    .category-welcome p {
      margin-top: 3px;
      font-size: 10px;
    }

    .category-count strong {
      font-size: 22px;
    }

    .category-count small {
      font-size: 8px;
    }

    .category-grid {
      grid-template-columns: 1fr;
      gap: 9px;
    }

    .category-card {
      min-height: 112px;
      grid-template-columns: 39px minmax(0, 1fr) 42px;
      gap: 10px;
      padding: 12px;
      border-radius: 16px;
    }

    .category-number {
      font-size: 25px;
    }

    .status-badge {
      margin-bottom: 4px;
      font-size: 9px;
    }

    .category-card h3 {
      font-size: 19px;
    }

    .category-card p {
      margin: 3px 0 7px;
      font-size: 10px;
    }

    .category-meta {
      gap: 7px 11px;
      font-size: 9px;
    }

    .category-action {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      font-size: 18px;
    }
  }

  @media (max-width: 390px) {
    .category-welcome p {
      display: none;
    }

    .category-card {
      min-height: 102px;
      grid-template-columns: 34px minmax(0, 1fr) 40px;
      padding: 10px;
    }

    .category-number {
      font-size: 22px;
    }

    .category-card h3 {
      font-size: 17px;
    }

    .category-card p {
      max-width: 190px;
    }

    .category-action {
      width: 40px;
      height: 40px;
    }
  }
`

function CategoryPage() {
  const navigate = useNavigate()

  const participant = JSON.parse(
    sessionStorage.getItem('musteriBuddyParticipant') || 'null',
  )

  const isDemo =
    sessionStorage.getItem('musteriBuddyMode') === 'demo'

  const participantName =
    participant?.fullName || 'Demo Katılımcısı'

  return (
    <>
      <style>{styles}</style>

      <main className="category-page">
        <div className="category-shell">
          <header className="category-header">
            <button
              type="button"
              className="icon-button"
              onClick={() => navigate('/')}
              aria-label="Geri dön"
            >
              <FiArrowLeft />
            </button>

            <div className="category-heading">
              <span className="category-eyebrow">
                {isDemo ? 'Demo modu' : 'Kategori sınavları'}
              </span>

              <h1>Kategorini seç</h1>
            </div>

            <div className="profile-pill">
              {participant?.storeCode || 'Demo'}
            </div>
          </header>

          <section className="category-welcome">
            <div>
              <span>Merhaba 👋</span>
              <strong>{participantName}</strong>
              <p>Kategori seçerek sınava başlayabilirsiniz.</p>
            </div>

            <div className="category-count">
              <strong>{categories.length}</strong>
              <small>Aktif kategori</small>
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

                    <span>
                      {isDemo ? 5 : category.questionCount} soru
                    </span>
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
        </div>
      </main>
    </>
  )
}

export default CategoryPage
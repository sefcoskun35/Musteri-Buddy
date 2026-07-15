import { useNavigate } from 'react-router-dom'
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiLayers,
  FiPlay,
  FiScissors,
  FiShoppingBag,
} from 'react-icons/fi'

const categories = [
  {
    id: 'health',
    title: 'Health',
    description: 'Sağlık ve iyi yaşam ürünleri',
    questionCount: 10,
    duration: '8 dk',
    accent: 'green',
    icon: FiHeart,
  },
  {
    id: 'personal-care',
    title: 'Personal Care',
    description: 'Kişisel bakım ve günlük ihtiyaçlar',
    questionCount: 10,
    duration: '8 dk',
    accent: 'blue',
    icon: FiActivity,
  },
  {
    id: 'hair-care',
    title: 'Hair Care',
    description: 'Saç bakımı ve ürün bilgisi',
    questionCount: 10,
    duration: '8 dk',
    accent: 'purple',
    icon: FiScissors,
  },
  {
    id: 'general-merchandise',
    title: 'General Merchandise',
    description: 'Genel ürün ve satış bilgisi',
    questionCount: 10,
    duration: '8 dk',
    accent: 'orange',
    icon: FiShoppingBag,
  },
]

const styles = `
  :root {
    --category-page-background: #f3f7f7;
    --category-text: #10253e;
    --category-muted: #708094;
    --category-border: rgba(255, 255, 255, 0.78);
    --category-surface: rgba(255, 255, 255, 0.84);
    --category-primary: #13b8a5;
    --category-primary-dark: #079886;
    --category-dark: #102d3d;
  }

  * {
    box-sizing: border-box;
  }

  button {
    font: inherit;
  }

  .category-page {
    width: 100%;
    min-height: 100dvh;
    padding:
      calc(16px + env(safe-area-inset-top))
      max(16px, env(safe-area-inset-right))
      calc(24px + env(safe-area-inset-bottom))
      max(16px, env(safe-area-inset-left));
    overflow-x: hidden;
    background:
      radial-gradient(
        circle at 95% 2%,
        rgba(71, 229, 201, 0.26),
        transparent 28%
      ),
      radial-gradient(
        circle at 4% 38%,
        rgba(104, 165, 255, 0.12),
        transparent 29%
      ),
      linear-gradient(180deg, #f8fbfb 0%, #eef4f4 100%);
    color: var(--category-text);
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .category-shell {
    width: min(1120px, 100%);
    margin: 0 auto;
  }

  .category-header {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: center;
    gap: 13px;
    margin-bottom: 15px;
  }

  .category-back-button {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(16, 37, 62, 0.08);
    border-radius: 17px;
    background: rgba(255, 255, 255, 0.88);
    color: var(--category-text);
    font-size: 21px;
    box-shadow:
      0 10px 26px rgba(16, 37, 62, 0.07),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .category-back-button:active {
    transform: scale(0.94);
    box-shadow:
      0 5px 14px rgba(16, 37, 62, 0.07),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  .category-heading {
    min-width: 0;
  }

  .category-eyebrow {
    display: block;
    margin-bottom: 3px;
    color: var(--category-primary-dark);
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .category-heading h1 {
    margin: 0;
    font-size: clamp(25px, 4vw, 38px);
    line-height: 1.08;
    letter-spacing: -0.045em;
  }

  .category-store-pill {
    min-width: 68px;
    min-height: 42px;
    display: grid;
    place-items: center;
    padding: 0 15px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 999px;
    background:
      linear-gradient(
        145deg,
        rgba(20, 52, 68, 0.98),
        rgba(10, 34, 47, 0.98)
      );
    color: #ffffff;
    font-size: 13px;
    font-weight: 850;
    letter-spacing: 0.07em;
    box-shadow:
      0 11px 26px rgba(16, 45, 61, 0.19),
      inset 0 1px 0 rgba(255, 255, 255, 0.14);
  }

  .category-summary {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    margin-bottom: 15px;
    padding: 16px 18px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.26);
    border-radius: 24px;
    background:
      radial-gradient(
        circle at 92% 0%,
        rgba(58, 224, 197, 0.27),
        transparent 38%
      ),
      linear-gradient(
        135deg,
        #102f40 0%,
        #0c2635 50%,
        #123a46 100%
      );
    color: #ffffff;
    box-shadow:
      0 18px 42px rgba(16, 45, 61, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.14);
  }

  .category-summary::after {
    content: "";
    position: absolute;
    top: -38px;
    right: -25px;
    width: 120px;
    height: 120px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }

  .category-summary-content {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .category-summary-content > span {
    display: block;
    margin-bottom: 3px;
    color: #5fe0cb;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .category-summary-content strong {
    display: block;
    overflow: hidden;
    font-size: clamp(19px, 4vw, 27px);
    line-height: 1.2;
    letter-spacing: -0.025em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-summary-content p {
    margin: 5px 0 0;
    color: rgba(255, 255, 255, 0.66);
    font-size: 11px;
    line-height: 1.5;
  }

  .category-summary-stats {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(62px, auto));
    gap: 8px;
  }

  .category-summary-stat {
    min-height: 61px;
    display: grid;
    place-items: center;
    align-content: center;
    padding: 8px 11px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 17px;
    background: rgba(255, 255, 255, 0.075);
    text-align: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .category-summary-stat strong {
    font-size: 19px;
    line-height: 1;
  }

  .category-summary-stat span {
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.58);
    font-size: 8px;
    font-weight: 750;
    text-transform: uppercase;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .category-card {
    --accent: #12b8a5;
    --accent-rgb: 18, 184, 165;
    position: relative;
    min-width: 0;
    min-height: 176px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 17px;
    overflow: hidden;
    border: 1px solid var(--category-border);
    border-radius: 27px;
    background:
      radial-gradient(
        circle at 92% 4%,
        rgba(var(--accent-rgb), 0.23),
        transparent 37%
      ),
      radial-gradient(
        circle at 4% 100%,
        rgba(var(--accent-rgb), 0.075),
        transparent 34%
      ),
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.96),
        rgba(248, 252, 252, 0.84)
      );
    box-shadow:
      0 17px 40px rgba(16, 37, 62, 0.085),
      0 3px 9px rgba(16, 37, 62, 0.035),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    isolation: isolate;
    cursor: pointer;
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      border-color 180ms ease;
  }

  .category-card::before {
    content: "";
    position: absolute;
    top: 0;
    right: 15%;
    width: 52%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.95),
      transparent
    );
  }

  .category-card::after {
    content: "";
    position: absolute;
    top: -68px;
    right: -60px;
    width: 155px;
    height: 155px;
    border: 1px solid rgba(var(--accent-rgb), 0.13);
    border-radius: 50%;
    z-index: -1;
  }

  .category-card.green {
    --accent: #0fae92;
    --accent-rgb: 15, 174, 146;
  }

  .category-card.blue {
    --accent: #347fda;
    --accent-rgb: 52, 127, 218;
  }

  .category-card.purple {
    --accent: #8260d5;
    --accent-rgb: 130, 96, 213;
  }

  .category-card.orange {
    --accent: #dd8738;
    --accent-rgb: 221, 135, 56;
  }

  .category-card:hover {
    transform: translateY(-3px);
    border-color: rgba(var(--accent-rgb), 0.23);
    box-shadow:
      0 23px 48px rgba(16, 37, 62, 0.12),
      0 4px 11px rgba(16, 37, 62, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 1);
  }

  .category-card:active {
    transform: scale(0.978);
    box-shadow:
      0 10px 24px rgba(16, 37, 62, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 1);
  }

  .category-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .category-icon-box {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid rgba(var(--accent-rgb), 0.16);
    border-radius: 19px;
    background:
      linear-gradient(
        145deg,
        rgba(var(--accent-rgb), 0.18),
        rgba(var(--accent-rgb), 0.08)
      );
    color: var(--accent);
    font-size: 23px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      0 8px 19px rgba(var(--accent-rgb), 0.11);
  }

  .category-ready-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 27px;
    padding: 0 9px;
    border: 1px solid rgba(var(--accent-rgb), 0.14);
    border-radius: 999px;
    background: rgba(var(--accent-rgb), 0.075);
    color: var(--accent);
    font-size: 9px;
    font-weight: 850;
  }

  .category-ready-badge svg {
    width: 13px;
    height: 13px;
  }

  .category-card-main {
    min-width: 0;
    margin-top: 14px;
  }

  .category-card-main h2 {
    margin: 0;
    color: var(--category-text);
    font-size: clamp(21px, 3vw, 28px);
    line-height: 1.12;
    letter-spacing: -0.04em;
  }

  .category-card-main p {
    margin: 5px 0 0;
    overflow: hidden;
    color: var(--category-muted);
    font-size: 11px;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 13px;
    margin-top: 16px;
  }

  .category-meta {
    min-width: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 12px;
    color: #8593a6;
    font-size: 9px;
    font-weight: 680;
  }

  .category-meta span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .category-meta svg {
    width: 13px;
    height: 13px;
    color: var(--accent);
  }

  .category-start-button {
    min-width: 94px;
    min-height: 43px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 13px;
    border: 0;
    border-radius: 15px;
    background:
      linear-gradient(
        145deg,
        var(--accent),
        rgba(var(--accent-rgb), 0.82)
      );
    color: #ffffff;
    font-size: 10px;
    font-weight: 850;
    box-shadow:
      0 10px 21px rgba(var(--accent-rgb), 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    pointer-events: none;
  }

  .category-start-button svg {
    width: 15px;
    height: 15px;
  }

  @media (max-width: 700px) {
    .category-page {
      padding:
        calc(11px + env(safe-area-inset-top))
        max(11px, env(safe-area-inset-right))
        calc(16px + env(safe-area-inset-bottom))
        max(11px, env(safe-area-inset-left));
    }

    .category-header {
      grid-template-columns: 43px minmax(0, 1fr) auto;
      gap: 9px;
      margin-bottom: 10px;
    }

    .category-back-button {
      width: 43px;
      height: 43px;
      border-radius: 15px;
      font-size: 19px;
    }

    .category-eyebrow {
      margin-bottom: 2px;
      font-size: 8px;
    }

    .category-heading h1 {
      font-size: clamp(22px, 7vw, 29px);
    }

    .category-store-pill {
      min-width: 59px;
      min-height: 38px;
      padding: 0 11px;
      font-size: 11px;
    }

    .category-summary {
      gap: 10px;
      margin-bottom: 10px;
      padding: 11px 12px;
      border-radius: 19px;
    }

    .category-summary-content > span {
      font-size: 8px;
    }

    .category-summary-content strong {
      font-size: 18px;
    }

    .category-summary-content p {
      margin-top: 3px;
      font-size: 9px;
    }

    .category-summary-stats {
      grid-template-columns: repeat(2, minmax(48px, auto));
      gap: 5px;
    }

    .category-summary-stat {
      min-height: 49px;
      padding: 5px 7px;
      border-radius: 13px;
    }

    .category-summary-stat strong {
      font-size: 16px;
    }

    .category-summary-stat span {
      margin-top: 3px;
      font-size: 6.5px;
    }

    .category-grid {
      grid-template-columns: 1fr;
      gap: 9px;
    }

    .category-card {
      min-height: 132px;
      padding: 13px;
      border-radius: 22px;
    }

    .category-card-top {
      align-items: center;
    }

    .category-icon-box {
      width: 45px;
      height: 45px;
      border-radius: 16px;
      font-size: 20px;
    }

    .category-ready-badge {
      min-height: 24px;
      padding: 0 8px;
      font-size: 8px;
    }

    .category-card-main {
      margin-top: 9px;
    }

    .category-card-main h2 {
      font-size: 19px;
    }

    .category-card-main p {
      margin-top: 3px;
      font-size: 9px;
    }

    .category-card-bottom {
      margin-top: 10px;
    }

    .category-meta {
      gap: 6px 9px;
      font-size: 8px;
    }

    .category-start-button {
      min-width: 83px;
      min-height: 38px;
      padding: 0 11px;
      border-radius: 13px;
      font-size: 9px;
    }
  }

  @media (max-width: 390px) {
    .category-summary-content p {
      display: none;
    }

    .category-card {
      min-height: 121px;
      padding: 11px;
      border-radius: 20px;
    }

    .category-icon-box {
      width: 41px;
      height: 41px;
      border-radius: 14px;
      font-size: 18px;
    }

    .category-card-main {
      margin-top: 7px;
    }

    .category-card-main h2 {
      font-size: 17px;
    }

    .category-card-main p {
      max-width: 225px;
    }

    .category-start-button {
      min-width: 76px;
      min-height: 36px;
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

  const totalQuestions = categories.reduce(
    (total, category) =>
      total + (isDemo ? 5 : category.questionCount),
    0,
  )

  const handleCategorySelect = (categoryId) => {
    navigate(`/quiz/${categoryId}`)
  }

  return (
    <>
      <style>{styles}</style>

      <main className="category-page">
        <div className="category-shell">
          <header className="category-header">
            <button
              type="button"
              className="category-back-button"
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

            <div className="category-store-pill">
              {participant?.storeCode || 'Demo'}
            </div>
          </header>

          <section className="category-summary">
            <div className="category-summary-content">
              <span>Başlamaya hazırsınız</span>
              <strong>Merhaba {participantName} 👋</strong>
              <p>
                Kategori seçerek bilgi seviyenizi ölçmeye başlayabilirsiniz.
              </p>
            </div>

            <div className="category-summary-stats">
              <div className="category-summary-stat">
                <strong>{categories.length}</strong>
                <span>Kategori</span>
              </div>

              <div className="category-summary-stat">
                <strong>{totalQuestions}</strong>
                <span>Toplam soru</span>
              </div>
            </div>
          </section>

          <section className="category-grid">
            {categories.map((category) => {
              const Icon = category.icon

              return (
                <article
                  key={category.id}
                  className={`category-card ${category.accent}`}
                  role="button"
                  tabIndex="0"
                  onClick={() =>
                    handleCategorySelect(category.id)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      event.preventDefault()
                      handleCategorySelect(category.id)
                    }
                  }}
                  aria-label={`${category.title} sınavını başlat`}
                >
                  <div className="category-card-top">
                    <span className="category-icon-box">
                      <Icon />
                    </span>

                    <span className="category-ready-badge">
                      <FiCheckCircle />
                      Sınava hazır
                    </span>
                  </div>

                  <div className="category-card-main">
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>

                  <div className="category-card-bottom">
                    <div className="category-meta">
                      <span>
                        <FiLayers />
                        {isDemo
                          ? 5
                          : category.questionCount}{' '}
                        soru
                      </span>

                      <span>
                        <FiClock />
                        {category.duration}
                      </span>
                    </div>

                    <span className="category-start-button">
                      <FiPlay />
                      Başla
                      <FiArrowRight />
                    </span>
                  </div>
                </article>
              )
            })}
          </section>
        </div>
      </main>
    </>
  )
}

export default CategoryPage
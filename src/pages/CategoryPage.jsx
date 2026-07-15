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
    --category-text: #ffffff;
    --category-dark: #071d35;
    --category-muted: rgba(255, 255, 255, 0.82);
    --category-turquoise: #22e5c1;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    min-height: 100%;
    margin: 0;
  }

  button {
    font: inherit;
  }

  .category-page {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    min-height: 100svh;
    padding:
      calc(10px + env(safe-area-inset-top))
      max(12px, env(safe-area-inset-right))
      calc(10px + env(safe-area-inset-bottom))
      max(12px, env(safe-area-inset-left));
    overflow: hidden;
    color: var(--category-text);
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    background:
      radial-gradient(
        circle at 8% 8%,
        rgba(31, 255, 193, 0.9),
        transparent 27%
      ),
      radial-gradient(
        circle at 90% 10%,
        rgba(0, 194, 255, 0.95),
        transparent 33%
      ),
      radial-gradient(
        circle at 50% 88%,
        rgba(0, 125, 255, 0.78),
        transparent 42%
      ),
      linear-gradient(
        145deg,
        #00caa6 0%,
        #00a9e9 43%,
        #087df1 100%
      );
    isolation: isolate;
  }

  .category-page::before,
  .category-page::after {
    content: "";
    position: absolute;
    pointer-events: none;
    z-index: -1;
  }

  .category-page::before {
    top: -70px;
    right: -50px;
    width: 280px;
    height: 280px;
    border-radius: 43% 57% 55% 45%;
    background: rgba(255, 255, 255, 0.08);
    transform: rotate(24deg);
    filter: blur(1px);
  }

  .category-page::after {
    left: -80px;
    bottom: -100px;
    width: 310px;
    height: 310px;
    border-radius: 50%;
    background: rgba(8, 77, 191, 0.2);
    filter: blur(2px);
  }

  .category-shell {
    width: min(960px, 100%);
    height: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    gap: 9px;
  }

  .category-header {
    min-width: 0;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
  }

  .category-back-button {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.72);
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.94);
    color: #0ca88f;
    font-size: 20px;
    box-shadow:
      0 10px 25px rgba(5, 57, 111, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    cursor: pointer;
    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .category-back-button:active {
    transform: scale(0.94);
  }

  .category-heading {
    min-width: 0;
  }

  .category-eyebrow {
    display: block;
    margin-bottom: 1px;
    color: rgba(255, 255, 255, 0.82);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .category-heading h1 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(22px, 6vw, 32px);
    line-height: 1.04;
    letter-spacing: -0.05em;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 5px 18px rgba(4, 54, 105, 0.2);
  }

  .category-store-pill {
    min-width: 62px;
    min-height: 39px;
    display: grid;
    place-items: center;
    padding: 0 13px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    background:
      linear-gradient(
        145deg,
        rgba(6, 35, 65, 0.98),
        rgba(5, 25, 49, 0.98)
      );
    color: #ffffff;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.06em;
    box-shadow:
      0 12px 28px rgba(4, 41, 79, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.16);
  }

  .category-summary {
    position: relative;
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 21px;
    background:
      radial-gradient(
        circle at 92% 5%,
        rgba(46, 232, 204, 0.24),
        transparent 42%
      ),
      linear-gradient(
        135deg,
        #092c47 0%,
        #071d35 54%,
        #0a3550 100%
      );
    box-shadow:
      0 15px 36px rgba(4, 42, 76, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .category-summary::before {
    content: "";
    position: absolute;
    top: -62px;
    right: -35px;
    width: 145px;
    height: 145px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
  }

  .category-summary-content {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .category-summary-content > span {
    display: block;
    margin-bottom: 2px;
    color: #31e8c8;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .category-summary-content strong {
    display: block;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(17px, 4.8vw, 23px);
    line-height: 1.12;
    letter-spacing: -0.035em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-summary-content p {
    margin: 3px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.63);
    font-size: 8px;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-summary-stats {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(48px, auto));
    gap: 5px;
  }

  .category-summary-stat {
    min-height: 48px;
    display: grid;
    place-items: center;
    align-content: center;
    padding: 5px 7px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
    text-align: center;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .category-summary-stat strong {
    color: #ffffff;
    font-size: 16px;
    line-height: 1;
  }

  .category-summary-stat span {
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.57);
    font-size: 6px;
    font-weight: 850;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .category-grid {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }

  .category-card {
    --accent: #08c996;
    --accent-dark: #079e7d;
    --accent-rgb: 8, 201, 150;
    position: relative;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 14px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.65);
    border-radius: 23px;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 80% 18%,
        rgba(255, 255, 255, 0.18),
        transparent 34%
      ),
      linear-gradient(
        145deg,
        var(--accent) 0%,
        var(--accent-dark) 100%
      );
    box-shadow:
      0 15px 32px rgba(4, 52, 94, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.35);
    isolation: isolate;
    cursor: pointer;
    transition:
      transform 180ms ease,
      box-shadow 180ms ease;
  }

  .category-card::before {
    content: "";
    position: absolute;
    top: -42%;
    right: -11%;
    width: 66%;
    aspect-ratio: 1;
    border-radius: 46% 54% 58% 42%;
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(31deg);
    z-index: -1;
  }

  .category-card::after {
    content: "";
    position: absolute;
    right: -12%;
    bottom: -52%;
    width: 75%;
    aspect-ratio: 1;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 50%;
    z-index: -1;
  }

  .category-card.green {
    --accent: #15dc94;
    --accent-dark: #00bba4;
    --accent-rgb: 21, 220, 148;
  }

  .category-card.blue {
    --accent: #2196ff;
    --accent-dark: #0872ed;
    --accent-rgb: 33, 150, 255;
  }

  .category-card.purple {
    --accent: #a74df6;
    --accent-dark: #7138ec;
    --accent-rgb: 167, 77, 246;
  }

  .category-card.orange {
    --accent: #ffb51b;
    --accent-dark: #f48016;
    --accent-rgb: 255, 181, 27;
  }

  .category-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 19px 38px rgba(4, 52, 94, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .category-card:active {
    transform: scale(0.98);
  }

  .category-card-top {
    min-width: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .category-icon-box {
    width: 43px;
    height: 43px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.96);
    color: var(--accent-dark);
    font-size: 20px;
    box-shadow:
      0 9px 20px rgba(1, 40, 75, 0.16),
      inset 0 1px 0 #ffffff;
  }

  .category-ready-badge {
    min-width: 0;
    min-height: 25px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 999px;
    background: rgba(0, 41, 81, 0.14);
    color: #ffffff;
    font-size: 8px;
    font-weight: 850;
    white-space: nowrap;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .category-ready-badge svg {
    width: 13px;
    height: 13px;
    flex: 0 0 auto;
  }

  .category-card-main {
    min-width: 0;
    margin-top: 6px;
  }

  .category-card-main h2 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(17px, 4vw, 24px);
    line-height: 1.05;
    letter-spacing: -0.045em;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 4px 12px rgba(0, 38, 76, 0.12);
  }

  .category-card-main p {
    margin: 3px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.84);
    font-size: 8px;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-card-bottom {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 7px;
    margin-top: 7px;
  }

  .category-meta {
    min-width: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px 8px;
    color: rgba(255, 255, 255, 0.91);
    font-size: 7.5px;
    font-weight: 750;
  }

  .category-meta span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .category-meta svg {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
  }

  .category-start-button {
    min-width: 78px;
    min-height: 35px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    flex: 0 0 auto;
    padding: 0 10px;
    border: 1px solid rgba(255, 255, 255, 0.88);
    border-radius: 13px;
    background: rgba(255, 255, 255, 0.96);
    color: var(--accent-dark);
    font-size: 8px;
    font-weight: 900;
    box-shadow:
      0 9px 20px rgba(1, 40, 75, 0.17),
      inset 0 1px 0 #ffffff;
    pointer-events: none;
  }

  .category-start-button svg {
    width: 14px;
    height: 14px;
    flex: 0 0 auto;
  }

  @media (max-width: 700px) {
    .category-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, minmax(0, 1fr));
    }

    .category-card {
      padding: 10px 12px;
      border-radius: 20px;
    }

    .category-card-top {
      align-items: center;
    }

    .category-card-main {
      position: absolute;
      left: 65px;
      top: 11px;
      right: 122px;
      margin: 0;
    }

    .category-card-main h2 {
      font-size: clamp(16px, 4.7vw, 20px);
    }

    .category-card-main p {
      margin-top: 2px;
      font-size: 7.5px;
    }

    .category-card-bottom {
      margin-top: 5px;
    }

    .category-meta {
      padding-left: 53px;
    }

    .category-ready-badge {
      min-height: 23px;
    }

    .category-icon-box {
      width: 43px;
      height: 43px;
    }

    .category-start-button {
      min-width: 82px;
      min-height: 34px;
    }
  }

  @media (max-width: 390px) {
    .category-page {
      padding:
        calc(7px + env(safe-area-inset-top))
        max(8px, env(safe-area-inset-right))
        calc(7px + env(safe-area-inset-bottom))
        max(8px, env(safe-area-inset-left));
    }

    .category-shell {
      gap: 6px;
    }

    .category-header {
      grid-template-columns: 39px minmax(0, 1fr) auto;
      gap: 7px;
    }

    .category-back-button {
      width: 39px;
      height: 39px;
      border-radius: 13px;
      font-size: 18px;
    }

    .category-heading h1 {
      font-size: 21px;
    }

    .category-store-pill {
      min-width: 54px;
      min-height: 35px;
      padding: 0 9px;
      font-size: 9px;
    }

    .category-summary {
      padding: 8px 9px;
      border-radius: 18px;
    }

    .category-summary-content p {
      display: none;
    }

    .category-summary-content strong {
      font-size: 16px;
    }

    .category-summary-stat {
      min-height: 42px;
      padding: 4px 6px;
      border-radius: 12px;
    }

    .category-summary-stat strong {
      font-size: 14px;
    }

    .category-grid {
      gap: 6px;
    }

    .category-card {
      padding: 8px 10px;
      border-radius: 18px;
    }

    .category-icon-box {
      width: 38px;
      height: 38px;
      border-radius: 13px;
      font-size: 17px;
    }

    .category-card-main {
      left: 56px;
      top: 9px;
      right: 108px;
    }

    .category-card-main h2 {
      font-size: 15px;
    }

    .category-card-main p {
      font-size: 7px;
    }

    .category-ready-badge {
      min-height: 21px;
      padding: 0 6px;
      font-size: 7px;
    }

    .category-meta {
      padding-left: 46px;
      gap: 4px 6px;
      font-size: 7px;
    }

    .category-meta svg {
      width: 10px;
      height: 10px;
    }

    .category-start-button {
      min-width: 72px;
      min-height: 30px;
      padding: 0 7px;
      border-radius: 11px;
      font-size: 7.5px;
    }

    .category-start-button svg {
      width: 12px;
      height: 12px;
    }
  }

  @media (max-height: 700px) {
    .category-page {
      padding-top: calc(6px + env(safe-area-inset-top));
      padding-bottom: calc(6px + env(safe-area-inset-bottom));
    }

    .category-shell {
      gap: 5px;
    }

    .category-header {
      grid-template-columns: 37px minmax(0, 1fr) auto;
      gap: 7px;
    }

    .category-back-button {
      width: 37px;
      height: 37px;
      border-radius: 12px;
    }

    .category-heading h1 {
      font-size: 20px;
    }

    .category-store-pill {
      min-height: 34px;
    }

    .category-summary {
      padding: 7px 9px;
    }

    .category-summary-content p {
      display: none;
    }

    .category-summary-stat {
      min-height: 39px;
    }

    .category-card {
      padding-top: 7px;
      padding-bottom: 7px;
    }

    .category-icon-box {
      width: 35px;
      height: 35px;
      border-radius: 12px;
      font-size: 16px;
    }

    .category-card-main {
      left: 53px;
      top: 8px;
    }

    .category-card-main h2 {
      font-size: 14px;
    }

    .category-card-main p {
      font-size: 6.5px;
    }

    .category-ready-badge {
      min-height: 20px;
    }

    .category-meta {
      padding-left: 43px;
    }

    .category-start-button {
      min-height: 28px;
    }
  }
`

function CategoryPage() {
  const navigate = useNavigate()

  let participant = null

  try {
    participant = JSON.parse(
      sessionStorage.getItem('musteriBuddyParticipant') || 'null',
    )
  } catch {
    participant = null
  }

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

              <strong>
                Merhaba {participantName} 👋
              </strong>

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
                  tabIndex={0}
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
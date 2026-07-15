import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCheck,
  FiChevronLeft,
  FiClock,
  FiHeart,
  FiHome,
  FiLock,
  FiShield,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiZap,
} from 'react-icons/fi'

const badgeDefinitions = [
  {
    id: 'first-step',
    title: 'İlk Adım',
    description: 'İlk kategori sınavını tamamla.',
    icon: FiBookOpen,
    tone: 'turquoise',
    condition: ({ hasResult }) => hasResult,
  },
  {
    id: 'successful',
    title: 'Başarı Rozeti',
    description: 'Bir sınavdan en az 70 puan al.',
    icon: FiAward,
    tone: 'gold',
    condition: ({ passed }) => passed,
  },
  {
    id: 'high-score',
    title: 'Yüksek Performans',
    description: 'Bir sınavdan en az 90 puan al.',
    icon: FiTrendingUp,
    tone: 'purple',
    condition: ({ score }) => score >= 90,
  },
  {
    id: 'perfect-score',
    title: 'Kusursuz Sonuç',
    description: 'Bir sınavı 100 puanla tamamla.',
    icon: FiStar,
    tone: 'pink',
    condition: ({ score }) => score === 100,
  },
  {
    id: 'fast-finish',
    title: 'Hızlı Çözüm',
    description: 'Bir sınavı 5 dakikadan kısa sürede bitir.',
    icon: FiZap,
    tone: 'blue',
    condition: ({ duration, hasResult }) =>
      hasResult && Number(duration) > 0 && Number(duration) < 300,
  },
  {
    id: 'category-master',
    title: 'Kategori Ustası',
    description: 'Dört kategorinin tamamında başarılı ol.',
    icon: FiTarget,
    tone: 'green',
    condition: () => false,
  },
]

const styles = `
  :root {
    --achievement-safe-top: env(safe-area-inset-top, 0px);
    --achievement-safe-right: env(safe-area-inset-right, 0px);
    --achievement-safe-bottom: env(safe-area-inset-bottom, 0px);
    --achievement-safe-left: env(safe-area-inset-left, 0px);
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    min-height: 100%;
    margin: 0;
  }

  button {
    font: inherit;
  }

  .achievements-page {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    min-height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(41, 255, 193, 0.96) 0%,
        rgba(41, 255, 193, 0.27) 24%,
        transparent 43%
      ),
      radial-gradient(
        circle at 100% 8%,
        rgba(0, 211, 255, 0.93) 0%,
        rgba(0, 190, 248, 0.3) 29%,
        transparent 50%
      ),
      radial-gradient(
        circle at 78% 88%,
        rgba(0, 107, 255, 0.74) 0%,
        transparent 48%
      ),
      linear-gradient(
        155deg,
        #14d9ad 0%,
        #06bbd7 34%,
        #0799eb 65%,
        #0874dc 100%
      );
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "SF Pro Display",
      "SF Pro Text",
      "Segoe UI",
      sans-serif;
    -webkit-font-smoothing: antialiased;
    isolation: isolate;
  }

  .achievements-page::before,
  .achievements-page::after {
    content: "";
    position: absolute;
    z-index: -2;
    pointer-events: none;
  }

  .achievements-page::before {
    width: 530px;
    height: 530px;
    top: -300px;
    right: -230px;
    border-radius: 44% 56% 62% 38%;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.15),
        rgba(255, 255, 255, 0.02)
      );
    transform: rotate(20deg);
  }

  .achievements-page::after {
    width: 390px;
    height: 390px;
    left: -250px;
    bottom: -190px;
    border: 13px dotted rgba(255, 255, 255, 0.11);
    border-radius: 50%;
  }

  .achievements-shell {
    width: min(100%, 920px);
    height: 100%;
    margin: 0 auto;
    padding:
      max(10px, var(--achievement-safe-top))
      max(12px, var(--achievement-safe-right))
      max(10px, var(--achievement-safe-bottom))
      max(12px, var(--achievement-safe-left));
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    gap: clamp(8px, 1.3vh, 14px);
  }

  .achievements-header {
    min-width: 0;
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) 48px;
    align-items: center;
    gap: 12px;
  }

  .achievements-header-button {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.88);
    border-radius: 16px;
    color: #08a58c;
    background:
      linear-gradient(
        145deg,
        #ffffff,
        rgba(245, 255, 252, 0.95)
      );
    box-shadow:
      0 13px 27px rgba(2, 53, 101, 0.21),
      inset 0 1px 0 #ffffff;
    font-size: 21px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform 160ms ease;
  }

  .achievements-header-button:last-child {
    border-radius: 50%;
  }

  .achievements-header-button:active {
    transform: scale(0.93);
  }

  .achievements-heading {
    min-width: 0;
  }

  .achievements-heading span {
    display: block;
    margin-bottom: 2px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.17em;
    text-transform: uppercase;
  }

  .achievements-heading h1 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(24px, 5vw, 36px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.05em;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 7px 20px rgba(3, 49, 91, 0.22);
  }

  .achievements-summary {
    position: relative;
    min-width: 0;
    min-height: 112px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 27px;
    background:
      radial-gradient(
        circle at 92% 5%,
        rgba(46, 232, 204, 0.24),
        transparent 40%
      ),
      linear-gradient(
        135deg,
        #082c49 0%,
        #031d35 53%,
        #08324f 100%
      );
    box-shadow:
      0 19px 40px rgba(1, 37, 74, 0.31),
      inset 0 1px 0 rgba(255, 255, 255, 0.13);
  }

  .achievements-summary::before {
    content: "";
    position: absolute;
    width: 170px;
    height: 170px;
    top: -90px;
    right: -70px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
  }

  .achievements-summary-content {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .achievements-summary-content > span {
    display: block;
    margin-bottom: 5px;
    color: #31e5c6;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .achievements-summary-content strong {
    display: block;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(20px, 4.8vw, 30px);
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -0.045em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .achievements-summary-content p {
    margin: 5px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.64);
    font-size: 10px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .achievements-progress {
    position: relative;
    z-index: 1;
    width: 84px;
    height: 84px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 50%;
    background:
      conic-gradient(
        #2ce7c4 calc(var(--progress) * 1%),
        rgba(255, 255, 255, 0.1) 0
      );
    box-shadow:
      0 13px 26px rgba(0, 13, 32, 0.17),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .achievements-progress::before {
    content: "";
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: #082944;
  }

  .achievements-progress-content {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
  }

  .achievements-progress-content strong {
    color: #ffffff;
    font-size: 22px;
    font-weight: 900;
    line-height: 1;
  }

  .achievements-progress-content span {
    margin-top: 3px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 6px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .achievements-content {
    min-height: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 8px;
  }

  .achievements-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 3px;
  }

  .achievements-section-header h2 {
    margin: 0;
    color: #ffffff;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: -0.025em;
  }

  .achievements-section-header span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 9px;
    font-weight: 800;
  }

  .achievements-grid {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: clamp(7px, 1.1vh, 11px);
  }

  .achievement-card {
    --badge-start: #20d9ae;
    --badge-end: #0aa7c3;
    --badge-ink: #07977f;

    position: relative;
    min-width: 0;
    min-height: 0;
    height: 100%;
    padding: clamp(10px, 1.4vw, 15px);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.65);
    border-radius: clamp(18px, 2.5vw, 24px);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 82% 10%,
        rgba(255, 255, 255, 0.21),
        transparent 34%
      ),
      linear-gradient(
        145deg,
        var(--badge-start),
        var(--badge-end)
      );
    box-shadow:
      0 14px 27px rgba(2, 48, 91, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.38);
    isolation: isolate;
  }

  .achievement-card::before {
    content: "";
    position: absolute;
    z-index: -1;
    width: 75%;
    aspect-ratio: 1;
    top: -45%;
    right: -26%;
    border-radius: 44% 56% 62% 38%;
    background: rgba(255, 255, 255, 0.12);
    transform: rotate(29deg);
  }

  .achievement-card.gold {
    --badge-start: #ffd64d;
    --badge-end: #f39a16;
    --badge-ink: #d67d00;
  }

  .achievement-card.purple {
    --badge-start: #bb5af6;
    --badge-end: #683ce8;
    --badge-ink: #7235db;
  }

  .achievement-card.pink {
    --badge-start: #ff75b3;
    --badge-end: #e84791;
    --badge-ink: #da3d83;
  }

  .achievement-card.blue {
    --badge-start: #3eb3ff;
    --badge-end: #1774e8;
    --badge-ink: #126bd8;
  }

  .achievement-card.green {
    --badge-start: #34e48e;
    --badge-end: #00aa7d;
    --badge-ink: #009970;
  }

  .achievement-card.locked {
    border-color: rgba(255, 255, 255, 0.16);
    background:
      radial-gradient(
        circle at 82% 10%,
        rgba(255, 255, 255, 0.07),
        transparent 34%
      ),
      linear-gradient(
        145deg,
        rgba(14, 58, 88, 0.92),
        rgba(5, 38, 66, 0.95)
      );
    box-shadow:
      0 12px 24px rgba(2, 38, 73, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .achievement-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 7px;
  }

  .achievement-icon {
    width: clamp(40px, 4.7vw, 53px);
    height: clamp(40px, 4.7vw, 53px);
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.92);
    border-radius: 50%;
    color: var(--badge-ink);
    background:
      linear-gradient(
        145deg,
        #ffffff,
        rgba(247, 252, 255, 0.96)
      );
    box-shadow:
      0 10px 19px rgba(1, 40, 77, 0.17),
      inset 0 1px 0 #ffffff;
    font-size: clamp(18px, 2.2vw, 24px);
  }

  .achievement-card.locked .achievement-icon {
    border-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.42);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: none;
  }

  .achievement-status {
    min-width: 24px;
    min-height: 24px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.26);
    border-radius: 50%;
    color: #ffffff;
    background: rgba(0, 47, 82, 0.18);
    font-size: 12px;
  }

  .achievement-card-main {
    min-width: 0;
    align-self: center;
    padding: 5px 0;
  }

  .achievement-card-main h3 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(13px, 1.8vw, 18px);
    font-weight: 900;
    line-height: 1.06;
    letter-spacing: -0.035em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .achievement-card-main p {
    margin: 4px 0 0;
    display: -webkit-box;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.8);
    font-size: clamp(7px, 1vw, 9px);
    line-height: 1.25;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .achievement-card-footer {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 5px;
    color: rgba(255, 255, 255, 0.91);
    font-size: clamp(7px, 1vw, 9px);
    font-weight: 850;
  }

  .achievement-card-footer svg {
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
  }

  .achievements-bottom-nav {
    min-height: 70px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: center;
    padding: 6px 9px;
    border: 1px solid rgba(255, 255, 255, 0.17);
    border-radius: 25px;
    background:
      linear-gradient(
        145deg,
        rgba(4, 37, 66, 0.98),
        rgba(3, 27, 51, 0.98)
      );
    box-shadow:
      0 17px 36px rgba(0, 34, 73, 0.36),
      inset 0 1px 0 rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(24px) saturate(145%);
    -webkit-backdrop-filter: blur(24px) saturate(145%);
  }

  .achievements-nav-item {
    min-width: 0;
    min-height: 55px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 4px;
    padding: 3px;
    border: 0;
    border-radius: 16px;
    color: rgba(193, 214, 234, 0.61);
    background: transparent;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      color 170ms ease,
      background-color 170ms ease,
      transform 170ms ease;
  }

  .achievements-nav-item svg {
    width: 21px;
    height: 21px;
  }

  .achievements-nav-item span {
    overflow: hidden;
    max-width: 100%;
    font-size: 8px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .achievements-nav-item.active {
    color: #24e4bc;
  }

  .achievements-nav-item:active {
    transform: scale(0.92);
  }

  @media (max-width: 700px) {
    .achievements-shell {
      gap: clamp(6px, 1vh, 9px);
    }

    .achievements-header {
      grid-template-columns: 42px minmax(0, 1fr) 42px;
      gap: 9px;
    }

    .achievements-header-button {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      font-size: 19px;
    }

    .achievements-heading h1 {
      font-size: clamp(23px, 7vw, 30px);
    }

    .achievements-summary {
      min-height: 88px;
      padding: 10px 12px;
      border-radius: 21px;
    }

    .achievements-summary-content {
      max-width: calc(100vw - 132px);
    }

    .achievements-summary-content > span {
      margin-bottom: 3px;
      font-size: 7px;
    }

    .achievements-summary-content strong {
      font-size: clamp(16px, 5vw, 21px);
    }

    .achievements-summary-content p {
      font-size: 7px;
    }

    .achievements-progress {
      width: 64px;
      height: 64px;
    }

    .achievements-progress-content strong {
      font-size: 17px;
    }

    .achievements-progress-content span {
      font-size: 5px;
    }

    .achievements-section-header h2 {
      font-size: 12px;
    }

    .achievements-section-header span {
      font-size: 7px;
    }

    .achievements-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: repeat(3, minmax(0, 1fr));
      gap: clamp(6px, 0.9vh, 8px);
    }

    .achievement-card {
      padding: clamp(7px, 1.2vh, 10px);
      border-radius: 17px;
    }

    .achievement-icon {
      width: clamp(34px, 9vw, 43px);
      height: clamp(34px, 9vw, 43px);
      font-size: clamp(15px, 4.2vw, 20px);
    }

    .achievement-status {
      min-width: 20px;
      min-height: 20px;
      font-size: 10px;
    }

    .achievement-card-main {
      padding: 2px 0;
    }

    .achievement-card-main h3 {
      font-size: clamp(11px, 3.3vw, 14px);
    }

    .achievement-card-main p {
      margin-top: 2px;
      font-size: clamp(6px, 1.9vw, 7.5px);
    }

    .achievement-card-footer {
      font-size: 6.5px;
    }

    .achievement-card-footer svg {
      width: 10px;
      height: 10px;
    }

    .achievements-bottom-nav {
      min-height: 62px;
      padding: 4px 6px;
      border-radius: 22px;
    }

    .achievements-nav-item {
      min-height: 50px;
      gap: 3px;
      border-radius: 14px;
    }

    .achievements-nav-item svg {
      width: 19px;
      height: 19px;
    }

    .achievements-nav-item span {
      font-size: 7px;
    }
  }

  @media (max-width: 390px) {
    .achievements-shell {
      padding:
        max(7px, var(--achievement-safe-top))
        max(8px, var(--achievement-safe-right))
        max(7px, var(--achievement-safe-bottom))
        max(8px, var(--achievement-safe-left));
    }

    .achievements-header {
      grid-template-columns: 38px minmax(0, 1fr) 38px;
      gap: 7px;
    }

    .achievements-header-button {
      width: 38px;
      height: 38px;
      border-radius: 13px;
      font-size: 17px;
    }

    .achievements-heading h1 {
      font-size: 21px;
    }

    .achievements-summary {
      min-height: 78px;
      padding: 8px 9px;
      border-radius: 18px;
    }

    .achievements-summary-content strong {
      font-size: 15px;
    }

    .achievements-progress {
      width: 57px;
      height: 57px;
    }

    .achievements-progress-content strong {
      font-size: 15px;
    }

    .achievement-card {
      padding: 6px 7px;
      border-radius: 15px;
    }

    .achievement-icon {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .achievement-status {
      min-width: 18px;
      min-height: 18px;
      font-size: 9px;
    }

    .achievement-card-main h3 {
      font-size: 10px;
    }

    .achievement-card-main p {
      font-size: 5.8px;
    }

    .achievements-bottom-nav {
      min-height: 57px;
      border-radius: 20px;
    }

    .achievements-nav-item {
      min-height: 45px;
    }

    .achievements-nav-item svg {
      width: 17px;
      height: 17px;
    }

    .achievements-nav-item span {
      font-size: 6.5px;
    }
  }

  @media (max-height: 700px) {
    .achievements-shell {
      gap: 5px;
      padding-top: max(5px, var(--achievement-safe-top));
      padding-bottom: max(5px, var(--achievement-safe-bottom));
    }

    .achievements-summary {
      min-height: 68px;
      padding-top: 6px;
      padding-bottom: 6px;
    }

    .achievements-progress {
      width: 52px;
      height: 52px;
    }

    .achievement-card {
      padding-top: 5px;
      padding-bottom: 5px;
    }

    .achievement-icon {
      width: 29px;
      height: 29px;
      font-size: 13px;
    }

    .achievement-card-main p {
      -webkit-line-clamp: 1;
    }

    .achievements-bottom-nav {
      min-height: 51px;
    }

    .achievements-nav-item {
      min-height: 40px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .achievements-header-button,
    .achievements-nav-item {
      transition-duration: 0.01ms !important;
    }
  }
`

function AchievementsPage() {
  const navigate = useNavigate()

  let participant = null
  let result = null

  try {
    participant = JSON.parse(
      sessionStorage.getItem('musteriBuddyParticipant') || 'null',
    )
  } catch {
    participant = null
  }

  try {
    result = JSON.parse(
      sessionStorage.getItem('musteriBuddyResult') || 'null',
    )
  } catch {
    result = null
  }

  const participantName =
    participant?.fullName?.trim() || 'Demo Katılımcısı'

  const achievementContext = {
    hasResult: Boolean(result),
    passed: Number(result?.score || 0) >= 70,
    score: Number(result?.score || 0),
    duration: Number(result?.duration || 0),
  }

  const badges = useMemo(
    () =>
      badgeDefinitions.map((badge) => ({
        ...badge,
        unlocked: badge.condition(achievementContext),
      })),
    [
      achievementContext.hasResult,
      achievementContext.passed,
      achievementContext.score,
      achievementContext.duration,
    ],
  )

  const unlockedCount = badges.filter(
    (badge) => badge.unlocked,
  ).length

  const progress = Math.round(
    (unlockedCount / badges.length) * 100,
  )

  return (
    <>
      <style>{styles}</style>

      <main className="achievements-page">
        <div className="achievements-shell">
          <header className="achievements-header">
            <button
              type="button"
              className="achievements-header-button"
              onClick={() => navigate('/kategoriler')}
              aria-label="Kategorilere dön"
            >
              <FiChevronLeft />
            </button>

            <div className="achievements-heading">
              <span>Müşteri Buddy</span>
              <h1>Başarılar</h1>
            </div>

            <button
              type="button"
              className="achievements-header-button"
             onClick={() => navigate('/profil')}
              aria-label="Katılımcı profili"
            >
              <FiUser />
            </button>
          </header>

          <section className="achievements-summary">
            <div className="achievements-summary-content">
              <span>Rozet koleksiyonu</span>

              <strong>{participantName}</strong>

              <p>
                Sınavları tamamlayarak yeni başarı
                rozetlerinin kilidini aç.
              </p>
            </div>

            <div
              className="achievements-progress"
              style={{ '--progress': progress }}
              aria-label={`Başarı ilerlemesi yüzde ${progress}`}
            >
              <div className="achievements-progress-content">
                <strong>
                  {unlockedCount}/{badges.length}
                </strong>
                <span>Kazanıldı</span>
              </div>
            </div>
          </section>

          <section className="achievements-content">
            <div className="achievements-section-header">
              <h2>Başarı rozetlerin</h2>
              <span>Geçme notu: 70 puan</span>
            </div>

            <div className="achievements-grid">
              {badges.map((badge) => {
                const Icon = badge.icon

                return (
                  <article
                    key={badge.id}
                    className={`achievement-card ${badge.tone} ${
                      badge.unlocked ? '' : 'locked'
                    }`}
                  >
                    <div className="achievement-card-top">
                      <span
                        className="achievement-icon"
                        aria-hidden="true"
                      >
                        <Icon />
                      </span>

                      <span
                        className="achievement-status"
                        aria-label={
                          badge.unlocked
                            ? 'Rozet kazanıldı'
                            : 'Rozet kilitli'
                        }
                      >
                        {badge.unlocked ? (
                          <FiCheck />
                        ) : (
                          <FiLock />
                        )}
                      </span>
                    </div>

                    <div className="achievement-card-main">
                      <h3>{badge.title}</h3>
                      <p>{badge.description}</p>
                    </div>

                    <div className="achievement-card-footer">
                      {badge.unlocked ? (
                        <>
                          <FiAward />
                          Rozet kazanıldı
                        </>
                      ) : (
                        <>
                          <FiShield />
                          Henüz kilitli
                        </>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <nav
            className="achievements-bottom-nav"
            aria-label="Alt navigasyon"
          >
            <button
              type="button"
              className="achievements-nav-item"
              onClick={() => navigate('/kategoriler')}
            >
              <FiHome />
              <span>Ana Sayfa</span>
            </button>

            <button
              type="button"
              className="achievements-nav-item active"
              aria-current="page"
            >
              <FiAward />
              <span>Başarılar</span>
            </button>

            <button
              type="button"
              className="achievements-nav-item"
              onClick={() => navigate('/kategoriler')}
            >
              <FiBarChart2 />
              <span>İstatistikler</span>
            </button>

            <button
              type="button"
              className="achievements-nav-item"
              onClick={() => navigate('/profil')}
            >
              <FiUser />
              <span>Profil</span>
            </button>
          </nav>
        </div>
      </main>
    </>
  )
}

export default AchievementsPage
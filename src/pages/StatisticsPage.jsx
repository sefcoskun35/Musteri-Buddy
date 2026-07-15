import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiClock,
  FiHome,
  FiPieChart,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiXCircle,
} from 'react-icons/fi'

const categoryNames = {
  health: 'Health',
  'personal-care': 'Personal Care',
  'hair-care': 'Hair Care',
  'general-merchandise': 'General Merchandise',
}

const styles = `
  :root {
    --statistics-safe-top: env(safe-area-inset-top, 0px);
    --statistics-safe-right: env(safe-area-inset-right, 0px);
    --statistics-safe-bottom: env(safe-area-inset-bottom, 0px);
    --statistics-safe-left: env(safe-area-inset-left, 0px);
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
    overflow: hidden;
    overscroll-behavior: none;
  }

  body {
    position: fixed;
    inset: 0;
  }

  button {
    font: inherit;
  }

  .statistics-page {
    position: fixed;
    inset: 0;
    isolation: isolate;
    width: 100%;
    height: 100dvh;
    min-height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(40, 255, 191, 0.96) 0%,
        rgba(40, 255, 191, 0.28) 23%,
        transparent 43%
      ),
      radial-gradient(
        circle at 100% 7%,
        rgba(0, 211, 255, 0.94) 0%,
        rgba(0, 190, 248, 0.31) 29%,
        transparent 49%
      ),
      radial-gradient(
        circle at 80% 88%,
        rgba(0, 108, 255, 0.75) 0%,
        transparent 49%
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
  }

  .statistics-page::before,
  .statistics-page::after {
    content: "";
    position: absolute;
    z-index: -2;
    pointer-events: none;
  }

  .statistics-page::before {
    width: 540px;
    height: 540px;
    top: -310px;
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

  .statistics-page::after {
    width: 390px;
    height: 390px;
    left: -250px;
    bottom: -190px;
    border: 13px dotted rgba(255, 255, 255, 0.11);
    border-radius: 50%;
  }

  .statistics-shell {
    width: min(100%, 920px);
    height: 100%;
    margin: 0 auto;
    padding:
      max(10px, var(--statistics-safe-top))
      max(12px, var(--statistics-safe-right))
      max(10px, var(--statistics-safe-bottom))
      max(12px, var(--statistics-safe-left));
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    gap: clamp(8px, 1.3vh, 14px);
  }

  .statistics-header {
    min-width: 0;
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) 48px;
    align-items: center;
    gap: 12px;
  }

  .statistics-header-button {
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

  .statistics-header-button:last-child {
    border-radius: 50%;
  }

  .statistics-header-button:active {
    transform: scale(0.93);
  }

  .statistics-heading {
    min-width: 0;
  }

  .statistics-heading span {
    display: block;
    margin-bottom: 2px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.17em;
    text-transform: uppercase;
  }

  .statistics-heading h1 {
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

  .statistics-summary {
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

  .statistics-summary::before {
    content: "";
    position: absolute;
    width: 170px;
    height: 170px;
    top: -90px;
    right: -70px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
  }

  .statistics-summary-content {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .statistics-summary-content > span {
    display: block;
    margin-bottom: 5px;
    color: #31e5c6;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .statistics-summary-content strong {
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

  .statistics-summary-content p {
    margin: 5px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.64);
    font-size: 10px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .statistics-score {
    position: relative;
    z-index: 1;
    width: 84px;
    height: 84px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 50%;
    background:
      conic-gradient(
        #2ce7c4 calc(var(--score) * 1%),
        rgba(255, 255, 255, 0.1) 0
      );
    box-shadow:
      0 13px 26px rgba(0, 13, 32, 0.17),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .statistics-score::before {
    content: "";
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: #082944;
  }

  .statistics-score-content {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
  }

  .statistics-score-content strong {
    color: #ffffff;
    font-size: 22px;
    font-weight: 900;
    line-height: 1;
  }

  .statistics-score-content span {
    margin-top: 3px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 6px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .statistics-content {
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(0, 1fr) minmax(0, 0.72fr);
    gap: clamp(7px, 1.1vh, 11px);
  }

  .statistics-cards {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(7px, 1vw, 11px);
  }

  .statistics-card {
    position: relative;
    min-width: 0;
    min-height: 0;
    padding: clamp(10px, 1.5vw, 15px);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: clamp(18px, 2.5vw, 24px);
    display: grid;
    align-content: space-between;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 85% 8%,
        rgba(255, 255, 255, 0.19),
        transparent 37%
      ),
      linear-gradient(
        145deg,
        rgba(11, 78, 123, 0.94),
        rgba(5, 46, 80, 0.97)
      );
    box-shadow:
      0 14px 27px rgba(2, 48, 91, 0.19),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .statistics-card.success {
    background:
      radial-gradient(
        circle at 85% 8%,
        rgba(255, 255, 255, 0.2),
        transparent 37%
      ),
      linear-gradient(145deg, #22d99d, #05a989);
  }

  .statistics-card.danger {
    background:
      radial-gradient(
        circle at 85% 8%,
        rgba(255, 255, 255, 0.2),
        transparent 37%
      ),
      linear-gradient(145deg, #ff6f8d, #dc3d67);
  }

  .statistics-card.blue {
    background:
      radial-gradient(
        circle at 85% 8%,
        rgba(255, 255, 255, 0.2),
        transparent 37%
      ),
      linear-gradient(145deg, #39aefc, #176edb);
  }

  .statistics-card-icon {
    width: clamp(35px, 4.5vw, 48px);
    height: clamp(35px, 4.5vw, 48px);
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    color: #087a6b;
    background: rgba(255, 255, 255, 0.95);
    box-shadow:
      0 9px 18px rgba(1, 40, 77, 0.16),
      inset 0 1px 0 #ffffff;
    font-size: clamp(16px, 2vw, 22px);
  }

  .statistics-card strong {
    display: block;
    margin-top: 6px;
    color: #ffffff;
    font-size: clamp(21px, 3vw, 31px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .statistics-card span {
    display: block;
    margin-top: 5px;
    color: rgba(255, 255, 255, 0.77);
    font-size: clamp(7px, 1vw, 9px);
    font-weight: 850;
    text-transform: uppercase;
  }

  .statistics-detail {
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
    gap: clamp(7px, 1vw, 11px);
  }

  .statistics-panel {
    min-width: 0;
    min-height: 0;
    padding: clamp(11px, 1.5vw, 16px);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: clamp(18px, 2.5vw, 24px);
    background:
      linear-gradient(
        145deg,
        rgba(4, 43, 75, 0.94),
        rgba(3, 28, 52, 0.97)
      );
    box-shadow:
      0 14px 27px rgba(2, 48, 91, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .statistics-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .statistics-panel-header h2 {
    margin: 0;
    color: #ffffff;
    font-size: clamp(12px, 1.7vw, 16px);
    font-weight: 900;
    letter-spacing: -0.025em;
  }

  .statistics-panel-header svg {
    color: #2ce7c4;
    font-size: 18px;
  }

  .statistics-bar-list {
    display: grid;
    gap: 8px;
    margin-top: 10px;
  }

  .statistics-bar-row {
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(92px, 0.45fr) minmax(0, 1fr) auto;
    align-items: center;
    gap: 9px;
  }

  .statistics-bar-row span {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.72);
    font-size: clamp(7px, 1vw, 9px);
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .statistics-bar-track {
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.09);
  }

  .statistics-bar-fill {
    height: 100%;
    border-radius: inherit;
    background:
      linear-gradient(90deg, #25e3bd, #31aef7);
  }

  .statistics-bar-row strong {
    min-width: 28px;
    color: #ffffff;
    font-size: 9px;
    font-weight: 900;
    text-align: right;
  }

  .statistics-latest {
    height: calc(100% - 28px);
    display: grid;
    place-items: center;
    align-content: center;
    padding: 8px;
    text-align: center;
  }

  .statistics-latest-icon {
    width: clamp(45px, 6vw, 64px);
    height: clamp(45px, 6vw, 64px);
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: #2ce7c4;
    background: rgba(255, 255, 255, 0.07);
    font-size: clamp(20px, 3vw, 27px);
  }

  .statistics-latest strong {
    margin-top: 8px;
    color: #ffffff;
    font-size: clamp(12px, 1.8vw, 16px);
    font-weight: 900;
  }

  .statistics-latest span {
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.59);
    font-size: clamp(7px, 1vw, 9px);
  }

  .statistics-bottom-nav {
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

  .statistics-nav-item {
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

  .statistics-nav-item svg {
    width: 21px;
    height: 21px;
  }

  .statistics-nav-item span {
    overflow: hidden;
    max-width: 100%;
    font-size: 8px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .statistics-nav-item.active {
    color: #24e4bc;
  }

  .statistics-nav-item:active {
    transform: scale(0.92);
  }

  @media (max-width: 700px) {
    .statistics-shell {
      gap: clamp(6px, 1vh, 9px);
    }

    .statistics-header {
      grid-template-columns: 42px minmax(0, 1fr) 42px;
      gap: 9px;
    }

    .statistics-header-button {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      font-size: 19px;
    }

    .statistics-heading h1 {
      font-size: clamp(23px, 7vw, 30px);
    }

    .statistics-summary {
      min-height: 88px;
      padding: 10px 12px;
      border-radius: 21px;
    }

    .statistics-summary-content {
      max-width: calc(100vw - 132px);
    }

    .statistics-summary-content > span {
      margin-bottom: 3px;
      font-size: 7px;
    }

    .statistics-summary-content strong {
      font-size: clamp(16px, 5vw, 21px);
    }

    .statistics-summary-content p {
      font-size: 7px;
    }

    .statistics-score {
      width: 64px;
      height: 64px;
    }

    .statistics-score-content strong {
      font-size: 17px;
    }

    .statistics-content {
      grid-template-rows: minmax(0, 0.8fr) minmax(0, 1.2fr);
    }

    .statistics-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: repeat(2, minmax(0, 1fr));
      gap: 7px;
    }

    .statistics-card {
      padding: 8px 10px;
      border-radius: 17px;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      align-content: center;
      column-gap: 8px;
    }

    .statistics-card-icon {
      grid-row: 1 / 3;
      width: 35px;
      height: 35px;
      font-size: 16px;
    }

    .statistics-card strong {
      margin: 0;
      font-size: 18px;
    }

    .statistics-card span {
      margin-top: 2px;
      font-size: 6px;
    }

    .statistics-detail {
      grid-template-columns: 1fr;
      grid-template-rows: minmax(0, 1fr) minmax(0, 0.72fr);
      gap: 7px;
    }

    .statistics-panel {
      padding: 8px 10px;
      border-radius: 17px;
    }

    .statistics-panel-header h2 {
      font-size: 10px;
    }

    .statistics-bar-list {
      gap: 5px;
      margin-top: 6px;
    }

    .statistics-bar-row {
      grid-template-columns: minmax(70px, 0.45fr) minmax(0, 1fr) auto;
      gap: 6px;
    }

    .statistics-bar-track {
      height: 6px;
    }

    .statistics-latest {
      grid-template-columns: auto minmax(0, 1fr);
      grid-template-rows: auto auto;
      column-gap: 8px;
      align-content: center;
      justify-items: start;
      text-align: left;
    }

    .statistics-latest-icon {
      grid-row: 1 / 3;
      width: 38px;
      height: 38px;
      font-size: 17px;
    }

    .statistics-latest strong {
      margin: 0;
      font-size: 11px;
    }

    .statistics-latest span {
      margin-top: 2px;
      font-size: 6.5px;
    }

    .statistics-bottom-nav {
      min-height: 62px;
      padding: 4px 6px;
      border-radius: 22px;
    }

    .statistics-nav-item {
      min-height: 50px;
      gap: 3px;
      border-radius: 14px;
    }

    .statistics-nav-item svg {
      width: 19px;
      height: 19px;
    }

    .statistics-nav-item span {
      font-size: 7px;
    }
  }

  @media (max-width: 390px) {
    .statistics-shell {
      padding:
        max(7px, var(--statistics-safe-top))
        max(8px, var(--statistics-safe-right))
        max(7px, var(--statistics-safe-bottom))
        max(8px, var(--statistics-safe-left));
    }

    .statistics-header {
      grid-template-columns: 38px minmax(0, 1fr) 38px;
      gap: 7px;
    }

    .statistics-header-button {
      width: 38px;
      height: 38px;
      border-radius: 13px;
      font-size: 17px;
    }

    .statistics-heading h1 {
      font-size: 21px;
    }

    .statistics-summary {
      min-height: 78px;
      padding: 8px 9px;
      border-radius: 18px;
    }

    .statistics-summary-content strong {
      font-size: 15px;
    }

    .statistics-score {
      width: 57px;
      height: 57px;
    }

    .statistics-score-content strong {
      font-size: 15px;
    }

    .statistics-card {
      padding: 6px 7px;
      border-radius: 15px;
    }

    .statistics-card-icon {
      width: 30px;
      height: 30px;
      font-size: 14px;
    }

    .statistics-card strong {
      font-size: 16px;
    }

    .statistics-panel {
      padding: 6px 8px;
      border-radius: 15px;
    }

    .statistics-bar-row {
      grid-template-columns: minmax(62px, 0.45fr) minmax(0, 1fr) auto;
    }

    .statistics-bottom-nav {
      min-height: 57px;
      border-radius: 20px;
    }

    .statistics-nav-item {
      min-height: 45px;
    }

    .statistics-nav-item svg {
      width: 17px;
      height: 17px;
    }

    .statistics-nav-item span {
      font-size: 6.5px;
    }
  }

  @media (max-height: 700px) {
    .statistics-shell {
      gap: 5px;
      padding-top: max(5px, var(--statistics-safe-top));
      padding-bottom: max(5px, var(--statistics-safe-bottom));
    }

    .statistics-summary {
      min-height: 68px;
      padding-top: 6px;
      padding-bottom: 6px;
    }

    .statistics-score {
      width: 52px;
      height: 52px;
    }

    .statistics-card-icon {
      width: 28px;
      height: 28px;
      font-size: 13px;
    }

    .statistics-card strong {
      font-size: 15px;
    }

    .statistics-bottom-nav {
      min-height: 51px;
    }

    .statistics-nav-item {
      min-height: 40px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .statistics-header-button,
    .statistics-nav-item {
      transition-duration: 0.01ms !important;
    }
  }
`

function StatisticsPage() {
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

  const statistics = useMemo(() => {
    const score = Number(result?.score || 0)
    const correctCount = Number(result?.correctCount || 0)
    const wrongCount = Number(result?.wrongCount || 0)
    const duration = Number(result?.duration || 0)
    const totalQuestions = correctCount + wrongCount
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0

    return {
      score,
      correctCount,
      wrongCount,
      duration,
      accuracy,
      passed: score >= 70,
      hasResult: Boolean(result),
      categoryName:
        result?.categoryName ||
        categoryNames[result?.categoryId] ||
        'Henüz sınav yok',
    }
  }, [result])

  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return '0 dk'

    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const categoryScores = [
    {
      id: 'health',
      title: 'Health',
      score:
        result?.categoryId === 'health'
          ? statistics.score
          : 0,
    },
    {
      id: 'personal-care',
      title: 'Personal Care',
      score:
        result?.categoryId === 'personal-care'
          ? statistics.score
          : 0,
    },
    {
      id: 'hair-care',
      title: 'Hair Care',
      score:
        result?.categoryId === 'hair-care'
          ? statistics.score
          : 0,
    },
    {
      id: 'general-merchandise',
      title: 'General Merchandise',
      score:
        result?.categoryId === 'general-merchandise'
          ? statistics.score
          : 0,
    },
  ]

  return (
    <>
      <style>{styles}</style>

      <main className="statistics-page">
        <div className="statistics-shell">
          <header className="statistics-header">
            <button
              type="button"
              className="statistics-header-button"
              onClick={() => navigate('/kategoriler')}
              aria-label="Kategorilere dön"
            >
              <FiChevronLeft />
            </button>

            <div className="statistics-heading">
              <span>Müşteri Buddy</span>
              <h1>İstatistikler</h1>
            </div>

            <button
              type="button"
              className="statistics-header-button"
              onClick={() => navigate('/profil')}
              aria-label="Katılımcı profili"
            >
              <FiUser />
            </button>
          </header>

          <section className="statistics-summary">
            <div className="statistics-summary-content">
              <span>Performans özeti</span>
              <strong>{participantName}</strong>
              <p>
                Son sınav performansınızı ve kategori
                gelişiminizi takip edin.
              </p>
            </div>

            <div
              className="statistics-score"
              style={{ '--score': statistics.score }}
              aria-label={`Son sınav puanı ${statistics.score}`}
            >
              <div className="statistics-score-content">
                <strong>{statistics.score}</strong>
                <span>Son puan</span>
              </div>
            </div>
          </section>

          <section className="statistics-content">
            <div className="statistics-cards">
              <article className="statistics-card success">
                <span className="statistics-card-icon">
                  <FiCheckCircle />
                </span>
                <strong>{statistics.correctCount}</strong>
                <span>Doğru cevap</span>
              </article>

              <article className="statistics-card danger">
                <span className="statistics-card-icon">
                  <FiXCircle />
                </span>
                <strong>{statistics.wrongCount}</strong>
                <span>Yanlış cevap</span>
              </article>

              <article className="statistics-card blue">
                <span className="statistics-card-icon">
                  <FiTarget />
                </span>
                <strong>%{statistics.accuracy}</strong>
                <span>Başarı oranı</span>
              </article>

              <article className="statistics-card">
                <span className="statistics-card-icon">
                  <FiClock />
                </span>
                <strong>
                  {formatTime(statistics.duration)}
                </strong>
                <span>Tamamlama süresi</span>
              </article>
            </div>

            <div className="statistics-detail">
              <section className="statistics-panel">
                <div className="statistics-panel-header">
                  <h2>Kategori performansı</h2>
                  <FiBarChart2 />
                </div>

                <div className="statistics-bar-list">
                  {categoryScores.map((category) => (
                    <div
                      className="statistics-bar-row"
                      key={category.id}
                    >
                      <span>{category.title}</span>

                      <div className="statistics-bar-track">
                        <div
                          className="statistics-bar-fill"
                          style={{
                            width: `${category.score}%`,
                          }}
                        />
                      </div>

                      <strong>{category.score}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="statistics-panel">
                <div className="statistics-panel-header">
                  <h2>Son sınav</h2>
                  <FiPieChart />
                </div>

                <div className="statistics-latest">
                  <span className="statistics-latest-icon">
                    {statistics.hasResult ? (
                      statistics.passed ? (
                        <FiAward />
                      ) : (
                        <FiActivity />
                      )
                    ) : (
                      <FiBookOpen />
                    )}
                  </span>

                  <strong>
                    {statistics.categoryName}
                  </strong>

                  <span>
                    {statistics.hasResult
                      ? statistics.passed
                        ? 'Başarılı · Geçme notu 70'
                        : 'Gelişime devam · Geçme notu 70'
                      : 'İstatistik görmek için sınavı tamamlayın.'}
                  </span>
                </div>
              </section>
            </div>
          </section>

          <nav
            className="statistics-bottom-nav"
            aria-label="Alt navigasyon"
          >
            <button
              type="button"
              className="statistics-nav-item"
              onClick={() => navigate('/kategoriler')}
            >
              <FiHome />
              <span>Ana Sayfa</span>
            </button>

            <button
              type="button"
              className="statistics-nav-item"
              onClick={() => navigate('/basarilar')}
            >
              <FiAward />
              <span>Başarılar</span>
            </button>

            <button
              type="button"
              className="statistics-nav-item active"
              aria-current="page"
            >
              <FiBarChart2 />
              <span>İstatistikler</span>
            </button>

            <button
              type="button"
              className="statistics-nav-item"
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

export default StatisticsPage
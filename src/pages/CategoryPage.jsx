import { useNavigate } from 'react-router-dom'
import {
  FiActivity,
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiHome,
  FiLayers,
  FiMenu,
  FiPlay,
  FiScissors,
  FiShoppingBag,
  FiUser,
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
    --category-dark: #062540;
    --category-navy: #041d34;
    --category-text: #ffffff;
    --category-safe-bottom: env(safe-area-inset-bottom, 0px);
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

  body {
    overscroll-behavior-y: none;
  }

  button {
    font: inherit;
  }

  .category-page {
    position: relative;
    width: 100%;
    min-height: 100dvh;
    overflow-x: hidden;
    color: var(--category-text);
    background:
      radial-gradient(
        circle at 4% 2%,
        rgba(40, 255, 191, 0.95) 0,
        rgba(40, 255, 191, 0.26) 21%,
        transparent 38%
      ),
      radial-gradient(
        circle at 95% 8%,
        rgba(0, 211, 255, 0.95) 0,
        rgba(0, 211, 255, 0.28) 28%,
        transparent 48%
      ),
      radial-gradient(
        circle at 88% 58%,
        rgba(0, 115, 255, 0.72) 0,
        transparent 45%
      ),
      linear-gradient(
        150deg,
        #13dcae 0%,
        #06b8d8 34%,
        #0795ee 67%,
        #0877df 100%
      );
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "SF Pro Display",
      "SF Pro Text",
      "Segoe UI",
      sans-serif;
    isolation: isolate;
  }

  .category-page::before,
  .category-page::after {
    content: "";
    position: fixed;
    z-index: -1;
    pointer-events: none;
  }

  .category-page::before {
    width: 560px;
    height: 560px;
    top: -240px;
    right: -190px;
    border-radius: 42% 58% 63% 37% / 44% 42% 58% 56%;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.13),
        rgba(255, 255, 255, 0.025)
      );
    transform: rotate(18deg);
  }

  .category-page::after {
    width: 480px;
    height: 480px;
    left: -260px;
    bottom: 12%;
    border-radius: 48% 52% 42% 58%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 78, 181, 0.12);
    transform: rotate(-22deg);
  }

  .category-decoration {
    position: fixed;
    z-index: -1;
    pointer-events: none;
  }

  .category-decoration-one {
    width: 360px;
    height: 620px;
    right: -145px;
    top: 27%;
    border-radius: 58% 42% 48% 52%;
    background:
      linear-gradient(
        155deg,
        rgba(255, 255, 255, 0.09),
        rgba(255, 255, 255, 0.015)
      );
    transform: rotate(19deg);
  }

  .category-decoration-two {
    width: 390px;
    height: 390px;
    left: -215px;
    top: 52%;
    border-radius: 50%;
    border: 18px dotted rgba(255, 255, 255, 0.12);
  }

  .category-shell {
    width: min(100%, 940px);
    margin: 0 auto;
    padding:
      max(16px, env(safe-area-inset-top))
      18px
      calc(116px + var(--category-safe-bottom));
  }

  .category-header {
    display: grid;
    grid-template-columns: 58px minmax(0, 1fr) 58px;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
  }

  .category-header-button {
    width: 58px;
    height: 58px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 19px;
    color: #079d87;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.98),
        rgba(245, 255, 252, 0.92)
      );
    box-shadow:
      0 18px 34px rgba(3, 62, 111, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    font-size: 25px;
    cursor: pointer;
    transition:
      transform 170ms ease,
      box-shadow 170ms ease;
  }

  .category-header-button:hover {
    transform: translateY(-2px);
    box-shadow:
      0 22px 40px rgba(3, 62, 111, 0.27),
      inset 0 1px 0 rgba(255, 255, 255, 1);
  }

  .category-header-button:active {
    transform: scale(0.94);
  }

  .category-heading {
    min-width: 0;
  }

  .category-heading h1 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(30px, 7vw, 44px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.055em;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow:
      0 7px 22px rgba(4, 55, 101, 0.24),
      0 2px 2px rgba(0, 63, 105, 0.1);
  }

  .category-profile-button {
    border-radius: 50%;
  }

  .category-summary {
    position: relative;
    min-height: 148px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
    padding: 24px 26px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 32px;
    background:
      radial-gradient(
        circle at 92% 5%,
        rgba(44, 222, 204, 0.25),
        transparent 38%
      ),
      linear-gradient(
        135deg,
        #072c4c 0%,
        #041d34 51%,
        #08324f 100%
      );
    box-shadow:
      0 25px 55px rgba(3, 45, 83, 0.34),
      inset 0 1px 0 rgba(255, 255, 255, 0.13);
  }

  .category-summary::before {
    content: "";
    position: absolute;
    width: 220px;
    height: 220px;
    right: -85px;
    top: -100px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
  }

  .category-summary::after {
    content: "";
    position: absolute;
    width: 160px;
    height: 160px;
    right: 80px;
    bottom: -120px;
    border-radius: 50%;
    background: rgba(34, 229, 193, 0.08);
  }

  .category-summary-content {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .category-summary-content > span {
    display: block;
    margin-bottom: 10px;
    color: #31e5c6;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .category-summary-content strong {
    display: block;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(24px, 5vw, 36px);
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -0.045em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-summary-content p {
    margin: 8px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.65);
    font-size: 13px;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-summary-stats {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(92px, 1fr));
    gap: 12px;
  }

  .category-summary-stat {
    min-height: 100px;
    display: grid;
    place-items: center;
    align-content: center;
    padding: 12px 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 23px;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.12),
        rgba(255, 255, 255, 0.055)
      );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.09),
      0 12px 25px rgba(0, 12, 31, 0.13);
    text-align: center;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .category-summary-stat strong {
    color: #ffffff;
    font-size: 35px;
    font-weight: 900;
    line-height: 1;
  }

  .category-summary-stat span {
    margin-top: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .category-card {
    --accent-one: #18e49b;
    --accent-two: #00bea7;
    --accent-three: #00a68e;
    --accent-rgb: 24, 228, 155;

    position: relative;
    min-width: 0;
    min-height: 285px;
    padding: 26px;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.73);
    border-radius: 31px;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 82% 12%,
        rgba(255, 255, 255, 0.24),
        transparent 32%
      ),
      radial-gradient(
        circle at 18% 100%,
        rgba(255, 255, 255, 0.09),
        transparent 42%
      ),
      linear-gradient(
        145deg,
        var(--accent-one) 0%,
        var(--accent-two) 55%,
        var(--accent-three) 100%
      );
    box-shadow:
      0 24px 44px rgba(3, 49, 93, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.44);
    isolation: isolate;
    cursor: pointer;
    transition:
      transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
      box-shadow 180ms ease;
  }

  .category-card::before {
    content: "";
    position: absolute;
    z-index: -1;
    width: 78%;
    aspect-ratio: 1;
    right: -22%;
    top: -52%;
    border-radius: 45% 55% 62% 38%;
    background: rgba(255, 255, 255, 0.12);
    transform: rotate(29deg);
  }

  .category-card::after {
    content: "";
    position: absolute;
    z-index: -1;
    width: 72%;
    aspect-ratio: 1;
    left: 13%;
    bottom: -68%;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 46% 54% 43% 57%;
    background: rgba(255, 255, 255, 0.025);
    transform: rotate(-18deg);
  }

  .category-card.green {
    --accent-one: #24e895;
    --accent-two: #09cfa0;
    --accent-three: #00b4aa;
    --accent-rgb: 19, 214, 157;
  }

  .category-card.blue {
    --accent-one: #27aaff;
    --accent-two: #078cf4;
    --accent-three: #0870e9;
    --accent-rgb: 26, 147, 248;
  }

  .category-card.purple {
    --accent-one: #bb50f8;
    --accent-two: #8d3bf3;
    --accent-three: #6938e8;
    --accent-rgb: 147, 64, 242;
  }

  .category-card.orange {
    --accent-one: #ffc228;
    --accent-two: #ff9b12;
    --accent-three: #f47b0f;
    --accent-rgb: 255, 159, 20;
  }

  .category-card:hover {
    transform: translateY(-4px);
    box-shadow:
      0 30px 54px rgba(3, 49, 93, 0.31),
      inset 0 1px 0 rgba(255, 255, 255, 0.48);
  }

  .category-card:active {
    transform: scale(0.985);
  }

  .category-card-top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .category-icon-box {
    width: 76px;
    height: 76px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    color: var(--accent-three);
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 1),
        rgba(248, 253, 255, 0.94)
      );
    box-shadow:
      0 18px 32px rgba(1, 42, 78, 0.22),
      inset 0 1px 0 #ffffff;
    font-size: 34px;
  }

  .category-ready-badge {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 999px;
    color: #ffffff;
    background:
      linear-gradient(
        145deg,
        rgba(0, 67, 105, 0.21),
        rgba(0, 45, 84, 0.12)
      );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    font-size: 12px;
    font-weight: 850;
    white-space: nowrap;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .category-ready-badge svg {
    width: 21px;
    height: 21px;
    flex: 0 0 auto;
  }

  .category-card-main {
    position: relative;
    z-index: 1;
    margin-top: 20px;
  }

  .category-card-main h2 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(27px, 4.3vw, 37px);
    font-weight: 900;
    line-height: 1.03;
    letter-spacing: -0.05em;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 7px 19px rgba(0, 34, 71, 0.16);
  }

  .category-card-main p {
    margin: 8px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.88);
    font-size: 15px;
    font-weight: 600;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-card-bottom {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin-top: 25px;
  }

  .category-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 17px;
    padding-bottom: 8px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 13px;
    font-weight: 800;
  }

  .category-meta span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }

  .category-meta svg {
    width: 20px;
    height: 20px;
  }

  .category-start-button {
    min-width: 142px;
    min-height: 63px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex: 0 0 auto;
    padding: 0 20px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 22px;
    color: var(--accent-three);
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 1),
        rgba(249, 252, 255, 0.95)
      );
    box-shadow:
      0 18px 33px rgba(1, 43, 78, 0.21),
      inset 0 1px 0 #ffffff;
    font-size: 17px;
    font-weight: 900;
    pointer-events: none;
  }

  .category-start-button svg {
    width: 22px;
    height: 22px;
    flex: 0 0 auto;
  }

  .category-bottom-nav {
    position: fixed;
    z-index: 20;
    left: 50%;
    bottom: max(12px, var(--category-safe-bottom));
    width: min(calc(100% - 30px), 900px);
    min-height: 82px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    padding: 8px 14px;
    border: 1px solid rgba(255, 255, 255, 0.17);
    border-radius: 31px;
    background:
      linear-gradient(
        145deg,
        rgba(4, 38, 67, 0.98),
        rgba(3, 28, 52, 0.97)
      );
    box-shadow:
      0 24px 52px rgba(0, 36, 76, 0.42),
      inset 0 1px 0 rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(24px) saturate(145%);
    -webkit-backdrop-filter: blur(24px) saturate(145%);
    transform: translateX(-50%);
  }

  .category-nav-item {
    min-width: 0;
    min-height: 64px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 5px;
    padding: 4px;
    border: 0;
    border-radius: 19px;
    color: rgba(192, 214, 234, 0.62);
    background: transparent;
    cursor: pointer;
    transition:
      color 170ms ease,
      background-color 170ms ease,
      transform 170ms ease;
  }

  .category-nav-item svg {
    width: 25px;
    height: 25px;
  }

  .category-nav-item span {
    overflow: hidden;
    max-width: 100%;
    font-size: 11px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-nav-item.active {
    color: #24e4bc;
  }

  .category-nav-item:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
  }

  .category-nav-item:active {
    transform: scale(0.94);
  }

  @media (max-width: 760px) {
    .category-shell {
      padding:
        max(13px, env(safe-area-inset-top))
        14px
        calc(110px + var(--category-safe-bottom));
    }

    .category-header {
      grid-template-columns: 50px minmax(0, 1fr) 50px;
      gap: 12px;
      margin-bottom: 14px;
    }

    .category-header-button {
      width: 50px;
      height: 50px;
      border-radius: 17px;
      font-size: 22px;
    }

    .category-heading h1 {
      font-size: clamp(26px, 7.6vw, 36px);
    }

    .category-summary {
      min-height: 128px;
      margin-bottom: 16px;
      padding: 20px;
      border-radius: 27px;
    }

    .category-summary-content > span {
      margin-bottom: 7px;
      font-size: 10px;
    }

    .category-summary-content strong {
      font-size: clamp(21px, 5.8vw, 29px);
    }

    .category-summary-content p {
      font-size: 11px;
    }

    .category-summary-stats {
      grid-template-columns: repeat(2, minmax(72px, 1fr));
      gap: 8px;
    }

    .category-summary-stat {
      min-height: 84px;
      padding: 9px 10px;
      border-radius: 19px;
    }

    .category-summary-stat strong {
      font-size: 28px;
    }

    .category-summary-stat span {
      margin-top: 7px;
      font-size: 9px;
    }

    .category-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .category-card {
      min-height: 260px;
      padding: 24px;
      border-radius: 29px;
    }

    .category-card-main h2 {
      font-size: clamp(27px, 7vw, 35px);
    }

    .category-card-main p {
      font-size: 14px;
    }

    .category-bottom-nav {
      width: calc(100% - 26px);
      min-height: 78px;
      padding: 7px 10px;
      border-radius: 28px;
    }
  }

  @media (max-width: 480px) {
    .category-shell {
      padding-left: 12px;
      padding-right: 12px;
      padding-bottom: calc(104px + var(--category-safe-bottom));
    }

    .category-header {
      grid-template-columns: 46px minmax(0, 1fr) 46px;
      gap: 10px;
    }

    .category-header-button {
      width: 46px;
      height: 46px;
      border-radius: 15px;
      font-size: 20px;
    }

    .category-heading h1 {
      font-size: clamp(24px, 7.5vw, 31px);
    }

    .category-summary {
      min-height: 117px;
      padding: 16px;
      border-radius: 24px;
    }

    .category-summary-content {
      max-width: calc(100vw - 190px);
    }

    .category-summary-content > span {
      font-size: 8px;
      letter-spacing: 0.13em;
    }

    .category-summary-content strong {
      font-size: clamp(19px, 5.6vw, 25px);
    }

    .category-summary-content p {
      display: none;
    }

    .category-summary-stats {
      grid-template-columns: repeat(2, minmax(61px, 1fr));
      gap: 6px;
    }

    .category-summary-stat {
      min-height: 75px;
      padding: 7px;
      border-radius: 17px;
    }

    .category-summary-stat strong {
      font-size: 24px;
    }

    .category-summary-stat span {
      font-size: 7px;
    }

    .category-grid {
      gap: 13px;
    }

    .category-card {
      min-height: 230px;
      padding: 20px;
      border-radius: 27px;
    }

    .category-icon-box {
      width: 63px;
      height: 63px;
      font-size: 28px;
    }

    .category-ready-badge {
      min-height: 35px;
      gap: 6px;
      padding: 0 12px;
      font-size: 10px;
    }

    .category-ready-badge svg {
      width: 17px;
      height: 17px;
    }

    .category-card-main {
      margin-top: 16px;
    }

    .category-card-main h2 {
      font-size: clamp(24px, 7vw, 31px);
    }

    .category-card-main p {
      margin-top: 5px;
      font-size: 12px;
    }

    .category-card-bottom {
      margin-top: 20px;
    }

    .category-meta {
      gap: 7px 12px;
      padding-bottom: 5px;
      font-size: 11px;
    }

    .category-meta svg {
      width: 17px;
      height: 17px;
    }

    .category-start-button {
      min-width: 118px;
      min-height: 54px;
      gap: 9px;
      padding: 0 14px;
      border-radius: 19px;
      font-size: 14px;
    }

    .category-start-button svg {
      width: 18px;
      height: 18px;
    }

    .category-bottom-nav {
      bottom: max(8px, var(--category-safe-bottom));
      width: calc(100% - 20px);
      min-height: 72px;
      padding: 6px 7px;
      border-radius: 25px;
    }

    .category-nav-item {
      min-height: 58px;
      gap: 4px;
      border-radius: 17px;
    }

    .category-nav-item svg {
      width: 22px;
      height: 22px;
    }

    .category-nav-item span {
      font-size: 9px;
    }
  }

  @media (max-width: 360px) {
    .category-summary {
      padding: 13px;
    }

    .category-summary-content {
      max-width: calc(100vw - 170px);
    }

    .category-summary-content strong {
      font-size: 18px;
    }

    .category-summary-stat {
      min-height: 67px;
    }

    .category-summary-stat strong {
      font-size: 21px;
    }

    .category-card {
      min-height: 215px;
      padding: 17px;
    }

    .category-icon-box {
      width: 55px;
      height: 55px;
      font-size: 24px;
    }

    .category-ready-badge {
      min-height: 31px;
      padding: 0 9px;
      font-size: 9px;
    }

    .category-card-main h2 {
      font-size: 23px;
    }

    .category-card-bottom {
      gap: 7px;
    }

    .category-meta {
      gap: 5px 8px;
      font-size: 10px;
    }

    .category-start-button {
      min-width: 103px;
      min-height: 49px;
      gap: 6px;
      padding: 0 10px;
      border-radius: 17px;
      font-size: 13px;
    }
  }

  @media (hover: none) {
    .category-card:hover,
    .category-header-button:hover {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .category-card,
    .category-header-button,
    .category-nav-item {
      transition-duration: 0.01ms !important;
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
    participant?.fullName?.trim() || 'Demo Katılımcısı'

  const firstName =
    participantName === 'Demo Katılımcısı'
      ? participantName
      : participantName.split(' ')[0]

  const totalQuestions = categories.reduce(
    (total, category) =>
      total + (isDemo ? 5 : category.questionCount),
    0,
  )

  const handleCategorySelect = (categoryId) => {
    navigate(`/quiz/${categoryId}`)
  }

  const handleCardKeyDown = (event, categoryId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCategorySelect(categoryId)
    }
  }

  return (
    <>
      <style>{styles}</style>

      <main className="category-page">
        <div
          className="category-decoration category-decoration-one"
          aria-hidden="true"
        />
        <div
          className="category-decoration category-decoration-two"
          aria-hidden="true"
        />

        <div className="category-shell">
          <header className="category-header">
            <button
              type="button"
              className="category-header-button"
              onClick={() => navigate('/')}
              aria-label="Ana menüye dön"
            >
              <FiMenu />
            </button>

            <div className="category-heading">
              <h1>Kategori Sınavları</h1>
            </div>

            <button
              type="button"
              className="category-header-button category-profile-button"
              onClick={() => navigate('/')}
              aria-label="Katılımcı profili"
            >
              <FiUser />
            </button>
          </header>

          <section className="category-summary">
            <div className="category-summary-content">
              <span>Başlamaya hazırsınız</span>

              <strong>
                Merhaba {firstName} 👋
              </strong>

              <p>
                Bir kategori seçerek sınava başlayabilirsiniz.
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
                  onKeyDown={(event) =>
                    handleCardKeyDown(event, category.id)
                  }
                  aria-label={`${category.title} sınavını başlat`}
                >
                  <div className="category-card-top">
                    <span
                      className="category-icon-box"
                      aria-hidden="true"
                    >
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

        <nav
          className="category-bottom-nav"
          aria-label="Alt navigasyon"
        >
          <button
            type="button"
            className="category-nav-item active"
            onClick={() => navigate('/kategoriler')}
          >
            <FiHome />
            <span>Ana Sayfa</span>
          </button>

          <button
            type="button"
            className="category-nav-item"
            onClick={() => navigate('/kategoriler')}
          >
            <FiAward />
            <span>Başarılar</span>
          </button>

          <button
            type="button"
            className="category-nav-item"
            onClick={() => navigate('/kategoriler')}
          >
            <FiBarChart2 />
            <span>İstatistikler</span>
          </button>

          <button
            type="button"
            className="category-nav-item"
            onClick={() => navigate('/')}
          >
            <FiUser />
            <span>Profil</span>
          </button>
        </nav>
      </main>
    </>
  )
}

export default CategoryPage
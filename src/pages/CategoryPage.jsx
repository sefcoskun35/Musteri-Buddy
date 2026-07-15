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
    --category-navy: #031d35;
    --category-navy-light: #0a3554;
    --category-white: #ffffff;
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
    isolation: isolate;
    width: 100%;
    min-height: 100dvh;
    overflow-x: hidden;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 3% 0%,
        rgba(37, 255, 188, 0.98) 0,
        rgba(22, 232, 185, 0.54) 18%,
        transparent 38%
      ),
      radial-gradient(
        circle at 98% 8%,
        rgba(0, 211, 255, 0.95) 0,
        rgba(0, 190, 248, 0.48) 27%,
        transparent 48%
      ),
      radial-gradient(
        circle at 70% 65%,
        rgba(0, 119, 255, 0.72) 0,
        transparent 50%
      ),
      linear-gradient(
        155deg,
        #14d9ad 0%,
        #05bcd5 34%,
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

  .category-page::before,
  .category-page::after {
    content: "";
    position: fixed;
    z-index: -3;
    pointer-events: none;
  }

  .category-page::before {
    width: 620px;
    height: 620px;
    top: -300px;
    right: -250px;
    border-radius: 44% 56% 62% 38% / 46% 44% 56% 54%;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.15),
        rgba(255, 255, 255, 0.02)
      );
    transform: rotate(18deg);
  }

  .category-page::after {
    width: 460px;
    height: 460px;
    left: -310px;
    top: 34%;
    border-radius: 50%;
    border: 16px dotted rgba(255, 255, 255, 0.13);
  }

  .category-background-shape {
    position: fixed;
    z-index: -2;
    pointer-events: none;
  }

  .category-background-shape-one {
    width: 460px;
    height: 760px;
    right: -245px;
    top: 24%;
    border-radius: 58% 42% 46% 54%;
    background:
      linear-gradient(
        155deg,
        rgba(255, 255, 255, 0.09),
        rgba(255, 255, 255, 0.012)
      );
    transform: rotate(21deg);
  }

  .category-background-shape-two {
    width: 430px;
    height: 430px;
    left: -250px;
    bottom: 10%;
    border-radius: 48% 52% 43% 57%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 68, 177, 0.1);
    transform: rotate(-18deg);
  }

  .category-shell {
    width: min(100%, 900px);
    margin: 0 auto;
    padding:
      max(18px, env(safe-area-inset-top))
      18px
      calc(115px + var(--category-safe-bottom));
  }

  .category-header {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) 64px;
    align-items: center;
    gap: 16px;
    margin-bottom: 22px;
  }

  .category-header-button {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 21px;
    color: #08a58c;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 1),
        rgba(245, 255, 252, 0.95)
      );
    box-shadow:
      0 18px 36px rgba(2, 53, 101, 0.23),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    font-size: 28px;
    cursor: pointer;
    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .category-header-button:hover {
    transform: translateY(-2px);
    box-shadow:
      0 22px 42px rgba(2, 53, 101, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 1);
  }

  .category-header-button:active {
    transform: scale(0.94);
  }

  .category-profile-button {
    border-radius: 50%;
  }

  .category-heading {
    min-width: 0;
  }

  .category-heading h1 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(32px, 6vw, 48px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.055em;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow:
      0 8px 24px rgba(3, 49, 91, 0.23),
      0 2px 2px rgba(0, 59, 99, 0.08);
  }

  .category-summary {
    position: relative;
    min-height: 158px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 18px;
    margin-bottom: 24px;
    padding: 25px 27px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 34px;
    background:
      radial-gradient(
        circle at 93% 5%,
        rgba(42, 223, 202, 0.24),
        transparent 39%
      ),
      linear-gradient(
        135deg,
        #082c49 0%,
        #031d35 53%,
        #08324f 100%
      );
    box-shadow:
      0 25px 55px rgba(1, 37, 74, 0.36),
      inset 0 1px 0 rgba(255, 255, 255, 0.13);
  }

  .category-summary::before {
    content: "";
    position: absolute;
    width: 220px;
    height: 220px;
    right: -90px;
    top: -110px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
  }

  .category-summary::after {
    content: "";
    position: absolute;
    width: 180px;
    height: 180px;
    right: 90px;
    bottom: -140px;
    border-radius: 50%;
    background: rgba(34, 229, 193, 0.07);
  }

  .category-summary-content {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .category-summary-content > span {
    display: block;
    margin-bottom: 11px;
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
    font-size: clamp(25px, 5vw, 38px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.048em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-summary-content p {
    margin: 8px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.63);
    font-size: 13px;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-summary-stats {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(98px, 1fr));
    gap: 12px;
  }

  .category-summary-stat {
    min-height: 104px;
    display: grid;
    place-items: center;
    align-content: center;
    padding: 12px 15px;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 24px;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.12),
        rgba(255, 255, 255, 0.055)
      );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.09),
      0 12px 25px rgba(0, 12, 31, 0.14);
    text-align: center;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .category-summary-stat strong {
    color: #ffffff;
    font-size: 37px;
    font-weight: 900;
    line-height: 1;
  }

  .category-summary-stat span {
    margin-top: 10px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 11px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .category-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .category-card {
    --card-start: #22e694;
    --card-middle: #09d1a0;
    --card-end: #00b7a7;
    --card-ink: #00a37e;

    position: relative;
    min-width: 0;
    min-height: 330px;
    padding: 28px 30px;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.76);
    border-radius: 34px;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 84% 13%,
        rgba(255, 255, 255, 0.22),
        transparent 33%
      ),
      radial-gradient(
        circle at 18% 100%,
        rgba(255, 255, 255, 0.1),
        transparent 43%
      ),
      linear-gradient(
        145deg,
        var(--card-start) 0%,
        var(--card-middle) 53%,
        var(--card-end) 100%
      );
    box-shadow:
      0 24px 48px rgba(2, 48, 91, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.46);
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
    width: 74%;
    aspect-ratio: 1;
    right: -19%;
    top: -48%;
    border-radius: 46% 54% 61% 39%;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.17),
        rgba(255, 255, 255, 0.035)
      );
    transform: rotate(31deg);
  }

  .category-card::after {
    content: "";
    position: absolute;
    z-index: -1;
    width: 76%;
    aspect-ratio: 1;
    left: 20%;
    bottom: -71%;
    border: 1px solid rgba(255, 255, 255, 0.17);
    border-radius: 46% 54% 43% 57%;
    background: rgba(255, 255, 255, 0.025);
    transform: rotate(-19deg);
  }

  .category-card.green {
    --card-start: #25e895;
    --card-middle: #08d19f;
    --card-end: #00b6a8;
    --card-ink: #00a27e;
  }

  .category-card.blue {
    --card-start: #28aaff;
    --card-middle: #078df6;
    --card-end: #0870e9;
    --card-ink: #0878e8;
  }

  .category-card.purple {
    --card-start: #bd51fa;
    --card-middle: #913df4;
    --card-end: #6a38e8;
    --card-ink: #7934e6;
  }

  .category-card.orange {
    --card-start: #ffc629;
    --card-middle: #ff9e13;
    --card-end: #f47b0e;
    --card-ink: #f07c00;
  }

  .category-card:hover {
    transform: translateY(-4px);
    box-shadow:
      0 31px 58px rgba(2, 48, 91, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }

  .category-card:active {
    transform: scale(0.985);
  }

  .category-card-top {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
  }

  .category-icon-box {
    width: 82px;
    height: 82px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    color: var(--card-ink);
    background:
      linear-gradient(
        145deg,
        #ffffff,
        rgba(249, 253, 255, 0.96)
      );
    box-shadow:
      0 18px 34px rgba(1, 40, 77, 0.22),
      inset 0 1px 0 #ffffff;
    font-size: 37px;
  }

  .category-ready-badge {
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 0 18px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 999px;
    color: #ffffff;
    background:
      linear-gradient(
        145deg,
        rgba(0, 61, 101, 0.21),
        rgba(0, 35, 74, 0.11)
      );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.13),
      0 8px 18px rgba(2, 53, 96, 0.08);
    font-size: 13px;
    font-weight: 850;
    white-space: nowrap;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .category-ready-badge svg {
    width: 23px;
    height: 23px;
    flex: 0 0 auto;
  }

  .category-card-main {
    position: relative;
    z-index: 2;
    margin-top: 24px;
  }

  .category-card-main h2 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(32px, 5vw, 42px);
    font-weight: 900;
    line-height: 1.02;
    letter-spacing: -0.052em;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 7px 20px rgba(0, 31, 70, 0.17);
  }

  .category-card-main p {
    margin: 9px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.91);
    font-size: 16px;
    font-weight: 620;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-card-bottom {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 15px;
    margin-top: 29px;
  }

  .category-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 11px 20px;
    padding-bottom: 9px;
    color: rgba(255, 255, 255, 0.97);
    font-size: 14px;
    font-weight: 800;
  }

  .category-meta span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }

  .category-meta svg {
    width: 22px;
    height: 22px;
    flex: 0 0 auto;
  }

  .category-start-button {
    min-width: 154px;
    min-height: 67px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 13px;
    flex: 0 0 auto;
    padding: 0 21px;
    border: 1px solid rgba(255, 255, 255, 0.96);
    border-radius: 23px;
    color: var(--card-ink);
    background:
      linear-gradient(
        145deg,
        #ffffff,
        rgba(248, 252, 255, 0.96)
      );
    box-shadow:
      0 18px 34px rgba(1, 40, 77, 0.22),
      inset 0 1px 0 #ffffff;
    font-size: 18px;
    font-weight: 900;
    pointer-events: none;
  }

  .category-start-button svg {
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
  }

  .category-bottom-nav {
    position: fixed;
    z-index: 30;
    left: 50%;
    bottom: max(12px, var(--category-safe-bottom));
    width: min(calc(100% - 30px), 870px);
    min-height: 86px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    padding: 8px 15px;
    border: 1px solid rgba(255, 255, 255, 0.17);
    border-radius: 33px;
    background:
      linear-gradient(
        145deg,
        rgba(4, 37, 66, 0.98),
        rgba(3, 27, 51, 0.98)
      );
    box-shadow:
      0 25px 54px rgba(0, 34, 73, 0.43),
      inset 0 1px 0 rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(25px) saturate(145%);
    -webkit-backdrop-filter: blur(25px) saturate(145%);
    transform: translateX(-50%);
  }

  .category-nav-item {
    min-width: 0;
    min-height: 66px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 6px;
    padding: 4px;
    border: 0;
    border-radius: 20px;
    color: rgba(193, 214, 234, 0.61);
    background: transparent;
    cursor: pointer;
    transition:
      color 170ms ease,
      background-color 170ms ease,
      transform 170ms ease;
  }

  .category-nav-item svg {
    width: 27px;
    height: 27px;
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

  @media (min-width: 760px) {
    .category-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .category-card {
      min-height: 320px;
    }
  }

  @media (max-width: 600px) {
    .category-shell {
      padding:
        max(14px, env(safe-area-inset-top))
        13px
        calc(105px + var(--category-safe-bottom));
    }

    .category-header {
      grid-template-columns: 50px minmax(0, 1fr) 50px;
      gap: 12px;
      margin-bottom: 17px;
    }

    .category-header-button {
      width: 50px;
      height: 50px;
      border-radius: 17px;
      font-size: 22px;
    }

    .category-profile-button {
      border-radius: 50%;
    }

    .category-heading h1 {
      font-size: clamp(28px, 8vw, 36px);
    }

    .category-summary {
      min-height: 125px;
      gap: 9px;
      margin-bottom: 17px;
      padding: 18px 17px;
      border-radius: 27px;
    }

    .category-summary-content {
      max-width: calc(100vw - 190px);
    }

    .category-summary-content > span {
      margin-bottom: 7px;
      font-size: 9px;
      letter-spacing: 0.14em;
    }

    .category-summary-content strong {
      font-size: clamp(20px, 6.2vw, 28px);
    }

    .category-summary-content p {
      display: none;
    }

    .category-summary-stats {
      grid-template-columns: repeat(2, minmax(62px, 1fr));
      gap: 6px;
    }

    .category-summary-stat {
      min-height: 79px;
      padding: 8px;
      border-radius: 18px;
    }

    .category-summary-stat strong {
      font-size: 26px;
    }

    .category-summary-stat span {
      margin-top: 7px;
      font-size: 7px;
    }

    .category-grid {
      gap: 14px;
    }

    .category-card {
      min-height: 250px;
      padding: 21px 20px;
      border-radius: 28px;
    }

    .category-card::before {
      width: 79%;
      right: -24%;
      top: -52%;
    }

    .category-icon-box {
      width: 66px;
      height: 66px;
      font-size: 29px;
    }

    .category-ready-badge {
      min-height: 36px;
      gap: 6px;
      padding: 0 12px;
      font-size: 10px;
    }

    .category-ready-badge svg {
      width: 18px;
      height: 18px;
    }

    .category-card-main {
      margin-top: 18px;
    }

    .category-card-main h2 {
      font-size: clamp(25px, 7.5vw, 32px);
    }

    .category-card-main p {
      margin-top: 6px;
      font-size: 13px;
    }

    .category-card-bottom {
      gap: 9px;
      margin-top: 21px;
    }

    .category-meta {
      gap: 7px 12px;
      padding-bottom: 6px;
      font-size: 11px;
    }

    .category-meta svg {
      width: 17px;
      height: 17px;
    }

    .category-start-button {
      min-width: 122px;
      min-height: 55px;
      gap: 8px;
      padding: 0 14px;
      border-radius: 19px;
      font-size: 15px;
    }

    .category-start-button svg {
      width: 19px;
      height: 19px;
    }

    .category-bottom-nav {
      bottom: max(8px, var(--category-safe-bottom));
      width: calc(100% - 20px);
      min-height: 74px;
      padding: 6px 7px;
      border-radius: 26px;
    }

    .category-nav-item {
      min-height: 59px;
      gap: 4px;
      border-radius: 17px;
    }

    .category-nav-item svg {
      width: 23px;
      height: 23px;
    }

    .category-nav-item span {
      font-size: 9px;
    }
  }

  @media (max-width: 380px) {
    .category-shell {
      padding-left: 10px;
      padding-right: 10px;
    }

    .category-header {
      grid-template-columns: 44px minmax(0, 1fr) 44px;
      gap: 9px;
    }

    .category-header-button {
      width: 44px;
      height: 44px;
      border-radius: 15px;
      font-size: 20px;
    }

    .category-heading h1 {
      font-size: 25px;
    }

    .category-summary {
      padding: 14px;
    }

    .category-summary-content {
      max-width: calc(100vw - 174px);
    }

    .category-summary-content strong {
      font-size: 19px;
    }

    .category-summary-stat {
      min-height: 70px;
    }

    .category-summary-stat strong {
      font-size: 22px;
    }

    .category-card {
      min-height: 230px;
      padding: 18px 16px;
      border-radius: 25px;
    }

    .category-icon-box {
      width: 58px;
      height: 58px;
      font-size: 25px;
    }

    .category-ready-badge {
      min-height: 32px;
      padding: 0 9px;
      font-size: 9px;
    }

    .category-card-main h2 {
      font-size: 24px;
    }

    .category-card-main p {
      font-size: 11px;
    }

    .category-meta {
      gap: 5px 8px;
      font-size: 10px;
    }

    .category-start-button {
      min-width: 107px;
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
          className="category-background-shape category-background-shape-one"
          aria-hidden="true"
        />

        <div
          className="category-background-shape category-background-shape-two"
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
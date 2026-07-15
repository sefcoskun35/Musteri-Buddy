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
    --category-safe-top: env(safe-area-inset-top, 0px);
    --category-safe-right: env(safe-area-inset-right, 0px);
    --category-safe-bottom: env(safe-area-inset-bottom, 0px);
    --category-safe-left: env(safe-area-inset-left, 0px);
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

  .category-page {
    position: fixed;
    inset: 0;
    isolation: isolate;
    width: 100%;
    height: 100dvh;
    min-height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
    overscroll-behavior: none;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(38, 255, 191, 0.95) 0%,
        rgba(38, 255, 191, 0.28) 24%,
        transparent 43%
      ),
      radial-gradient(
        circle at 100% 4%,
        rgba(0, 214, 255, 0.94) 0%,
        rgba(0, 190, 248, 0.32) 29%,
        transparent 49%
      ),
      radial-gradient(
        circle at 78% 82%,
        rgba(0, 111, 255, 0.75) 0%,
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
  }

  .category-page::before,
  .category-page::after {
    content: "";
    position: absolute;
    z-index: -3;
    pointer-events: none;
  }

  .category-page::before {
    width: min(72vw, 620px);
    height: min(72vw, 620px);
    top: -31%;
    right: -23%;
    border-radius: 44% 56% 62% 38% / 46% 44% 56% 54%;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.14),
        rgba(255, 255, 255, 0.02)
      );
    transform: rotate(18deg);
  }

  .category-page::after {
    width: min(52vw, 430px);
    height: min(52vw, 430px);
    left: -27%;
    bottom: 5%;
    border: 12px dotted rgba(255, 255, 255, 0.11);
    border-radius: 50%;
  }

  .category-background-shape {
    position: absolute;
    z-index: -2;
    pointer-events: none;
  }

  .category-background-shape-one {
    width: min(48vw, 420px);
    height: min(82vh, 690px);
    right: -23%;
    top: 22%;
    border-radius: 58% 42% 46% 54%;
    background:
      linear-gradient(
        155deg,
        rgba(255, 255, 255, 0.085),
        rgba(255, 255, 255, 0.01)
      );
    transform: rotate(21deg);
  }

  .category-background-shape-two {
    width: min(42vw, 360px);
    height: min(42vw, 360px);
    left: -23%;
    bottom: -10%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 48% 52% 43% 57%;
    background: rgba(0, 68, 177, 0.1);
    transform: rotate(-18deg);
  }

  .category-shell {
    width: min(100%, 920px);
    height: 100%;
    margin: 0 auto;
    padding:
      max(10px, var(--category-safe-top))
      max(12px, var(--category-safe-right))
      max(10px, var(--category-safe-bottom))
      max(12px, var(--category-safe-left));
    display: grid;
    grid-template-rows:
      auto
      auto
      minmax(0, 1fr)
      auto;
    gap: clamp(8px, 1.3vh, 14px);
  }

  .category-header {
    min-width: 0;
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) 48px;
    align-items: center;
    gap: 12px;
  }

  .category-header-button {
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
    transition:
      transform 160ms ease,
      box-shadow 160ms ease;
  }

  .category-profile-button {
    border-radius: 50%;
  }

  .category-header-button:active {
    transform: scale(0.93);
  }

  .category-heading {
    min-width: 0;
  }

  .category-heading h1 {
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

  .category-summary {
    position: relative;
    min-width: 0;
    min-height: 104px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 25px;
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
      0 18px 38px rgba(1, 37, 74, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.13);
  }

  .category-summary::before {
    content: "";
    position: absolute;
    width: 160px;
    height: 160px;
    right: -70px;
    top: -82px;
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
    margin-bottom: 5px;
    color: #31e5c6;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .category-summary-content strong {
    display: block;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(19px, 4.6vw, 29px);
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -0.045em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-summary-content p {
    margin: 5px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.62);
    font-size: 10px;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-summary-stats {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(65px, 1fr));
    gap: 7px;
  }

  .category-summary-stat {
    min-height: 72px;
    display: grid;
    place-items: center;
    align-content: center;
    padding: 7px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 17px;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.12),
        rgba(255, 255, 255, 0.055)
      );
    text-align: center;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .category-summary-stat strong {
    color: #ffffff;
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
  }

  .category-summary-stat span {
    margin-top: 6px;
    color: rgba(255, 255, 255, 0.68);
    font-size: 7px;
    font-weight: 850;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .category-grid {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: clamp(8px, 1.25vh, 13px);
  }

  .category-card {
    --card-start: #22e694;
    --card-middle: #09d1a0;
    --card-end: #00b7a7;
    --card-ink: #00a37e;

    position: relative;
    min-width: 0;
    min-height: 0;
    height: 100%;
    padding: clamp(12px, 1.8vw, 18px);
    overflow: hidden;
    border: 1.5px solid rgba(255, 255, 255, 0.74);
    border-radius: clamp(20px, 2.8vw, 28px);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    color: #ffffff;
    background:
      radial-gradient(
        circle at 84% 13%,
        rgba(255, 255, 255, 0.21),
        transparent 33%
      ),
      radial-gradient(
        circle at 18% 100%,
        rgba(255, 255, 255, 0.09),
        transparent 43%
      ),
      linear-gradient(
        145deg,
        var(--card-start) 0%,
        var(--card-middle) 53%,
        var(--card-end) 100%
      );
    box-shadow:
      0 15px 29px rgba(2, 48, 91, 0.21),
      inset 0 1px 0 rgba(255, 255, 255, 0.42);
    isolation: isolate;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform 170ms ease,
      box-shadow 170ms ease;
  }

  .category-card::before {
    content: "";
    position: absolute;
    z-index: -1;
    width: 78%;
    aspect-ratio: 1;
    right: -25%;
    top: -54%;
    border-radius: 46% 54% 61% 39%;
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.16),
        rgba(255, 255, 255, 0.03)
      );
    transform: rotate(31deg);
  }

  .category-card::after {
    content: "";
    position: absolute;
    z-index: -1;
    width: 78%;
    aspect-ratio: 1;
    left: 18%;
    bottom: -73%;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 46% 54% 43% 57%;
    background: rgba(255, 255, 255, 0.02);
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

  .category-card:active {
    transform: scale(0.975);
  }

  .category-card-top {
    position: relative;
    z-index: 2;
    min-width: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .category-icon-box {
    width: clamp(43px, 5vw, 58px);
    height: clamp(43px, 5vw, 58px);
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.94);
    border-radius: 50%;
    color: var(--card-ink);
    background:
      linear-gradient(
        145deg,
        #ffffff,
        rgba(249, 253, 255, 0.96)
      );
    box-shadow:
      0 11px 22px rgba(1, 40, 77, 0.18),
      inset 0 1px 0 #ffffff;
    font-size: clamp(20px, 2.6vw, 27px);
  }

  .category-ready-badge {
    min-width: 0;
    min-height: 29px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0 9px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 999px;
    color: #ffffff;
    background: rgba(0, 41, 81, 0.14);
    font-size: clamp(8px, 1.1vw, 10px);
    font-weight: 850;
    text-overflow: ellipsis;
    white-space: nowrap;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .category-ready-badge svg {
    width: 15px;
    height: 15px;
    flex: 0 0 auto;
  }

  .category-card-main {
    position: relative;
    z-index: 2;
    min-width: 0;
    align-self: center;
    padding: 5px 0;
  }

  .category-card-main h2 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(18px, 3vw, 27px);
    font-weight: 900;
    line-height: 1.03;
    letter-spacing: -0.048em;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-shadow: 0 5px 15px rgba(0, 31, 70, 0.15);
  }

  .category-card-main p {
    margin: 5px 0 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.88);
    font-size: clamp(8px, 1.25vw, 11px);
    font-weight: 620;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-card-bottom {
    position: relative;
    z-index: 2;
    min-width: 0;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
  }

  .category-meta {
    min-width: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px 9px;
    color: rgba(255, 255, 255, 0.96);
    font-size: clamp(8px, 1.1vw, 10px);
    font-weight: 800;
  }

  .category-meta span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .category-meta svg {
    width: 14px;
    height: 14px;
    flex: 0 0 auto;
  }

  .category-start-button {
    min-width: clamp(78px, 10vw, 108px);
    min-height: clamp(36px, 4.5vw, 48px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 0 0 auto;
    padding: 0 10px;
    border: 1px solid rgba(255, 255, 255, 0.96);
    border-radius: clamp(13px, 1.7vw, 18px);
    color: var(--card-ink);
    background:
      linear-gradient(
        145deg,
        #ffffff,
        rgba(248, 252, 255, 0.96)
      );
    box-shadow:
      0 10px 20px rgba(1, 40, 77, 0.18),
      inset 0 1px 0 #ffffff;
    font-size: clamp(9px, 1.35vw, 12px);
    font-weight: 900;
    pointer-events: none;
  }

  .category-start-button svg {
    width: 15px;
    height: 15px;
    flex: 0 0 auto;
  }

  .category-bottom-nav {
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

  .category-nav-item {
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

  .category-nav-item svg {
    width: 21px;
    height: 21px;
  }

  .category-nav-item span {
    overflow: hidden;
    max-width: 100%;
    font-size: 8px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-nav-item.active {
    color: #24e4bc;
  }

  .category-nav-item:active {
    transform: scale(0.92);
  }

  @media (max-width: 700px) {
    .category-shell {
      gap: clamp(6px, 1vh, 9px);
    }

    .category-header {
      grid-template-columns: 42px minmax(0, 1fr) 42px;
      gap: 9px;
    }

    .category-header-button {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      font-size: 19px;
    }

    .category-heading h1 {
      font-size: clamp(23px, 7vw, 30px);
    }

    .category-summary {
      min-height: 88px;
      padding: 10px 11px;
      border-radius: 21px;
    }

    .category-summary-content {
      max-width: calc(100vw - 170px);
    }

    .category-summary-content > span {
      margin-bottom: 3px;
      font-size: 7px;
    }

    .category-summary-content strong {
      font-size: clamp(16px, 5vw, 21px);
    }

    .category-summary-content p {
      display: none;
    }

    .category-summary-stats {
      grid-template-columns: repeat(2, minmax(55px, 1fr));
      gap: 5px;
    }

    .category-summary-stat {
      min-height: 60px;
      padding: 5px;
      border-radius: 14px;
    }

    .category-summary-stat strong {
      font-size: 20px;
    }

    .category-summary-stat span {
      margin-top: 4px;
      font-size: 6px;
    }

    .category-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, minmax(0, 1fr));
      gap: clamp(6px, 0.85vh, 8px);
    }

    .category-card {
      padding: clamp(8px, 1.5vh, 11px) 12px;
      border-radius: 19px;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-rows: 1fr auto;
      column-gap: 10px;
      row-gap: 4px;
      align-items: center;
    }

    .category-card-top {
      display: contents;
    }

    .category-icon-box {
      grid-column: 1;
      grid-row: 1 / 3;
      width: clamp(39px, 10.5vw, 50px);
      height: clamp(39px, 10.5vw, 50px);
      font-size: clamp(18px, 5vw, 23px);
    }

    .category-ready-badge {
      grid-column: 3;
      grid-row: 1;
      align-self: start;
      min-height: 24px;
      padding: 0 7px;
      font-size: 7px;
    }

    .category-ready-badge svg {
      width: 12px;
      height: 12px;
    }

    .category-card-main {
      grid-column: 2;
      grid-row: 1;
      align-self: center;
      padding: 0;
    }

    .category-card-main h2 {
      font-size: clamp(15px, 4.8vw, 20px);
    }

    .category-card-main p {
      margin-top: 2px;
      font-size: clamp(7px, 2.2vw, 9px);
    }

    .category-card-bottom {
      grid-column: 2 / 4;
      grid-row: 2;
      align-items: center;
      margin: 0;
    }

    .category-meta {
      gap: 4px 7px;
      font-size: 7px;
    }

    .category-meta svg {
      width: 11px;
      height: 11px;
    }

    .category-start-button {
      min-width: 67px;
      min-height: 29px;
      gap: 4px;
      padding: 0 7px;
      border-radius: 11px;
      font-size: 7px;
    }

    .category-start-button svg {
      width: 11px;
      height: 11px;
    }

    .category-bottom-nav {
      min-height: 62px;
      padding: 4px 6px;
      border-radius: 22px;
    }

    .category-nav-item {
      min-height: 50px;
      gap: 3px;
      border-radius: 14px;
    }

    .category-nav-item svg {
      width: 19px;
      height: 19px;
    }

    .category-nav-item span {
      font-size: 7px;
    }
  }

  @media (max-width: 390px) {
    .category-shell {
      padding:
        max(7px, var(--category-safe-top))
        max(8px, var(--category-safe-right))
        max(7px, var(--category-safe-bottom))
        max(8px, var(--category-safe-left));
    }

    .category-header {
      grid-template-columns: 38px minmax(0, 1fr) 38px;
      gap: 7px;
    }

    .category-header-button {
      width: 38px;
      height: 38px;
      border-radius: 13px;
      font-size: 17px;
    }

    .category-heading h1 {
      font-size: 21px;
    }

    .category-summary {
      min-height: 79px;
      padding: 8px 9px;
      border-radius: 18px;
    }

    .category-summary-content {
      max-width: calc(100vw - 150px);
    }

    .category-summary-content strong {
      font-size: 15px;
    }

    .category-summary-stats {
      grid-template-columns: repeat(2, minmax(48px, 1fr));
    }

    .category-summary-stat {
      min-height: 54px;
      border-radius: 12px;
    }

    .category-summary-stat strong {
      font-size: 17px;
    }

    .category-card {
      padding: 7px 9px;
      border-radius: 17px;
      column-gap: 8px;
    }

    .category-icon-box {
      width: 38px;
      height: 38px;
      font-size: 17px;
    }

    .category-card-main h2 {
      font-size: 14px;
    }

    .category-card-main p {
      font-size: 6.5px;
    }

    .category-ready-badge {
      min-height: 21px;
      padding: 0 5px;
      font-size: 6px;
    }

    .category-meta {
      font-size: 6.5px;
    }

    .category-start-button {
      min-width: 61px;
      min-height: 26px;
      font-size: 6.5px;
    }

    .category-bottom-nav {
      min-height: 57px;
      border-radius: 20px;
    }

    .category-nav-item {
      min-height: 45px;
    }

    .category-nav-item svg {
      width: 17px;
      height: 17px;
    }

    .category-nav-item span {
      font-size: 6.5px;
    }
  }

  @media (max-height: 720px) {
    .category-shell {
      gap: 5px;
      padding-top: max(5px, var(--category-safe-top));
      padding-bottom: max(5px, var(--category-safe-bottom));
    }

    .category-header {
      grid-template-columns: 36px minmax(0, 1fr) 36px;
      gap: 7px;
    }

    .category-header-button {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      font-size: 16px;
    }

    .category-heading h1 {
      font-size: 20px;
    }

    .category-summary {
      min-height: 70px;
      padding: 7px 9px;
      border-radius: 17px;
    }

    .category-summary-content > span {
      font-size: 6px;
    }

    .category-summary-content strong {
      font-size: 14px;
    }

    .category-summary-stat {
      min-height: 47px;
    }

    .category-summary-stat strong {
      font-size: 16px;
    }

    .category-card {
      padding-top: 5px;
      padding-bottom: 5px;
    }

    .category-icon-box {
      width: 34px;
      height: 34px;
      font-size: 15px;
    }

    .category-card-main h2 {
      font-size: 13px;
    }

    .category-card-main p {
      font-size: 6px;
    }

    .category-ready-badge {
      min-height: 19px;
    }

    .category-start-button {
      min-height: 23px;
    }

    .category-bottom-nav {
      min-height: 51px;
    }

    .category-nav-item {
      min-height: 40px;
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

          <nav
            className="category-bottom-nav"
            aria-label="Alt navigasyon"
          >
            <button
              type="button"
              className="category-nav-item active"
              onClick={() => navigate('/kategoriler')}
              aria-current="page"
            >
              <FiHome />
              <span>Ana Sayfa</span>
            </button>

            <button
              type="button"
              className="category-nav-item"
              onClick={() => navigate('/basarilar')}
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

export default CategoryPage
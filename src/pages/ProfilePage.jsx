import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiClock,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiXCircle,
} from 'react-icons/fi'

const styles = `
  :root {
    --profile-safe-top: env(safe-area-inset-top, 0px);
    --profile-safe-right: env(safe-area-inset-right, 0px);
    --profile-safe-bottom: env(safe-area-inset-bottom, 0px);
    --profile-safe-left: env(safe-area-inset-left, 0px);
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

  .profile-page {
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

  .profile-page::before,
  .profile-page::after {
    content: "";
    position: absolute;
    z-index: -2;
    pointer-events: none;
  }

  .profile-page::before {
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

  .profile-page::after {
    width: 390px;
    height: 390px;
    left: -250px;
    bottom: -190px;
    border: 13px dotted rgba(255, 255, 255, 0.11);
    border-radius: 50%;
  }

  .profile-shell {
    width: min(100%, 920px);
    height: 100%;
    margin: 0 auto;
    padding:
      max(10px, var(--profile-safe-top))
      max(12px, var(--profile-safe-right))
      max(10px, var(--profile-safe-bottom))
      max(12px, var(--profile-safe-left));
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    gap: clamp(8px, 1.3vh, 14px);
  }

  .profile-header {
    min-width: 0;
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) 48px;
    align-items: center;
    gap: 12px;
  }

  .profile-header-button {
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

  .profile-header-button:last-child {
    border-radius: 50%;
  }

  .profile-header-button:active {
    transform: scale(0.93);
  }

  .profile-heading {
    min-width: 0;
  }

  .profile-heading span {
    display: block;
    margin-bottom: 2px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.17em;
    text-transform: uppercase;
  }

  .profile-heading h1 {
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

  .profile-hero {
    position: relative;
    min-width: 0;
    min-height: 122px;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 17px 19px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 28px;
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

  .profile-hero::before {
    content: "";
    position: absolute;
    width: 180px;
    height: 180px;
    top: -95px;
    right: -70px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
  }

  .profile-avatar {
    position: relative;
    z-index: 1;
    width: 86px;
    height: 86px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 2px solid rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    color: #079b84;
    background:
      linear-gradient(
        145deg,
        #ffffff,
        rgba(242, 255, 250, 0.96)
      );
    box-shadow:
      0 16px 31px rgba(0, 21, 49, 0.23),
      inset 0 1px 0 #ffffff;
    font-size: 38px;
  }

  .profile-hero-content {
    position: relative;
    z-index: 1;
    min-width: 0;
  }

  .profile-hero-content > span {
    display: block;
    margin-bottom: 5px;
    color: #31e5c6;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .profile-hero-content h2 {
    margin: 0;
    overflow: hidden;
    color: #ffffff;
    font-size: clamp(21px, 4.8vw, 31px);
    font-weight: 900;
    line-height: 1.07;
    letter-spacing: -0.045em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-store {
    min-width: 0;
    margin-top: 7px;
    display: flex;
    align-items: center;
    gap: 7px;
    color: rgba(255, 255, 255, 0.68);
    font-size: 10px;
    font-weight: 700;
  }

  .profile-store span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-store svg {
    flex: 0 0 auto;
    color: #31e5c6;
  }

  .profile-score {
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

  .profile-score::before {
    content: "";
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    background: #082944;
  }

  .profile-score-content {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
  }

  .profile-score-content strong {
    color: #ffffff;
    font-size: 22px;
    font-weight: 900;
    line-height: 1;
  }

  .profile-score-content span {
    margin-top: 3px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 6px;
    font-weight: 850;
    text-transform: uppercase;
  }

  .profile-content {
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(0, 0.88fr) minmax(0, 1.12fr);
    gap: clamp(7px, 1.1vh, 11px);
  }

  .profile-stats {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(7px, 1vw, 11px);
  }

  .profile-stat-card {
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

  .profile-stat-card.green {
    background:
      radial-gradient(
        circle at 85% 8%,
        rgba(255, 255, 255, 0.2),
        transparent 37%
      ),
      linear-gradient(145deg, #22d99d, #05a989);
  }

  .profile-stat-card.purple {
    background:
      radial-gradient(
        circle at 85% 8%,
        rgba(255, 255, 255, 0.2),
        transparent 37%
      ),
      linear-gradient(145deg, #ad57f2, #663bdc);
  }

  .profile-stat-card.orange {
    background:
      radial-gradient(
        circle at 85% 8%,
        rgba(255, 255, 255, 0.2),
        transparent 37%
      ),
      linear-gradient(145deg, #ffc237, #ed8210);
  }

  .profile-stat-icon {
    width: clamp(35px, 4.5vw, 48px);
    height: clamp(35px, 4.5vw, 48px);
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: 50%;
    color: #087a6b;
    background: rgba(255, 255, 255, 0.96);
    box-shadow:
      0 9px 18px rgba(1, 40, 77, 0.16),
      inset 0 1px 0 #ffffff;
    font-size: clamp(16px, 2vw, 22px);
  }

  .profile-stat-card strong {
    display: block;
    margin-top: 6px;
    color: #ffffff;
    font-size: clamp(21px, 3vw, 31px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .profile-stat-card span {
    display: block;
    margin-top: 5px;
    color: rgba(255, 255, 255, 0.77);
    font-size: clamp(7px, 1vw, 9px);
    font-weight: 850;
    text-transform: uppercase;
  }

  .profile-panels {
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    gap: clamp(7px, 1vw, 11px);
  }

  .profile-panel {
    min-width: 0;
    min-height: 0;
    padding: clamp(12px, 1.6vw, 17px);
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

  .profile-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .profile-panel-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: clamp(12px, 1.7vw, 16px);
    font-weight: 900;
    letter-spacing: -0.025em;
  }

  .profile-panel-header svg {
    color: #2ce7c4;
    font-size: 18px;
  }

  .profile-info-list {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }

  .profile-info-row {
    min-width: 0;
    min-height: 38px;
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr);
    align-items: center;
    gap: 9px;
    padding: 5px 9px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 13px;
    background: rgba(255, 255, 255, 0.055);
  }

  .profile-info-row > svg {
    color: #2ce7c4;
    font-size: 16px;
  }

  .profile-info-content {
    min-width: 0;
  }

  .profile-info-content span {
    display: block;
    color: rgba(255, 255, 255, 0.54);
    font-size: 7px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .profile-info-content strong {
    display: block;
    margin-top: 2px;
    overflow: hidden;
    color: #ffffff;
    font-size: 10px;
    font-weight: 850;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-status {
    height: calc(100% - 28px);
    display: grid;
    place-items: center;
    align-content: center;
    padding: 9px;
    text-align: center;
  }

  .profile-status-icon {
    width: clamp(50px, 6vw, 67px);
    height: clamp(50px, 6vw, 67px);
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 50%;
    color: #2ce7c4;
    background: rgba(255, 255, 255, 0.07);
    font-size: clamp(22px, 3vw, 29px);
  }

  .profile-status strong {
    margin-top: 9px;
    color: #ffffff;
    font-size: clamp(12px, 1.8vw, 16px);
    font-weight: 900;
  }

  .profile-status span {
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.59);
    font-size: clamp(7px, 1vw, 9px);
    line-height: 1.3;
  }

  .profile-logout-button {
    min-height: 35px;
    margin-top: 10px;
    padding: 0 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 1px solid rgba(255, 255, 255, 0.17);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.84);
    background: rgba(255, 255, 255, 0.07);
    font-size: 9px;
    font-weight: 850;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color 170ms ease,
      transform 170ms ease;
  }

  .profile-logout-button:active {
    transform: scale(0.96);
  }

  .profile-bottom-nav {
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

  .profile-nav-item {
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

  .profile-nav-item svg {
    width: 21px;
    height: 21px;
  }

  .profile-nav-item span {
    overflow: hidden;
    max-width: 100%;
    font-size: 8px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-nav-item.active {
    color: #24e4bc;
  }

  .profile-nav-item:active {
    transform: scale(0.92);
  }

  @media (max-width: 700px) {
    .profile-shell {
      gap: clamp(6px, 1vh, 9px);
    }

    .profile-header {
      grid-template-columns: 42px minmax(0, 1fr) 42px;
      gap: 9px;
    }

    .profile-header-button {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      font-size: 19px;
    }

    .profile-heading h1 {
      font-size: clamp(23px, 7vw, 30px);
    }

    .profile-hero {
      min-height: 92px;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 22px;
    }

    .profile-avatar {
      width: 63px;
      height: 63px;
      font-size: 28px;
    }

    .profile-hero-content > span {
      margin-bottom: 3px;
      font-size: 7px;
    }

    .profile-hero-content h2 {
      font-size: clamp(16px, 5vw, 21px);
    }

    .profile-store {
      margin-top: 4px;
      font-size: 7px;
    }

    .profile-score {
      width: 64px;
      height: 64px;
    }

    .profile-score-content strong {
      font-size: 17px;
    }

    .profile-content {
      grid-template-rows: minmax(0, 0.78fr) minmax(0, 1.22fr);
    }

    .profile-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: repeat(2, minmax(0, 1fr));
      gap: 7px;
    }

    .profile-stat-card {
      padding: 8px 10px;
      border-radius: 17px;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      align-content: center;
      column-gap: 8px;
    }

    .profile-stat-icon {
      grid-row: 1 / 3;
      width: 35px;
      height: 35px;
      font-size: 16px;
    }

    .profile-stat-card strong {
      margin: 0;
      font-size: 18px;
    }

    .profile-stat-card span {
      margin-top: 2px;
      font-size: 6px;
    }

    .profile-panels {
      grid-template-columns: 1fr;
      grid-template-rows: minmax(0, 1fr) minmax(0, 0.72fr);
      gap: 7px;
    }

    .profile-panel {
      padding: 8px 10px;
      border-radius: 17px;
    }

    .profile-panel-header h3 {
      font-size: 10px;
    }

    .profile-info-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 5px;
      margin-top: 6px;
    }

    .profile-info-row {
      min-height: 31px;
      grid-template-columns: 22px minmax(0, 1fr);
      gap: 5px;
      padding: 3px 6px;
      border-radius: 10px;
    }

    .profile-info-row > svg {
      font-size: 13px;
    }

    .profile-info-content span {
      font-size: 5px;
    }

    .profile-info-content strong {
      font-size: 7px;
    }

    .profile-status {
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-rows: auto auto;
      column-gap: 8px;
      justify-items: start;
      text-align: left;
    }

    .profile-status-icon {
      grid-row: 1 / 3;
      width: 39px;
      height: 39px;
      font-size: 18px;
    }

    .profile-status strong {
      margin: 0;
      font-size: 11px;
    }

    .profile-status span {
      margin-top: 2px;
      font-size: 6.5px;
    }

    .profile-logout-button {
      grid-column: 3;
      grid-row: 1 / 3;
      min-height: 31px;
      margin: 0;
      padding: 0 9px;
      font-size: 7px;
    }

    .profile-bottom-nav {
      min-height: 62px;
      padding: 4px 6px;
      border-radius: 22px;
    }

    .profile-nav-item {
      min-height: 50px;
      gap: 3px;
      border-radius: 14px;
    }

    .profile-nav-item svg {
      width: 19px;
      height: 19px;
    }

    .profile-nav-item span {
      font-size: 7px;
    }
  }

  @media (max-width: 390px) {
    .profile-shell {
      padding:
        max(7px, var(--profile-safe-top))
        max(8px, var(--profile-safe-right))
        max(7px, var(--profile-safe-bottom))
        max(8px, var(--profile-safe-left));
    }

    .profile-header {
      grid-template-columns: 38px minmax(0, 1fr) 38px;
      gap: 7px;
    }

    .profile-header-button {
      width: 38px;
      height: 38px;
      border-radius: 13px;
      font-size: 17px;
    }

    .profile-heading h1 {
      font-size: 21px;
    }

    .profile-hero {
      min-height: 80px;
      padding: 8px 9px;
      border-radius: 18px;
    }

    .profile-avatar {
      width: 53px;
      height: 53px;
      font-size: 23px;
    }

    .profile-hero-content h2 {
      font-size: 15px;
    }

    .profile-score {
      width: 57px;
      height: 57px;
    }

    .profile-score-content strong {
      font-size: 15px;
    }

    .profile-stat-card {
      padding: 6px 7px;
      border-radius: 15px;
    }

    .profile-stat-icon {
      width: 30px;
      height: 30px;
      font-size: 14px;
    }

    .profile-stat-card strong {
      font-size: 16px;
    }

    .profile-panel {
      padding: 6px 8px;
      border-radius: 15px;
    }

    .profile-info-list {
      gap: 4px;
    }

    .profile-info-row {
      min-height: 28px;
    }

    .profile-bottom-nav {
      min-height: 57px;
      border-radius: 20px;
    }

    .profile-nav-item {
      min-height: 45px;
    }

    .profile-nav-item svg {
      width: 17px;
      height: 17px;
    }

    .profile-nav-item span {
      font-size: 6.5px;
    }
  }

  @media (max-height: 700px) {
    .profile-shell {
      gap: 5px;
      padding-top: max(5px, var(--profile-safe-top));
      padding-bottom: max(5px, var(--profile-safe-bottom));
    }

    .profile-hero {
      min-height: 70px;
      padding-top: 6px;
      padding-bottom: 6px;
    }

    .profile-avatar {
      width: 47px;
      height: 47px;
      font-size: 20px;
    }

    .profile-score {
      width: 52px;
      height: 52px;
    }

    .profile-stat-icon {
      width: 28px;
      height: 28px;
      font-size: 13px;
    }

    .profile-stat-card strong {
      font-size: 15px;
    }

    .profile-bottom-nav {
      min-height: 51px;
    }

    .profile-nav-item {
      min-height: 40px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .profile-header-button,
    .profile-nav-item,
    .profile-logout-button {
      transition-duration: 0.01ms !important;
    }
  }
`

function ProfilePage() {
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

  const profile = useMemo(() => {
    const score = Number(result?.score || 0)
    const correctCount = Number(result?.correctCount || 0)
    const wrongCount = Number(result?.wrongCount || 0)
    const duration = Number(result?.duration || 0)
    const passed = score >= 70
    const hasResult = Boolean(result)

    return {
      fullName:
        participant?.fullName?.trim() ||
        'Demo Katılımcısı',
      storeCode:
        participant?.storeCode || 'Demo',
      storeName:
        participant?.storeName?.trim() ||
        'Demo Mağazası',
      score,
      correctCount,
      wrongCount,
      duration,
      passed,
      hasResult,
      passedCount: hasResult && passed ? 1 : 0,
      failedCount: hasResult && !passed ? 1 : 0,
      badgeCount:
        hasResult
          ? score === 100
            ? 4
            : score >= 90
              ? 3
              : passed
                ? 2
                : 1
          : 0,
      categoryName:
        result?.categoryName ||
        'Henüz sınav tamamlanmadı',
    }
  }, [participant, result])

  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return '0 dk'

    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const handleLogout = () => {
    sessionStorage.removeItem('musteriBuddyMode')
    sessionStorage.removeItem('musteriBuddyParticipant')
    sessionStorage.removeItem('musteriBuddyResult')
    navigate('/', { replace: true })
  }

  return (
    <>
      <style>{styles}</style>

      <main className="profile-page">
        <div className="profile-shell">
          <header className="profile-header">
            <button
              type="button"
              className="profile-header-button"
              onClick={() => navigate('/kategoriler')}
              aria-label="Kategorilere dön"
            >
              <FiChevronLeft />
            </button>

            <div className="profile-heading">
              <span>Müşteri Buddy</span>
              <h1>Profil</h1>
            </div>

            <button
              type="button"
              className="profile-header-button"
              aria-label="Katılımcı profili"
            >
              <FiUser />
            </button>
          </header>

          <section className="profile-hero">
            <div
              className="profile-avatar"
              aria-hidden="true"
            >
              <FiUser />
            </div>

            <div className="profile-hero-content">
              <span>Katılımcı profili</span>
              <h2>{profile.fullName}</h2>

              <div className="profile-store">
                <FiMapPin />
                <span>
                  {profile.storeCode} · {profile.storeName}
                </span>
              </div>
            </div>

            <div
              className="profile-score"
              style={{ '--score': profile.score }}
              aria-label={`Son sınav puanı ${profile.score}`}
            >
              <div className="profile-score-content">
                <strong>{profile.score}</strong>
                <span>Son puan</span>
              </div>
            </div>
          </section>

          <section className="profile-content">
            <div className="profile-stats">
              <article className="profile-stat-card green">
                <span className="profile-stat-icon">
                  <FiCheckCircle />
                </span>
                <strong>{profile.passedCount}</strong>
                <span>Başarılı sınav</span>
              </article>

              <article className="profile-stat-card">
                <span className="profile-stat-icon">
                  <FiXCircle />
                </span>
                <strong>{profile.failedCount}</strong>
                <span>Başarısız sınav</span>
              </article>

              <article className="profile-stat-card purple">
                <span className="profile-stat-icon">
                  <FiAward />
                </span>
                <strong>{profile.badgeCount}</strong>
                <span>Kazanılan rozet</span>
              </article>

              <article className="profile-stat-card orange">
                <span className="profile-stat-icon">
                  <FiTrendingUp />
                </span>
                <strong>{profile.score}</strong>
                <span>Ortalama puan</span>
              </article>
            </div>

            <div className="profile-panels">
              <section className="profile-panel">
                <div className="profile-panel-header">
                  <h3>Katılımcı bilgileri</h3>
                  <FiShield />
                </div>

                <div className="profile-info-list">
                  <div className="profile-info-row">
                    <FiUser />

                    <div className="profile-info-content">
                      <span>Ad Soyad</span>
                      <strong>{profile.fullName}</strong>
                    </div>
                  </div>

                  <div className="profile-info-row">
                    <FiMapPin />

                    <div className="profile-info-content">
                      <span>Mağaza</span>
                      <strong>{profile.storeName}</strong>
                    </div>
                  </div>

                  <div className="profile-info-row">
                    <FiBookOpen />

                    <div className="profile-info-content">
                      <span>Son kategori</span>
                      <strong>{profile.categoryName}</strong>
                    </div>
                  </div>

                  <div className="profile-info-row">
                    <FiClock />

                    <div className="profile-info-content">
                      <span>Son süre</span>
                      <strong>
                        {formatTime(profile.duration)}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="profile-panel">
                <div className="profile-panel-header">
                  <h3>Başarı durumu</h3>
                  <FiTarget />
                </div>

                <div className="profile-status">
                  <span className="profile-status-icon">
                    {profile.hasResult ? (
                      profile.passed ? (
                        <FiAward />
                      ) : (
                        <FiTarget />
                      )
                    ) : (
                      <FiBookOpen />
                    )}
                  </span>

                  <strong>
                    {profile.hasResult
                      ? profile.passed
                        ? 'Başarılı'
                        : 'Gelişime devam'
                      : 'Sınava hazır'}
                  </strong>

                  <span>
                    {profile.hasResult
                      ? profile.passed
                        ? 'Geçme notu olan 70 puanı aştınız.'
                        : '70 puana ulaşmak için tekrar çalışabilirsiniz.'
                      : 'Bir kategori seçerek ilk sınavınızı başlatın.'}
                  </span>

                  <button
                    type="button"
                    className="profile-logout-button"
                    onClick={handleLogout}
                  >
                    <FiLogOut />
                    Çıkış Yap
                  </button>
                </div>
              </section>
            </div>
          </section>

          <nav
            className="profile-bottom-nav"
            aria-label="Alt navigasyon"
          >
            <button
              type="button"
              className="profile-nav-item"
              onClick={() => navigate('/kategoriler')}
            >
              <FiHome />
              <span>Ana Sayfa</span>
            </button>

            <button
              type="button"
              className="profile-nav-item"
              onClick={() => navigate('/basarilar')}
            >
              <FiAward />
              <span>Başarılar</span>
            </button>

            <button
              type="button"
              className="profile-nav-item"
              onClick={() => navigate('/istatistikler')}
            >
              <FiBarChart2 />
              <span>İstatistikler</span>
            </button>

            <button
              type="button"
              className="profile-nav-item active"
              aria-current="page"
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

export default ProfilePage
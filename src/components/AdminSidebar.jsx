import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  FiAward,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiUploadCloud,
  FiUsers,
  FiX,
} from 'react-icons/fi'

function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FiGrid />,
      path: '/yonetim/dashboard',
    },
    {
      title: 'Excel ile Soru Yükle',
      icon: <FiUploadCloud />,
      path: '/yonetim',
    },
    {
      title: 'Soru Yönetimi',
      icon: <FiHelpCircle />,
      path: '/yonetim/sorular',
    },
    {
      title: 'Sonuçlar',
      icon: <FiFileText />,
      path: '/yonetim/sonuclar',
    },
    {
      title: 'Mağaza Sıralaması',
      icon: <FiAward />,
      path: '/yonetim/siralama',
    },
    {
      title: 'Kullanıcı Yönetimi',
      icon: <FiUsers />,
      path: '/yonetim/kullanicilar',
    },
  ]

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = ''
      return undefined
    }

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleNavigate = (path) => {
    setMobileMenuOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('musteriBuddyAdmin')
    sessionStorage.removeItem(
      'musteriBuddyAdminEmail',
    )

    setMobileMenuOpen(false)

    navigate('/yonetici', {
      replace: true,
    })
  }

  return (
    <>
      <style>{styles}</style>

      <header className="admin-mobile-header">
        <div className="admin-mobile-brand">
          <span>MB</span>

          <div>
            <strong>Müşteri Buddy</strong>
            <small>Yönetim Paneli</small>
          </div>
        </div>

        <button
          type="button"
          className="admin-mobile-menu-button"
          aria-label="Yönetim menüsünü aç"
          aria-expanded={mobileMenuOpen}
          onClick={() =>
            setMobileMenuOpen(true)
          }
        >
          <FiMenu />
        </button>
      </header>

      {mobileMenuOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Menüyü kapat"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileMenuOpen ? 'mobile-open' : ''
        }`}
      >
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-brand">
            <span>MB</span>

            <div>
              <strong>Müşteri Buddy</strong>
              <small>Yönetim Paneli</small>
            </div>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="Menüyü kapat"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            <FiX />
          </button>
        </div>

        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={
                location.pathname === item.path
                  ? 'active'
                  : ''
              }
              onClick={() =>
                handleNavigate(item.path)
              }
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="admin-sidebar-logout"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Çıkış Yap</span>
        </button>
      </aside>
    </>
  )
}

const styles = `
  .admin-mobile-header {
    display: none;
  }

  .admin-sidebar-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .admin-sidebar-close,
  .admin-sidebar-backdrop {
    display: none;
  }

  @media (max-width: 900px) {
    html,
    body,
    #root {
      width: 100%;
      max-width: 100%;
      min-height: 100%;
      overflow-x: hidden;
    }

    .admin-mobile-header {
      position: sticky;
      top: 0;
      z-index: 800;
      width: 100%;
      min-height: calc(
        72px + env(safe-area-inset-top)
      );
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding:
        calc(12px + env(safe-area-inset-top))
        max(16px, env(safe-area-inset-right))
        12px
        max(16px, env(safe-area-inset-left));
      background: #071b2d;
      color: #ffffff;
      box-shadow:
        0 8px 24px rgba(7, 27, 45, 0.16);
    }

    .admin-mobile-brand {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 11px;
    }

    .admin-mobile-brand > span {
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      border-radius: 12px;
      background: linear-gradient(
        145deg,
        #14c7ac,
        #00856a
      );
      color: #ffffff;
      font-size: 13px;
      font-weight: 850;
    }

    .admin-mobile-brand > div {
      min-width: 0;
      display: grid;
      gap: 2px;
    }

    .admin-mobile-brand strong {
      overflow: hidden;
      font-size: 15px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .admin-mobile-brand small {
      color: rgba(255, 255, 255, 0.62);
      font-size: 11px;
    }

    .admin-mobile-menu-button {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      padding: 0;
      border: 1px solid
        rgba(255, 255, 255, 0.16);
      border-radius: 13px;
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      font-size: 23px;
    }

    .admin-sidebar {
      position: fixed !important;
      inset:
        0 auto 0 0 !important;
      z-index: 1000 !important;
      width: min(310px, 86vw) !important;
      max-width: 310px !important;
      height: 100dvh !important;
      display: flex !important;
      flex-direction: column !important;
      padding:
        calc(20px + env(safe-area-inset-top))
        16px
        calc(18px + env(safe-area-inset-bottom))
        !important;
      border-right: 0 !important;
      background: #071b2d !important;
      color: #ffffff !important;
      box-shadow:
        24px 0 60px rgba(0, 0, 0, 0.28) !important;
      transform: translateX(-105%);
      transition: transform 220ms ease;
      overflow-y: auto;
    }

    .admin-sidebar.mobile-open {
      transform: translateX(0);
    }

    .admin-sidebar-backdrop {
      position: fixed;
      inset: 0;
      z-index: 950;
      display: block;
      width: 100%;
      height: 100%;
      padding: 0;
      border: 0;
      background: rgba(5, 15, 24, 0.62);
      backdrop-filter: blur(3px);
    }

    .admin-sidebar-close {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      padding: 0;
      border: 1px solid
        rgba(255, 255, 255, 0.14);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.07);
      color: #ffffff;
      font-size: 21px;
    }

    .admin-sidebar-brand {
      min-width: 0;
      padding: 0 !important;
    }

    .admin-sidebar-brand > div {
      min-width: 0;
    }

    .admin-sidebar-brand strong,
    .admin-sidebar-brand small {
      color: inherit;
    }

    .admin-sidebar-menu {
      display: grid !important;
      gap: 7px !important;
      margin-top: 28px !important;
      overflow: visible !important;
    }

    .admin-sidebar-menu button {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 50px !important;
      display: flex !important;
      align-items: center !important;
      gap: 13px !important;
      padding: 0 15px !important;
      border: 0 !important;
      border-radius: 13px !important;
      background: transparent !important;
      color:
        rgba(255, 255, 255, 0.7) !important;
      text-align: left !important;
      font-size: 14px !important;
      font-weight: 650 !important;
      white-space: normal !important;
    }

    .admin-sidebar-menu button.active {
      background:
        rgba(20, 199, 172, 0.16) !important;
      color: #5ce0cb !important;
    }

    .admin-sidebar-menu button svg {
      flex-shrink: 0;
      font-size: 19px;
    }

    .admin-sidebar-logout {
      position: static !important;
      width: 100% !important;
      min-height: 50px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 13px !important;
      margin-top: auto !important;
      padding: 0 15px !important;
      border: 1px solid
        rgba(255, 255, 255, 0.12) !important;
      border-radius: 13px !important;
      background: rgba(255, 255, 255, 0.06) !important;
      color: #ffffff !important;
      font-size: 14px !important;
      font-weight: 700 !important;
    }

    .dashboard-page,
    .admin-dashboard,
    .question-management-page,
    .user-management-page,
    .ranking-page {
      width: 100% !important;
      max-width: 100% !important;
      min-height: 100dvh !important;
      display: block !important;
      overflow-x: hidden !important;
    }

    .dashboard-content,
    .admin-content,
    .question-main-content,
    .user-content {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      padding:
        22px
        max(16px, env(safe-area-inset-right))
        calc(
          32px + env(safe-area-inset-bottom)
        )
        max(16px, env(safe-area-inset-left))
        !important;
      margin: 0 !important;
    }

    .dashboard-header,
    .admin-results-header,
    .question-page-header,
    .user-page-header,
    .ranking-header {
      width: 100% !important;
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 18px !important;
    }

    .dashboard-header h1,
    .admin-results-header h1,
    .question-page-header h1,
    .user-page-header h1,
    .ranking-header h1 {
      font-size: clamp(
        27px,
        8vw,
        38px
      ) !important;
      overflow-wrap: anywhere;
    }

    .dashboard-header-actions,
    .question-header-actions {
      width: 100% !important;
      justify-content: space-between !important;
      flex-wrap: wrap !important;
    }

    .dashboard-statistics-grid,
    .question-statistics-grid,
    .user-statistics-grid,
    .ranking-summary {
      grid-template-columns:
        1fr !important;
    }

    .result-filters,
    .question-filter-panel,
    .user-filter-panel,
    .ranking-filters {
      width: 100% !important;
      grid-template-columns:
        1fr !important;
    }

    .result-filters > *,
    .question-filter-panel > *,
    .user-filter-panel > *,
    .ranking-filters > * {
      width: 100% !important;
      min-width: 0 !important;
      grid-column: auto !important;
    }

    table {
      max-width: none;
    }
  }
`

export default AdminSidebar
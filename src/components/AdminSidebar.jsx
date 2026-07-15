import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiAward,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiUploadCloud,
  FiUsers,
} from 'react-icons/fi'

function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

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

  const handleLogout = () => {
    sessionStorage.removeItem('musteriBuddyAdmin')
    sessionStorage.removeItem('musteriBuddyAdminEmail')

    navigate('/yonetici')
  }

  return (
    <aside className="admin-sidebar">

      <div className="admin-sidebar-brand">
        <span>MB</span>

        <div>
          <strong>Müşteri Buddy</strong>
          <small>Yönetim Paneli</small>
        </div>
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
            onClick={() => navigate(item.path)}
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
  )
}

export default AdminSidebar
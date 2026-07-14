import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiLock, FiLogIn, FiMail } from 'react-icons/fi'
import '../styles/admin-login.css'

function AdminLoginPage() {
  const navigate = useNavigate()

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate('/')}
        >
          <FiArrowLeft />
          Geri dön
        </button>

        <div className="admin-login-icon">
          <FiLock />
        </div>

        <span className="admin-eyebrow">Yönetim alanı</span>
        <h1>Sistem Yöneticisi</h1>
        <p>
          Soru yönetimi, sonuçlar ve raporlar için güvenli giriş yapın.
        </p>

        <form className="admin-form" onSubmit={(event) => { event.preventDefault(); navigate("/yonetim") }}>
          <label>
            <span>E-posta</span>
            <div className="admin-input">
              <FiMail />
              <input type="email" placeholder="E-posta adresi" />
            </div>
          </label>

          <label>
            <span>Şifre</span>
            <div className="admin-input">
              <FiLock />
              <input type="password" placeholder="Şifre" />
            </div>
          </label>

          <button type="submit">
            <FiLogIn />
            Giriş Yap
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminLoginPage

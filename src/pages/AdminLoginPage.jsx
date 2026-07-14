import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiLock,
  FiLogIn,
  FiMail,
} from 'react-icons/fi'
import '../styles/admin-login.css'

function AdminLoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()

    const normalizedEmail = email.trim()
    const normalizedPassword = password.trim()

    setErrorMessage('')

    if (!normalizedEmail) {
      setErrorMessage('Lütfen e-posta adresinizi girin.')
      return
    }

    if (!normalizedPassword) {
      setErrorMessage('Lütfen şifrenizi girin.')
      return
    }

    try {
      setIsSubmitting(true)

      sessionStorage.setItem('musteriBuddyAdmin', 'true')
      sessionStorage.setItem('musteriBuddyAdminEmail', normalizedEmail)

      navigate('/yonetim/sorular', {
  replace: true,
})
    } catch (error) {
      console.error('Yönetici girişi yapılamadı:', error)
      setErrorMessage('Giriş sırasında bir hata oluştu.')
      setIsSubmitting(false)
    }
  }

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

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            <span>E-posta</span>

            <div className="admin-input">
              <FiMail />

              <input
                type="email"
                value={email}
                placeholder="E-posta adresi"
                autoComplete="email"
                required
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrorMessage('')
                }}
              />
            </div>
          </label>

          <label>
            <span>Şifre</span>

            <div className="admin-input">
              <FiLock />

              <input
                type="password"
                value={password}
                placeholder="Şifre"
                autoComplete="current-password"
                required
                onChange={(event) => {
                  setPassword(event.target.value)
                  setErrorMessage('')
                }}
              />
            </div>
          </label>

          {errorMessage && (
            <div className="admin-login-error" role="alert">
              <FiAlertCircle />
              <span>{errorMessage}</span>
            </div>
          )}

          <button type="submit" disabled={isSubmitting}>
            <FiLogIn />
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminLoginPage
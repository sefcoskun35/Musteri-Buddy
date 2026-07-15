import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiLock,
  FiLogIn,
  FiMail,
} from 'react-icons/fi'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import '../styles/admin-login.css'

function AdminLoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getLoginErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Geçerli bir e-posta adresi girin.'

      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'E-posta adresi veya şifre hatalı.'

      case 'auth/user-disabled':
        return 'Bu yönetici hesabı devre dışı bırakılmış.'

      case 'auth/too-many-requests':
        return 'Çok fazla hatalı giriş denemesi yapıldı. Bir süre sonra tekrar deneyin.'

      case 'auth/network-request-failed':
        return 'İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edin.'

      default:
        return 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.'
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedEmail = email.trim().toLocaleLowerCase('tr-TR')
    const normalizedPassword = password

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

      const credential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        normalizedPassword,
      )

      sessionStorage.setItem('musteriBuddyAdmin', 'true')
      sessionStorage.setItem(
        'musteriBuddyAdminEmail',
        credential.user.email || normalizedEmail,
      )

      navigate('/yonetim/dashboard', {
        replace: true,
      })
    } catch (error) {
      console.error('Yönetici girişi yapılamadı:', error)

      sessionStorage.removeItem('musteriBuddyAdmin')
      sessionStorage.removeItem('musteriBuddyAdminEmail')

      setErrorMessage(getLoginErrorMessage(error?.code))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <button
          type="button"
          className="admin-back-button"
          disabled={isSubmitting}
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
                inputMode="email"
                required
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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

            {isSubmitting
              ? 'Giriş yapılıyor...'
              : 'Giriş Yap'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminLoginPage
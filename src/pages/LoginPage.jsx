import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiAlertCircle,
  FiArrowRight,
  FiBookOpen,
  FiLock,
  FiUsers,
} from 'react-icons/fi'
import { registerOrGetUser } from '../services/userService'
import '../styles/auth.css'

const initialForm = {
  fullName: '',
  storeCode: '',
  storeName: '',
}

function LoginPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    const nextValue =
      name === 'storeCode'
        ? value.replace(/\D/g, '').slice(0, 3)
        : value

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
    }))

    setLoginError('')
  }

  const validate = () => {
    const nextErrors = {}

    if (form.fullName.trim().length < 3) {
      nextErrors.fullName = 'Ad ve soyad bilgisi giriniz.'
    }

    if (!/^\d{3}$/.test(form.storeCode)) {
      nextErrors.storeCode = 'Mağaza kodu 3 haneli olmalıdır.'
    }

    if (form.storeName.trim().length < 2) {
      nextErrors.storeName = 'Mağaza adını giriniz.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate() || isSubmitting) {
      return
    }

    const participant = {
      fullName: form.fullName.trim(),
      storeCode: form.storeCode.trim(),
      storeName: form.storeName.trim(),
    }

    try {
      setIsSubmitting(true)
      setLoginError('')

      const user = await registerOrGetUser(participant)

      sessionStorage.setItem('musteriBuddyMode', 'official')

      sessionStorage.setItem(
        'musteriBuddyParticipant',
        JSON.stringify({
          id: user.id,
          fullName: user.fullName,
          storeCode: user.storeCode,
          storeName: user.storeName,
        }),
      )

      navigate('/kategoriler')
    } catch (error) {
      console.error('Katılımcı girişi yapılamadı:', error)

      setLoginError(
        error?.message ||
          'Giriş işlemi tamamlanamadı. Bağlantınızı kontrol edip tekrar deneyin.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const startDemo = () => {
    sessionStorage.setItem('musteriBuddyMode', 'demo')
    sessionStorage.removeItem('musteriBuddyParticipant')

    navigate('/kategoriler')
  }

  return (
    <main className="auth-page">
      <div className="auth-background auth-background-one" />
      <div className="auth-background auth-background-two" />

      <section className="auth-shell">
        <div className="auth-intro">
          <div className="brand-mark" aria-hidden="true">
            <FiUsers />
          </div>

          <span className="eyebrow">Bilgi ve gelişim platformu</span>

          <h1>
            Müşteri
            <span> Buddy</span>
          </h1>

          <p>
            Kategori bilginizi ölçün, gelişiminizi takip edin ve mağazanızdaki
            sıralamanızı görün.
          </p>

          <div className="feature-row">
            <div className="feature-item">
              <FiBookOpen />
              <span>Kategori sınavları</span>
            </div>

            <div className="feature-item">
              <FiUsers />
              <span>Mağaza sıralaması</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <span className="section-label">Katılımcı girişi</span>
            <h2>Bilgilerinizi girin</h2>
            <p>Sınavlara erişmek için bilgilerinizi eksiksiz doldurun.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="form-field">
              <span>Ad Soyad</span>

              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Adınız ve soyadınız"
                autoComplete="name"
                disabled={isSubmitting}
              />

              {errors.fullName && (
                <small className="field-error">{errors.fullName}</small>
              )}
            </label>

            <div className="form-grid">
              <label className="form-field">
                <span>Mağaza Kodu</span>

                <input
                  type="text"
                  inputMode="numeric"
                  name="storeCode"
                  value={form.storeCode}
                  onChange={handleChange}
                  placeholder="Örn. 045"
                  autoComplete="off"
                  disabled={isSubmitting}
                />

                {errors.storeCode && (
                  <small className="field-error">{errors.storeCode}</small>
                )}
              </label>

              <label className="form-field">
                <span>Mağaza Adı</span>

                <input
                  type="text"
                  name="storeName"
                  value={form.storeName}
                  onChange={handleChange}
                  placeholder="Mağaza adı"
                  autoComplete="organization"
                  disabled={isSubmitting}
                />

                {errors.storeName && (
                  <small className="field-error">{errors.storeName}</small>
                )}
              </label>
            </div>

            {loginError && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '9px',
                  padding: '12px 13px',
                  border: '1px solid #efc1c6',
                  borderRadius: '11px',
                  background: '#fff1f2',
                  color: '#b53c49',
                  fontSize: '12px',
                  lineHeight: '1.5',
                }}
              >
                <FiAlertCircle
                  style={{
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                />

                <span>{loginError}</span>
              </div>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting ? 'Kontrol ediliyor...' : 'Devam Et'}
              </span>

              <FiArrowRight />
            </button>
          </form>

          <div className="divider">
            <span>veya</span>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={startDemo}
            disabled={isSubmitting}
          >
            <FiBookOpen />
            <span>Demo Sınavını Gör</span>
          </button>

          <button
            className="admin-link"
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate('/yonetici')}
          >
            <FiLock />
            <span>Sistem Yöneticisi Girişi</span>
          </button>
        </div>
      </section>

      <footer className="auth-footer">
        <span>Müşteri Buddy</span>
        <span>•</span>
        <span>Güvenli sınav deneyimi</span>
      </footer>
    </main>
  )
}

export default LoginPage
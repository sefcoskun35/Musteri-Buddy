import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiLock,
  FiMapPin,
  FiShield,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
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

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: '',
      }))
    }
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

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!validate()) return

    sessionStorage.setItem('musteriBuddyMode', 'official')

    sessionStorage.setItem(
      'musteriBuddyParticipant',
      JSON.stringify({
        fullName: form.fullName.trim(),
        storeCode: form.storeCode,
        storeName: form.storeName.trim(),
      }),
    )

    navigate('/kategoriler')
  }

  const startDemo = () => {
    sessionStorage.setItem('musteriBuddyMode', 'demo')
    sessionStorage.removeItem('musteriBuddyParticipant')
    navigate('/kategoriler')
  }

  return (
    <main className="auth-page">
      <div className="auth-background auth-background-one" aria-hidden="true" />
      <div className="auth-background auth-background-two" aria-hidden="true" />

      <section className="auth-shell">
        <div className="auth-intro">
          <div className="brand-mark" aria-hidden="true">
            <FiUsers />
          </div>

          <span className="eyebrow">
            <FiCheckCircle />
            Bilgi ve gelişim platformu
          </span>

          <h1>
            Müşteri
            <span> Buddy</span>
          </h1>

          <p>
            Kategori bilginizi ölçün, gelişiminizi takip edin ve mağazanızdaki
            sıralamanızı görün.
          </p>

          <div className="feature-row" aria-label="Platform özellikleri">
            <div className="feature-item">
              <FiBookOpen />
              <span>Kategori sınavları</span>
            </div>

            <div className="feature-item">
              <FiAward />
              <span>Başarı rozetleri</span>
            </div>

            <div className="feature-item">
              <FiUsers />
              <span>Mağaza sıralaması</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <header className="auth-card-header">
            <span className="section-label">Katılımcı girişi</span>
            <h2>Hoş geldiniz</h2>
            <p>
              Sınava başlamak için mağaza ve katılımcı bilgilerinizi girin.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="form-field">
              <span>Ad Soyad</span>

              <div className="input-container">
                <FiUser className="input-icon" aria-hidden="true" />

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Adınız ve soyadınız"
                  autoComplete="name"
                  autoCapitalize="words"
                  spellCheck="false"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? 'fullName-error' : undefined
                  }
                />
              </div>

              {errors.fullName && (
                <small
                  className="field-error"
                  id="fullName-error"
                  role="alert"
                >
                  {errors.fullName}
                </small>
              )}
            </label>

            <div className="form-grid">
              <label className="form-field">
                <span>Mağaza Kodu</span>

                <div className="input-container">
                  <FiShield className="input-icon" aria-hidden="true" />

                  <input
                    type="text"
                    inputMode="numeric"
                    name="storeCode"
                    value={form.storeCode}
                    onChange={handleChange}
                    placeholder="Örn. 045"
                    autoComplete="off"
                    maxLength={3}
                    aria-invalid={Boolean(errors.storeCode)}
                    aria-describedby={
                      errors.storeCode ? 'storeCode-error' : undefined
                    }
                  />
                </div>

                {errors.storeCode && (
                  <small
                    className="field-error"
                    id="storeCode-error"
                    role="alert"
                  >
                    {errors.storeCode}
                  </small>
                )}
              </label>

              <label className="form-field">
                <span>Mağaza Adı</span>

                <div className="input-container">
                  <FiMapPin className="input-icon" aria-hidden="true" />

                  <input
                    type="text"
                    name="storeName"
                    value={form.storeName}
                    onChange={handleChange}
                    placeholder="Mağaza adı"
                    autoComplete="organization"
                    autoCapitalize="words"
                    spellCheck="false"
                    aria-invalid={Boolean(errors.storeName)}
                    aria-describedby={
                      errors.storeName ? 'storeName-error' : undefined
                    }
                  />
                </div>

                {errors.storeName && (
                  <small
                    className="field-error"
                    id="storeName-error"
                    role="alert"
                  >
                    {errors.storeName}
                  </small>
                )}
              </label>
            </div>

            <button className="primary-button" type="submit">
              <span>Sınava Başla</span>
              <FiArrowRight aria-hidden="true" />
            </button>
          </form>

          <div className="divider" aria-hidden="true">
            <span>veya</span>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={startDemo}
          >
            <FiBookOpen aria-hidden="true" />
            <span>Demo Sınavını İncele</span>
          </button>

          <button
            className="admin-link"
            type="button"
            onClick={() => navigate('/yonetici')}
          >
            <FiLock aria-hidden="true" />
            <span>Sistem Yöneticisi Girişi</span>
          </button>
        </div>
      </section>

      <footer className="auth-footer">
        <FiShield aria-hidden="true" />
        <span>Müşteri Buddy</span>
        <span aria-hidden="true">•</span>
        <span>Güvenli sınav deneyimi</span>
      </footer>
    </main>
  )
}

export default LoginPage
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiBookOpen,
  FiLock,
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

    setErrors((current) => ({
      ...current,
      [name]: '',
    }))
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
                />
                {errors.storeName && (
                  <small className="field-error">{errors.storeName}</small>
                )}
              </label>
            </div>

            <button className="primary-button" type="submit">
              <span>Devam Et</span>
              <FiArrowRight />
            </button>
          </form>

          <div className="divider">
            <span>veya</span>
          </div>

          <button className="secondary-button" type="button" onClick={startDemo}>
            <FiBookOpen />
            <span>Demo Sınavını Gör</span>
          </button>

          <button
            className="admin-link"
            type="button"
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

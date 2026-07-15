import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import {
  FiActivity,
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiRefreshCw,
  FiTrendingUp,
  FiUploadCloud,
  FiUsers,
  FiXCircle,
} from 'react-icons/fi'
import { getAllResults } from '../services/adminResultService'

const PASSING_SCORE = 70

function getResultDate(value) {
  if (!value) {
    return new Date(0)
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }

  if (typeof value?.seconds === 'number') {
    return new Date(value.seconds * 1000)
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function getInitials(fullName = '') {
  const parts = String(fullName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return 'MB'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toLocaleUpperCase('tr-TR')
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase(
    'tr-TR',
  )
}

function LoadingRows({ count = 4 }) {
  return (
    <div className="dashboard-loading-list">
      {Array.from({ length: count }, (_, index) => (
        <div className="dashboard-loading-row" key={index}>
          <span />

          <div>
            <span />
            <span />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="dashboard-empty-state">
      <div>{icon}</div>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setErrorMessage('')

      const data = await getAllResults()

      setResults(Array.isArray(data) ? data : [])
      setLastUpdatedAt(new Date())
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error)

      setErrorMessage(
        'Dashboard verileri yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const dashboardData = useMemo(() => {
    const completedResults = results.filter(
      (result) => result.active !== false,
    )

    const totalResults = completedResults.length

    const passedResults = completedResults.filter(
      (result) => Number(result.score || 0) >= PASSING_SCORE,
    ).length

    const failedResults = Math.max(totalResults - passedResults, 0)

    const averageScore =
      totalResults > 0
        ? Math.round(
            completedResults.reduce(
              (total, result) => total + Number(result.score || 0),
              0,
            ) / totalResults,
          )
        : 0

    const successRate =
      totalResults > 0
        ? Math.round((passedResults / totalResults) * 100)
        : 0

    const averageDuration =
      totalResults > 0
        ? Math.round(
            completedResults.reduce(
              (total, result) => total + Number(result.duration || 0),
              0,
            ) / totalResults,
          )
        : 0

    const uniqueParticipants = new Set(
      completedResults
        .map(
          (result) =>
            result.userId ||
            result.employeeId ||
            `${result.fullName || ''}-${result.storeCode || ''}`,
        )
        .filter(Boolean),
    ).size

    const uniqueStores = new Set(
      completedResults
        .map((result) => result.storeCode || result.storeName)
        .filter(Boolean),
    ).size

    const categoryMap = completedResults.reduce((summary, result) => {
      const categoryName = String(
        result.categoryName || result.categoryId || 'Belirtilmemiş',
      ).trim()

      if (!summary[categoryName]) {
        summary[categoryName] = {
          name: categoryName,
          count: 0,
          totalScore: 0,
          passed: 0,
        }
      }

      summary[categoryName].count += 1
      summary[categoryName].totalScore += Number(result.score || 0)

      if (Number(result.score || 0) >= PASSING_SCORE) {
        summary[categoryName].passed += 1
      }

      return summary
    }, {})

    const categories = Object.values(categoryMap)
      .map((category) => ({
        ...category,
        averageScore:
          category.count > 0
            ? Math.round(category.totalScore / category.count)
            : 0,
        successRate:
          category.count > 0
            ? Math.round((category.passed / category.count) * 100)
            : 0,
      }))
      .sort((firstCategory, secondCategory) => {
        if (secondCategory.averageScore !== firstCategory.averageScore) {
          return secondCategory.averageScore - firstCategory.averageScore
        }

        return secondCategory.count - firstCategory.count
      })

    const storeMap = completedResults.reduce((summary, result) => {
      const storeKey =
        result.storeCode || result.storeName || 'Belirtilmemiş'

      if (!summary[storeKey]) {
        summary[storeKey] = {
          code: result.storeCode || '',
          name: result.storeName || storeKey,
          count: 0,
          totalScore: 0,
          passed: 0,
        }
      }

      summary[storeKey].count += 1
      summary[storeKey].totalScore += Number(result.score || 0)

      if (Number(result.score || 0) >= PASSING_SCORE) {
        summary[storeKey].passed += 1
      }

      return summary
    }, {})

    const topStores = Object.values(storeMap)
      .map((store) => ({
        ...store,
        averageScore:
          store.count > 0
            ? Math.round(store.totalScore / store.count)
            : 0,
        successRate:
          store.count > 0
            ? Math.round((store.passed / store.count) * 100)
            : 0,
      }))
      .sort((firstStore, secondStore) => {
        if (secondStore.averageScore !== firstStore.averageScore) {
          return secondStore.averageScore - firstStore.averageScore
        }

        return secondStore.count - firstStore.count
      })
      .slice(0, 5)

    const recentResults = [...completedResults]
      .sort(
        (firstResult, secondResult) =>
          getResultDate(secondResult.completedAt).getTime() -
          getResultDate(firstResult.completedAt).getTime(),
      )
      .slice(0, 6)

    return {
      totalResults,
      passedResults,
      failedResults,
      averageScore,
      successRate,
      averageDuration,
      uniqueParticipants,
      uniqueStores,
      categories,
      topStores,
      recentResults,
    }
  }, [results])

  const formatDuration = (seconds = 0) => {
    const safeSeconds = Math.max(Number(seconds) || 0, 0)
    const minutes = Math.floor(safeSeconds / 60)
    const remainingSeconds = Math.round(safeSeconds % 60)

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }

  const formatDate = (value) => {
    const date = getResultDate(value)

    if (!date.getTime()) {
      return '-'
    }

    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatUpdateTime = () => {
    if (!lastUpdatedAt) {
      return 'Henüz güncellenmedi'
    }

    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(lastUpdatedAt)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('musteriBuddyAdmin')
    sessionStorage.removeItem('musteriBuddyAdminEmail')

    navigate('/yonetici', {
      replace: true,
    })
  }

  return (
    <>
      <style>{styles}</style>

      <main className="dashboard-page">
  <AdminSidebar />

        <section className="dashboard-content">
          <header className="dashboard-header">
            <div>
              <span className="dashboard-eyebrow">Genel Bakış</span>
              <h1>Yönetici Dashboard</h1>

              <p>
                Katılım, başarı ve mağaza performanslarını tek ekrandan takip
                edin.
              </p>
            </div>

            <div className="dashboard-header-actions">
              <div className="dashboard-update-time">
                <span>Son güncelleme</span>
                <strong>{formatUpdateTime()}</strong>
              </div>

              <button
                type="button"
                className="dashboard-refresh"
                onClick={loadDashboard}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'spinning' : ''} />
                {loading ? 'Yükleniyor' : 'Yenile'}
              </button>
            </div>
          </header>

          {errorMessage && (
            <div className="dashboard-error">
              <FiXCircle />

              <div>
                <strong>Veriler alınamadı</strong>
                <span>{errorMessage}</span>
              </div>

              <button type="button" onClick={loadDashboard}>
                Tekrar Dene
              </button>
            </div>
          )}

          <section className="dashboard-stat-grid">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon green">
                <FiUsers />
              </div>

              <div>
                <span>Toplam Katılım</span>

                <strong>
                  {loading
                    ? '—'
                    : dashboardData.totalResults.toLocaleString('tr-TR')}
                </strong>

                <small>
                  {dashboardData.uniqueParticipants} farklı katılımcı
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon blue">
                <FiCheckCircle />
              </div>

              <div>
                <span>Başarı Oranı</span>
                <strong>{loading ? '—' : `%${dashboardData.successRate}`}</strong>
                <small>{dashboardData.passedResults} başarılı sonuç</small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon purple">
                <FiTrendingUp />
              </div>

              <div>
                <span>Ortalama Puan</span>
                <strong>{loading ? '—' : dashboardData.averageScore}</strong>
                <small>100 puan üzerinden</small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon orange">
                <FiClock />
              </div>

              <div>
                <span>Ortalama Süre</span>

                <strong>
                  {loading
                    ? '—'
                    : formatDuration(dashboardData.averageDuration)}
                </strong>

                <small>
                  {dashboardData.uniqueStores} mağazadan katılım
                </small>
              </div>
            </article>
          </section>

          <section className="dashboard-top-grid">
            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span>Performans Özeti</span>
                  <h2>Genel başarı durumu</h2>
                </div>

                <div className="dashboard-panel-icon">
                  <FiActivity />
                </div>
              </div>

              <div className="dashboard-performance">
                <div
                  className="dashboard-circle"
                  style={{
                    '--progress': `${dashboardData.successRate * 3.6}deg`,
                  }}
                >
                  <div>
                    <strong>
                      {loading ? '—' : `%${dashboardData.successRate}`}
                    </strong>

                    <span>Başarı</span>
                  </div>
                </div>

                <div className="dashboard-performance-list">
                  <div>
                    <span className="dot success" />

                    <div>
                      <strong>{dashboardData.passedResults}</strong>
                      <span>Başarılı</span>
                    </div>
                  </div>

                  <div>
                    <span className="dot danger" />

                    <div>
                      <strong>{dashboardData.failedResults}</strong>
                      <span>Başarısız</span>
                    </div>
                  </div>

                  <div>
                    <span className="dot average" />

                    <div>
                      <strong>{dashboardData.averageScore}</strong>
                      <span>Ortalama puan</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span>Kategori Analizi</span>
                  <h2>Kategori performansları</h2>
                </div>

                <button
                  type="button"
                  className="dashboard-link-button"
                  onClick={() => navigate('/yonetim/sonuclar')}
                >
                  Tümünü Gör
                  <FiArrowRight />
                </button>
              </div>

              <div className="dashboard-category-list">
                {loading ? (
                  <LoadingRows count={4} />
                ) : dashboardData.categories.length === 0 ? (
                  <EmptyState
                    icon={<FiBarChart2 />}
                    title="Kategori verisi bulunamadı"
                    description="Sonuçlar kaydedildikçe kategori analizi burada gösterilecek."
                  />
                ) : (
                  dashboardData.categories
                    .slice(0, 4)
                    .map((category) => (
                      <div
                        className="dashboard-category-row"
                        key={category.name}
                      >
                        <div className="dashboard-category-title">
                          <div>
                            <strong>{category.name}</strong>
                            <span>{category.count} katılım</span>
                          </div>

                          <strong>{category.averageScore}</strong>
                        </div>

                        <div className="dashboard-progress">
                          <span
                            style={{
                              width: `${Math.min(
                                category.averageScore,
                                100,
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="dashboard-category-footer">
                          <span>Başarı oranı</span>
                          <strong>%{category.successRate}</strong>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </article>
          </section>

          <section className="dashboard-bottom-grid">
            <article className="dashboard-panel dashboard-results-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span>Güncel Hareketler</span>
                  <h2>Son sınav sonuçları</h2>
                </div>

                <button
                  type="button"
                  className="dashboard-link-button"
                  onClick={() => navigate('/yonetim/sonuclar')}
                >
                  Tüm Sonuçlar
                  <FiArrowRight />
                </button>
              </div>

              {loading ? (
                <LoadingRows count={5} />
              ) : dashboardData.recentResults.length === 0 ? (
                <EmptyState
                  icon={<FiFileText />}
                  title="Henüz sınav sonucu yok"
                  description="Tamamlanan sınavlar bu alanda listelenecek."
                />
              ) : (
                <div className="dashboard-table-scroll">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Katılımcı</th>
                        <th>Mağaza</th>
                        <th>Kategori</th>
                        <th>Puan</th>
                        <th>Tarih</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dashboardData.recentResults.map((result) => {
                        const passed =
                          Number(result.score || 0) >= PASSING_SCORE

                        return (
                          <tr key={result.id}>
                            <td>
                              <div className="dashboard-user">
                                <span>{getInitials(result.fullName)}</span>

                                <div>
                                  <strong>
                                    {result.fullName || 'İsimsiz Katılımcı'}
                                  </strong>

                                  <small>
                                    {formatDuration(result.duration)}
                                  </small>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="dashboard-store">
                                <strong>{result.storeCode || '-'}</strong>
                                <span>{result.storeName || '-'}</span>
                              </div>
                            </td>

                            <td>{result.categoryName || '-'}</td>

                            <td>
                              <span
                                className={`dashboard-score ${
                                  passed ? 'passed' : 'failed'
                                }`}
                              >
                                {Number(result.score || 0)}
                              </span>
                            </td>

                            <td>{formatDate(result.completedAt)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span>Sıralama</span>
                  <h2>Öne çıkan mağazalar</h2>
                </div>

                <button
                  type="button"
                  className="dashboard-icon-button"
                  onClick={() => navigate('/yonetim/siralama')}
                  aria-label="Mağaza sıralamasını aç"
                >
                  <FiArrowRight />
                </button>
              </div>

              <div className="dashboard-ranking-list">
                {loading ? (
                  <LoadingRows count={5} />
                ) : dashboardData.topStores.length === 0 ? (
                  <EmptyState
                    icon={<FiAward />}
                    title="Sıralama verisi yok"
                    description="Yeterli sonuç oluştuğunda sıralama burada gösterilecek."
                  />
                ) : (
                  dashboardData.topStores.map((store, index) => (
                    <button
                      type="button"
                      className="dashboard-ranking-row"
                      key={`${store.code}-${store.name}`}
                      onClick={() => navigate('/yonetim/siralama')}
                    >
                      <span
                        className={`dashboard-rank rank-${index + 1}`}
                      >
                        {index + 1}
                      </span>

                      <div>
                        <strong>{store.name}</strong>

                        <span>
                          {store.code ? `${store.code} · ` : ''}
                          {store.count} katılım
                        </span>
                      </div>

                      <div>
                        <strong>{store.averageScore}</strong>
                        <span>%{store.successRate} başarı</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </article>
          </section>
        </section>
      </main>
    </>
  )
}

const styles = `
  :root {
    --dashboard-primary: #00856a;
    --dashboard-primary-dark: #006b56;
    --dashboard-primary-light: #e7f6f2;
    --dashboard-background: #f4f7f6;
    --dashboard-surface: #ffffff;
    --dashboard-text: #17211e;
    --dashboard-muted: #697773;
    --dashboard-border: #e2e9e6;
    --dashboard-success: #16865f;
    --dashboard-danger: #d34c5a;
    --dashboard-purple: #7258c7;
    --dashboard-orange: #d49322;
    --dashboard-shadow: 0 14px 38px rgba(26, 55, 47, 0.07);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: var(--dashboard-background);
  }

  button {
    font: inherit;
  }

  .dashboard-page {
    min-height: 100vh;
    display: flex;
    background:
      radial-gradient(
        circle at 100% 0%,
        rgba(0, 133, 106, 0.08),
        transparent 32rem
      ),
      var(--dashboard-background);
    color: var(--dashboard-text);
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .dashboard-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 20;
    width: 260px;
    display: flex;
    flex-direction: column;
    padding: 26px 18px 20px;
    background: #ffffff;
    border-right: 1px solid var(--dashboard-border);
  }

  .dashboard-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 10px 28px;
  }

  .dashboard-logo {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 14px;
    background: linear-gradient(
      145deg,
      var(--dashboard-primary),
      var(--dashboard-primary-dark)
    );
    color: #ffffff;
    font-size: 15px;
    font-weight: 800;
    box-shadow: 0 10px 22px rgba(0, 133, 106, 0.22);
  }

  .dashboard-brand > div:last-child {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .dashboard-brand strong {
    font-size: 16px;
  }

  .dashboard-brand span {
    color: var(--dashboard-muted);
    font-size: 12px;
  }

  .dashboard-navigation {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .dashboard-navigation button,
  .dashboard-logout {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 0 14px;
    border: 0;
    border-radius: 13px;
    background: transparent;
    color: #596762;
    font-size: 14px;
    font-weight: 650;
    text-align: left;
    cursor: pointer;
    transition:
      background 180ms ease,
      color 180ms ease,
      transform 180ms ease;
  }

  .dashboard-navigation button:hover,
  .dashboard-logout:hover {
    background: #f0f6f4;
    color: var(--dashboard-primary-dark);
    transform: translateX(2px);
  }

  .dashboard-navigation button.active {
    background: var(--dashboard-primary-light);
    color: var(--dashboard-primary-dark);
  }

  .dashboard-navigation svg,
  .dashboard-logout svg {
    flex-shrink: 0;
    font-size: 19px;
  }

  .dashboard-logout {
    margin-top: auto;
    color: #8e555b;
  }

  .dashboard-logout:hover {
    background: #fff1f2;
    color: #b53c49;
  }

  .dashboard-content {
    width: calc(100% - 260px);
    margin-left: 260px;
    padding: 34px;
  }

  .dashboard-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
  }

  .dashboard-eyebrow,
  .dashboard-panel-header > div:first-child > span {
    display: block;
    margin-bottom: 6px;
    color: var(--dashboard-primary);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.11em;
    text-transform: uppercase;
  }

  .dashboard-header h1 {
    margin: 0;
    font-size: clamp(28px, 3vw, 36px);
    line-height: 1.15;
    letter-spacing: -0.035em;
  }

  .dashboard-header p {
    margin: 10px 0 0;
    color: var(--dashboard-muted);
    font-size: 14px;
  }

  .dashboard-header-actions {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .dashboard-update-time {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
  }

  .dashboard-update-time span {
    color: var(--dashboard-muted);
    font-size: 11px;
  }

  .dashboard-update-time strong {
    font-size: 13px;
  }

  .dashboard-refresh {
    height: 44px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 0 17px;
    border: 1px solid #cfe1dc;
    border-radius: 13px;
    background: #ffffff;
    color: var(--dashboard-primary-dark);
    font-size: 13px;
    font-weight: 750;
    cursor: pointer;
  }

  .dashboard-refresh:hover:not(:disabled) {
    background: var(--dashboard-primary-light);
  }

  .dashboard-refresh:disabled {
    cursor: wait;
    opacity: 0.7;
  }

  .spinning {
    animation: dashboard-spin 900ms linear infinite;
  }

  @keyframes dashboard-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .dashboard-error {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
    padding: 16px 18px;
    border: 1px solid #f0c5ca;
    border-radius: 15px;
    background: #fff5f6;
    color: #b53c49;
  }

  .dashboard-error > svg {
    flex-shrink: 0;
    font-size: 22px;
  }

  .dashboard-error > div {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
  }

  .dashboard-error strong {
    color: #a73440;
  }

  .dashboard-error span {
    color: #87575c;
    font-size: 13px;
  }

  .dashboard-error button {
    border: 0;
    border-radius: 10px;
    background: #b53c49;
    color: #ffffff;
    padding: 9px 13px;
    cursor: pointer;
  }

  .dashboard-stat-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 20px;
  }

  .dashboard-stat-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    border: 1px solid var(--dashboard-border);
    border-radius: 19px;
    background: #ffffff;
    box-shadow: var(--dashboard-shadow);
  }

  .dashboard-stat-icon {
    width: 50px;
    height: 50px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 15px;
    font-size: 21px;
  }

  .dashboard-stat-icon.green {
    background: #e6f5f1;
    color: var(--dashboard-primary);
  }

  .dashboard-stat-icon.blue {
    background: #e9f2fb;
    color: #3974b8;
  }

  .dashboard-stat-icon.purple {
    background: #f0edfb;
    color: var(--dashboard-purple);
  }

  .dashboard-stat-icon.orange {
    background: #fff4df;
    color: var(--dashboard-orange);
  }

  .dashboard-stat-card > div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .dashboard-stat-card span {
    color: var(--dashboard-muted);
    font-size: 12px;
  }

  .dashboard-stat-card strong {
    margin-top: 3px;
    font-size: 26px;
  }

  .dashboard-stat-card small {
    margin-top: 5px;
    color: #8a9692;
    font-size: 10px;
  }

  .dashboard-top-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .dashboard-bottom-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.65fr);
    gap: 20px;
  }

  .dashboard-panel {
    min-width: 0;
    padding: 22px;
    border: 1px solid var(--dashboard-border);
    border-radius: 20px;
    background: #ffffff;
    box-shadow: var(--dashboard-shadow);
  }

  .dashboard-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 20px;
  }

  .dashboard-panel-header h2 {
    margin: 0;
    font-size: 17px;
  }

  .dashboard-panel-icon {
    width: 39px;
    height: 39px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: var(--dashboard-primary-light);
    color: var(--dashboard-primary);
  }

  .dashboard-link-button,
  .dashboard-icon-button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 0;
    background: transparent;
    color: var(--dashboard-primary);
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
  }

  .dashboard-icon-button {
    width: 36px;
    height: 36px;
    justify-content: center;
    border: 1px solid var(--dashboard-border);
    border-radius: 11px;
  }

  .dashboard-performance {
    min-height: 215px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 56px;
  }

  .dashboard-circle {
    --progress: 0deg;
    position: relative;
    width: 154px;
    height: 154px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 50%;
    background: conic-gradient(
      var(--dashboard-primary) var(--progress),
      #e8efec 0deg
    );
  }

  .dashboard-circle::before {
    position: absolute;
    inset: 12px;
    border-radius: 50%;
    background: #ffffff;
    content: "";
  }

  .dashboard-circle > div {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dashboard-circle strong {
    font-size: 30px;
  }

  .dashboard-circle span {
    color: var(--dashboard-muted);
    font-size: 11px;
  }

  .dashboard-performance-list {
    display: flex;
    flex-direction: column;
    gap: 19px;
  }

  .dashboard-performance-list > div {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .dashboard-performance-list > div > div {
    display: flex;
    flex-direction: column;
  }

  .dashboard-performance-list span {
    color: var(--dashboard-muted);
    font-size: 11px;
  }

  .dot {
    width: 10px;
    height: 10px;
    flex-shrink: 0;
    border-radius: 50%;
  }

  .dot.success {
    background: var(--dashboard-success);
  }

  .dot.danger {
    background: var(--dashboard-danger);
  }

  .dot.average {
    background: var(--dashboard-purple);
  }

  .dashboard-category-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .dashboard-category-row {
    padding-bottom: 15px;
    border-bottom: 1px solid #edf1ef;
  }

  .dashboard-category-row:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  .dashboard-category-title,
  .dashboard-category-footer {
    display: flex;
    justify-content: space-between;
    gap: 14px;
  }

  .dashboard-category-title > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .dashboard-category-title span,
  .dashboard-category-footer span {
    color: var(--dashboard-muted);
    font-size: 10px;
  }

  .dashboard-progress {
    height: 7px;
    margin: 9px 0 7px;
    overflow: hidden;
    border-radius: 999px;
    background: #edf2f0;
  }

  .dashboard-progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      var(--dashboard-primary),
      #28a88e
    );
  }

  .dashboard-category-footer strong {
    color: var(--dashboard-primary-dark);
    font-size: 10px;
  }

  .dashboard-table-scroll {
    overflow-x: auto;
  }

  .dashboard-table {
    width: 100%;
    border-collapse: collapse;
    white-space: nowrap;
  }

  .dashboard-table th {
    padding: 0 12px 12px;
    border-bottom: 1px solid var(--dashboard-border);
    color: #89948f;
    font-size: 10px;
    text-align: left;
    text-transform: uppercase;
  }

  .dashboard-table td {
    padding: 14px 12px;
    border-bottom: 1px solid #edf1ef;
    color: #4c5a55;
    font-size: 12px;
  }

  .dashboard-user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .dashboard-user > span {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: var(--dashboard-primary-light);
    color: var(--dashboard-primary-dark);
    font-size: 10px;
    font-weight: 800;
  }

  .dashboard-user > div,
  .dashboard-store {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dashboard-user small,
  .dashboard-store span {
    color: #8a9692;
    font-size: 9px;
  }

  .dashboard-score {
    min-width: 36px;
    display: inline-flex;
    justify-content: center;
    padding: 5px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
  }

  .dashboard-score.passed {
    background: #e8f6ef;
    color: #137c58;
  }

  .dashboard-score.failed {
    background: #fff0f1;
    color: #c1414e;
  }

  .dashboard-ranking-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .dashboard-ranking-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px;
    border: 0;
    border-radius: 13px;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .dashboard-ranking-row:hover {
    background: #f4f9f7;
  }

  .dashboard-rank {
    width: 31px;
    height: 31px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 10px;
    background: #eef3f1;
    font-size: 11px;
    font-weight: 800;
  }

  .dashboard-rank.rank-1 {
    background: #fff2cf;
    color: #a56f0c;
  }

  .dashboard-rank.rank-2 {
    background: #edf0f3;
    color: #66717b;
  }

  .dashboard-rank.rank-3 {
    background: #f8e9dd;
    color: #9a6038;
  }

  .dashboard-ranking-row > div:nth-child(2) {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .dashboard-ranking-row > div:last-child {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .dashboard-ranking-row div span {
    color: #8b9692;
    font-size: 9px;
  }

  .dashboard-empty-state {
    min-height: 185px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--dashboard-muted);
    text-align: center;
  }

  .dashboard-empty-state > div {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    margin-bottom: 12px;
    border-radius: 15px;
    background: var(--dashboard-primary-light);
    color: var(--dashboard-primary);
    font-size: 21px;
  }

  .dashboard-empty-state strong {
    margin-bottom: 5px;
    color: #34423d;
    font-size: 13px;
  }

  .dashboard-empty-state span {
    max-width: 300px;
    font-size: 11px;
    line-height: 1.55;
  }

  .dashboard-loading-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .dashboard-loading-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
  }

  .dashboard-loading-row > span {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    border-radius: 12px;
    background: #edf2f0;
    animation: dashboard-pulse 1.3s ease-in-out infinite;
  }

  .dashboard-loading-row > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .dashboard-loading-row > div span {
    height: 9px;
    border-radius: 999px;
    background: #edf2f0;
    animation: dashboard-pulse 1.3s ease-in-out infinite;
  }

  .dashboard-loading-row > div span:first-child {
    width: 72%;
  }

  .dashboard-loading-row > div span:last-child {
    width: 44%;
  }

  @keyframes dashboard-pulse {
    0%,
    100% {
      opacity: 0.55;
    }

    50% {
      opacity: 1;
    }
  }

  @media (max-width: 1180px) {
    .dashboard-stat-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dashboard-bottom-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 900px) {
    .dashboard-sidebar {
      position: sticky;
      top: 0;
      width: 100%;
      height: auto;
      flex-direction: row;
      align-items: center;
      padding: 12px 16px;
      border-right: 0;
      border-bottom: 1px solid var(--dashboard-border);
    }

    .dashboard-page {
      display: block;
    }

    .dashboard-brand {
      padding: 0;
    }

    .dashboard-brand > div:last-child {
      display: none;
    }

    .dashboard-navigation {
      flex: 1;
      flex-direction: row;
      justify-content: flex-end;
    }

    .dashboard-navigation button {
      width: 44px;
      min-height: 42px;
      justify-content: center;
      padding: 0;
    }

    .dashboard-navigation button span,
    .dashboard-logout span {
      display: none;
    }

    .dashboard-logout {
      width: 44px;
      min-height: 42px;
      justify-content: center;
      margin: 0;
      padding: 0;
    }

    .dashboard-content {
      width: 100%;
      margin-left: 0;
      padding: 26px 20px;
    }

    .dashboard-top-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .dashboard-content {
      padding: 22px 14px 30px;
    }

    .dashboard-header {
      flex-direction: column;
    }

    .dashboard-header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .dashboard-stat-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .dashboard-panel {
      padding: 18px;
    }

    .dashboard-performance {
      flex-direction: column;
      gap: 28px;
    }

    .dashboard-performance-list {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .dashboard-performance-list > div {
      flex-direction: column;
      align-items: flex-start;
      padding: 10px;
      border-radius: 11px;
      background: #f7faf9;
    }

    .dashboard-table {
      min-width: 720px;
    }

    .dashboard-error {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .dashboard-error button {
      width: 100%;
    }
  }
`

export default DashboardPage
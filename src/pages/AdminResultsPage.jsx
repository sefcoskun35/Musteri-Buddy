import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi'
import AdminSidebar from '../components/AdminSidebar'
import {
  getAllResults,
  reopenExam,
} from '../services/adminResultService'
import '../styles/admin-dashboard.css'
import '../styles/admin-results.css'

const PASSING_SCORE = 70

const getResultDate = (value) => {
  if (!value) {
    return null
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }

  if (typeof value?.seconds === 'number') {
    return new Date(value.seconds * 1000)
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (value) => {
  const date = getResultDate(value)

  if (!date) {
    return '-'
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function AdminResultsPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const [searchText, setSearchText] = useState('')
  const [storeFilter, setStoreFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [message, setMessage] = useState('')

  const loadResults = async () => {
    try {
      setLoading(true)
      setMessage('')

      const data = await getAllResults()

      setResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Sonuçlar yüklenemedi:', error)
      setMessage('Sonuçlar yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResults()
  }, [])

  const stores = useMemo(
    () =>
      [
        ...new Set(
          results
            .map((item) => item.storeCode)
            .filter(Boolean),
        ),
      ].sort((firstStore, secondStore) =>
        String(firstStore).localeCompare(
          String(secondStore),
          'tr',
        ),
      ),
    [results],
  )

  const categories = useMemo(
    () =>
      [
        ...new Set(
          results
            .map((item) => item.categoryName)
            .filter(Boolean),
        ),
      ].sort((firstCategory, secondCategory) =>
        String(firstCategory).localeCompare(
          String(secondCategory),
          'tr',
        ),
      ),
    [results],
  )

  const filteredResults = useMemo(() => {
    const normalizedSearch = searchText
      .trim()
      .toLocaleLowerCase('tr-TR')

    return results.filter((item) => {
      const searchableText = [
        item.fullName,
        item.storeCode,
        item.storeName,
        item.categoryName,
      ]
        .join(' ')
        .toLocaleLowerCase('tr-TR')

      const score = Number(item.score || 0)
      const successful = score >= PASSING_SCORE

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch)

      const matchesStore =
        !storeFilter ||
        String(item.storeCode) === String(storeFilter)

      const matchesCategory =
        !categoryFilter ||
        item.categoryName === categoryFilter

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'successful' && successful) ||
        (statusFilter === 'failed' && !successful) ||
        (statusFilter === 'reopened' &&
          item.active === false)

      return (
        matchesSearch &&
        matchesStore &&
        matchesCategory &&
        matchesStatus
      )
    })
  }, [
    results,
    searchText,
    storeFilter,
    categoryFilter,
    statusFilter,
  ])

  const statistics = useMemo(() => {
    const total = filteredResults.length

    const successful = filteredResults.filter(
      (result) =>
        Number(result.score || 0) >= PASSING_SCORE,
    ).length

    const failed = Math.max(total - successful, 0)

    const averageScore =
      total > 0
        ? Math.round(
            filteredResults.reduce(
              (totalScore, result) =>
                totalScore + Number(result.score || 0),
              0,
            ) / total,
          )
        : 0

    const successRate =
      total > 0
        ? Math.round((successful / total) * 100)
        : 0

    return {
      total,
      successful,
      failed,
      averageScore,
      successRate,
    }
  }, [filteredResults])

  const handleReopen = async (result) => {
    const approved = window.confirm(
      `${result.fullName} için ${result.categoryName} sınavı yeniden açılsın mı?`,
    )

    if (!approved) {
      return
    }

    try {
      setMessage('')

      await reopenExam(result.id)

      setMessage('Sınav hakkı yeniden açıldı.')
      await loadResults()
    } catch (error) {
      console.error('Sınav yeniden açılamadı:', error)
      setMessage('Sınav yeniden açılamadı.')
    }
  }

  const formatDuration = (seconds = 0) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds || 0),
    )

    const minutes = Math.floor(safeSeconds / 60)
    const remaining = Math.round(safeSeconds % 60)

    return `${String(minutes).padStart(2, '0')}:${String(
      remaining,
    ).padStart(2, '0')}`
  }

  const handleExportExcel = () => {
    if (!filteredResults.length || exporting) {
      return
    }

    try {
      setExporting(true)
      setMessage('')

      const excelRows = filteredResults.map(
        (result, index) => {
          const score = Number(result.score || 0)

          return {
            'Sıra No': index + 1,
            Tarih: formatDate(result.completedAt),
            'Ad Soyad': result.fullName || '',
            'Mağaza Kodu': result.storeCode || '',
            'Mağaza Adı': result.storeName || '',
            Kategori: result.categoryName || '',
            Doğru: Number(result.correctCount || 0),
            Yanlış: Number(result.wrongCount || 0),
            'Toplam Soru': Number(
              result.totalQuestions || 0,
            ),
            Puan: score,
            'Başarı Durumu':
              score >= PASSING_SCORE
                ? 'Başarılı'
                : 'Başarısız',
            Süre: formatDuration(result.duration),
            'Sınav Durumu':
              result.active === false
                ? 'Yeniden Açıldı'
                : 'Tamamlandı',
          }
        },
      )

      const worksheet =
        XLSX.utils.json_to_sheet(excelRows)

      worksheet['!cols'] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 25 },
        { wch: 14 },
        { wch: 24 },
        { wch: 22 },
        { wch: 10 },
        { wch: 10 },
        { wch: 14 },
        { wch: 10 },
        { wch: 17 },
        { wch: 12 },
        { wch: 18 },
      ]

      const workbook = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Sınav Sonuçları',
      )

      const today = new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
        .format(new Date())
        .replaceAll('.', '-')

      XLSX.writeFile(
        workbook,
        `musteri-buddy-sinav-sonuclari-${today}.xlsx`,
      )

      setMessage(
        `${filteredResults.length} sınav sonucu Excel olarak indirildi.`,
      )
    } catch (error) {
      console.error('Excel oluşturulamadı:', error)
      setMessage('Excel dosyası oluşturulamadı.')
    } finally {
      setExporting(false)
    }
  }

  const clearFilters = () => {
    setSearchText('')
    setStoreFilter('')
    setCategoryFilter('')
    setStatusFilter('')
  }

  const hasFilters =
    searchText ||
    storeFilter ||
    categoryFilter ||
    statusFilter

  return (
    <main className="admin-dashboard">
      <AdminSidebar />

      <section className="admin-content">
        <header className="admin-results-header">
          <div>
            <span>Yönetim</span>
            <h1>Sınav Sonuçları</h1>

            <p>
              Katılımcı sonuçlarını görüntüleyin, filtreleyin,
              Excel olarak indirin veya sınav hakkını yeniden açın.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="reopen-button"
              disabled={loading}
              onClick={loadResults}
            >
              <FiRefreshCw />
              Yenile
            </button>

            <button
              type="button"
              className="database-upload-button"
              disabled={
                exporting || filteredResults.length === 0
              }
              onClick={handleExportExcel}
            >
              <FiDownload />

              {exporting
                ? 'Hazırlanıyor...'
                : 'Excel İndir'}
            </button>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(4, minmax(0, 1fr))',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          <article className="selected-file">
            <div>
              <span>Toplam Sonuç</span>
              <strong>{statistics.total}</strong>
            </div>
          </article>

          <article className="selected-file">
            <div>
              <span>Başarılı</span>
              <strong>{statistics.successful}</strong>
            </div>
          </article>

          <article className="selected-file">
            <div>
              <span>Başarı Oranı</span>
              <strong>%{statistics.successRate}</strong>
            </div>
          </article>

          <article className="selected-file">
            <div>
              <span>Ortalama Puan</span>
              <strong>{statistics.averageScore}</strong>
            </div>
          </article>
        </section>

        <section className="result-filters">
          <label className="search-box">
            <FiSearch />

            <input
              type="text"
              placeholder="Ad, mağaza veya kategori ara"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />
          </label>

          <label>
            <FiFilter />

            <select
              value={storeFilter}
              onChange={(event) =>
                setStoreFilter(event.target.value)
              }
            >
              <option value="">Tüm mağazalar</option>

              {stores.map((storeCode) => (
                <option
                  key={storeCode}
                  value={storeCode}
                >
                  {storeCode}
                </option>
              ))}
            </select>
          </label>

          <label>
            <FiFilter />

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="">Tüm kategoriler</option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <FiFilter />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">Tüm durumlar</option>
              <option value="successful">Başarılı</option>
              <option value="failed">Başarısız</option>
              <option value="reopened">
                Yeniden açılanlar
              </option>
            </select>
          </label>

          {hasFilters && (
            <button
              type="button"
              className="reopen-button"
              onClick={clearFilters}
            >
              Filtreleri Temizle
            </button>
          )}
        </section>

        {message && (
          <div className="admin-result-message">
            {message}
          </div>
        )}

        <section className="admin-results-table-card">
          {loading ? (
            <div className="admin-results-empty">
              Sonuçlar yükleniyor...
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="admin-results-empty">
              Sonuç bulunamadı.
            </div>
          ) : (
            <div className="admin-results-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Ad Soyad</th>
                    <th>Mağaza</th>
                    <th>Kategori</th>
                    <th>Doğru</th>
                    <th>Yanlış</th>
                    <th>Puan</th>
                    <th>Süre</th>
                    <th>Başarı</th>
                    <th>Sınav Durumu</th>
                    <th>İşlem</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredResults.map((result) => {
                    const successful =
                      Number(result.score || 0) >=
                      PASSING_SCORE

                    return (
                      <tr key={result.id}>
                        <td>
                          {formatDate(
                            result.completedAt,
                          )}
                        </td>

                        <td>{result.fullName || '-'}</td>

                        <td>
                          {result.storeCode || '-'} -{' '}
                          {result.storeName || '-'}
                        </td>

                        <td>
                          {result.categoryName || '-'}
                        </td>

                        <td>
                          {Number(
                            result.correctCount || 0,
                          )}
                        </td>

                        <td>
                          {Number(
                            result.wrongCount || 0,
                          )}
                        </td>

                        <td>
                          <strong>
                            {Number(result.score || 0)}
                          </strong>
                        </td>

                        <td>
                          {formatDuration(
                            result.duration,
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              successful
                                ? 'status-completed'
                                : 'status-reopened'
                            }
                          >
                            {successful
                              ? 'Başarılı'
                              : 'Başarısız'}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              result.active === false
                                ? 'status-reopened'
                                : 'status-completed'
                            }
                          >
                            {result.active === false
                              ? 'Yeniden Açıldı'
                              : 'Tamamlandı'}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="reopen-button"
                            disabled={
                              result.active === false
                            }
                            onClick={() =>
                              handleReopen(result)
                            }
                          >
                            <FiRefreshCw />
                            Yeniden Aç
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default AdminResultsPage
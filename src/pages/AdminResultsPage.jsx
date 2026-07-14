import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiFilter,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi'
import {
  getAllResults,
  reopenExam,
} from '../services/adminResultService'
import '../styles/admin-results.css'

function AdminResultsPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [storeFilter, setStoreFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [message, setMessage] = useState('')

  const loadResults = async () => {
    try {
      setLoading(true)
      setResults(await getAllResults())
    } catch (error) {
      console.error(error)
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
      [...new Set(results.map((item) => item.storeCode))]
        .filter(Boolean)
        .sort(),
    [results],
  )

  const categories = useMemo(
    () =>
      [...new Set(results.map((item) => item.categoryName))]
        .filter(Boolean)
        .sort(),
    [results],
  )

  const filteredResults = useMemo(() => {
    const normalizedSearch = searchText
      .trim()
      .toLocaleLowerCase('tr-TR')

    return results.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        String(item.fullName || '')
          .toLocaleLowerCase('tr-TR')
          .includes(normalizedSearch) ||
        String(item.storeName || '')
          .toLocaleLowerCase('tr-TR')
          .includes(normalizedSearch)

      const matchesStore =
        !storeFilter || item.storeCode === storeFilter

      const matchesCategory =
        !categoryFilter || item.categoryName === categoryFilter

      return matchesSearch && matchesStore && matchesCategory
    })
  }, [results, searchText, storeFilter, categoryFilter])

  const handleReopen = async (result) => {
    const approved = window.confirm(
      `${result.fullName} için ${result.categoryName} sınavı yeniden açılsın mı?`,
    )

    if (!approved) return

    try {
      await reopenExam(result.id)
      setMessage('Sınav hakkı yeniden açıldı.')
      await loadResults()
    } catch (error) {
      console.error(error)
      setMessage('Sınav yeniden açılamadı.')
    }
  }

  const formatDuration = (seconds = 0) => {
    const minutes = Math.floor(seconds / 60)
    const remaining = seconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(
      remaining,
    ).padStart(2, '0')}`
  }

  return (
    <main className="admin-results-page">
      <header className="admin-results-header">
        <button
          type="button"
          onClick={() => navigate('/yonetim')}
        >
          <FiArrowLeft />
        </button>

        <div>
          <span>Yönetim</span>
          <h1>Sınav Sonuçları</h1>
        </div>
      </header>

      <section className="result-filters">
        <label className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Ad veya mağaza ara"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </label>

        <label>
          <FiFilter />
          <select
            value={storeFilter}
            onChange={(event) => setStoreFilter(event.target.value)}
          >
            <option value="">Tüm mağazalar</option>
            {stores.map((storeCode) => (
              <option key={storeCode} value={storeCode}>
                {storeCode}
              </option>
            ))}
          </select>
        </label>

        <label>
          <FiFilter />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">Tüm kategoriler</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </section>

      {message && <div className="admin-result-message">{message}</div>}

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
                  <th>Ad Soyad</th>
                  <th>Mağaza</th>
                  <th>Kategori</th>
                  <th>Puan</th>
                  <th>Süre</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result.id}>
                    <td>{result.fullName}</td>
                    <td>
                      {result.storeCode} - {result.storeName}
                    </td>
                    <td>{result.categoryName}</td>
                    <td>
                      <strong>{result.score}</strong>
                    </td>
                    <td>{formatDuration(result.duration)}</td>
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
                        disabled={result.active === false}
                        onClick={() => handleReopen(result)}
                      >
                        <FiRefreshCw />
                        Yeniden Aç
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default AdminResultsPage

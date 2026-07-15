import { useEffect, useMemo, useState } from 'react'
import {
  FiAward,
  FiFilter,
  FiSearch,
} from 'react-icons/fi'
import AdminSidebar from '../components/AdminSidebar'
import { getAllResults } from '../services/adminResultService'
import '../styles/admin-dashboard.css'
import '../styles/store-ranking.css'

function StoreRankingPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [storeFilter, setStoreFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllResults()

        setResults(
          Array.isArray(data)
            ? data.filter((item) => item.active !== false)
            : [],
        )
      } catch (error) {
        console.error('Sıralama verileri yüklenemedi:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const stores = useMemo(() => {
    const map = new Map()

    results.forEach((item) => {
      if (!item.storeCode) {
        return
      }

      map.set(item.storeCode, {
        code: item.storeCode,
        name: item.storeName || '',
      })
    })

    return [...map.values()].sort((firstStore, secondStore) =>
      String(firstStore.code).localeCompare(
        String(secondStore.code),
        'tr',
      ),
    )
  }, [results])

  const categories = useMemo(
    () =>
      [...new Set(results.map((item) => item.categoryName))]
        .filter(Boolean)
        .sort((firstCategory, secondCategory) =>
          String(firstCategory).localeCompare(
            String(secondCategory),
            'tr',
          ),
        ),
    [results],
  )

  const ranking = useMemo(() => {
    const normalizedSearch = searchText
      .trim()
      .toLocaleLowerCase('tr-TR')

    return results
      .filter((item) => {
        const matchesStore =
          !storeFilter || item.storeCode === storeFilter

        const matchesCategory =
          !categoryFilter ||
          item.categoryName === categoryFilter

        const matchesSearch =
          !normalizedSearch ||
          [
            item.fullName,
            item.storeCode,
            item.storeName,
            item.categoryName,
          ]
            .join(' ')
            .toLocaleLowerCase('tr-TR')
            .includes(normalizedSearch)

        return (
          matchesStore &&
          matchesCategory &&
          matchesSearch
        )
      })
      .sort((firstResult, secondResult) => {
        const scoreDifference =
          Number(secondResult.score || 0) -
          Number(firstResult.score || 0)

        if (scoreDifference !== 0) {
          return scoreDifference
        }

        const durationDifference =
          Number(firstResult.duration || 0) -
          Number(secondResult.duration || 0)

        if (durationDifference !== 0) {
          return durationDifference
        }

        const firstTime =
          firstResult.completedAt?.toMillis?.() ||
          Number(firstResult.completedAt?.seconds || 0) * 1000

        const secondTime =
          secondResult.completedAt?.toMillis?.() ||
          Number(secondResult.completedAt?.seconds || 0) * 1000

        return firstTime - secondTime
      })
  }, [
    results,
    storeFilter,
    categoryFilter,
    searchText,
  ])

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

  const getMedal = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'

    return index + 1
  }

  return (
    <main className="admin-dashboard">
      <AdminSidebar />

      <section className="admin-content">
        <header className="ranking-header">
          <div>
            <span>Yönetim</span>
            <h1>Mağaza İçi Sıralama</h1>

            <p>
              Katılımcıları puan, süre ve tamamlanma zamanına göre
              karşılaştırın.
            </p>
          </div>
        </header>

        <section className="ranking-filters">
          <label>
            <FiFilter />

            <select
              value={storeFilter}
              onChange={(event) =>
                setStoreFilter(event.target.value)
              }
            >
              <option value="">Tüm mağazalar</option>

              {stores.map((store) => (
                <option
                  key={store.code}
                  value={store.code}
                >
                  {store.code} - {store.name}
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
            <FiSearch />

            <input
              type="text"
              placeholder="Katılımcı, mağaza veya kategori ara"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />
          </label>
        </section>

        <section className="ranking-summary">
          <article>
            <span>Katılımcı</span>
            <strong>{ranking.length}</strong>
          </article>

          <article>
            <span>Mağaza</span>

            <strong>
              {storeFilter
                ? 1
                : new Set(
                    ranking.map(
                      (item) => item.storeCode,
                    ),
                  ).size}
            </strong>
          </article>

          <article>
            <span>Kategori</span>

            <strong>
              {categoryFilter
                ? 1
                : new Set(
                    ranking.map(
                      (item) => item.categoryName,
                    ),
                  ).size}
            </strong>
          </article>
        </section>

        <section className="ranking-card">
          {loading ? (
            <div className="ranking-empty">
              Yükleniyor...
            </div>
          ) : ranking.length === 0 ? (
            <div className="ranking-empty">
              Bu filtrelere uygun sonuç bulunamadı.
            </div>
          ) : (
            <div className="ranking-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Sıra</th>
                    <th>Ad Soyad</th>
                    <th>Mağaza</th>
                    <th>Kategori</th>
                    <th>Puan</th>
                    <th>Süre</th>
                  </tr>
                </thead>

                <tbody>
                  {ranking.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <span
                          className={
                            index < 3
                              ? 'ranking-medal'
                              : 'ranking-number'
                          }
                        >
                          {getMedal(index)}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {item.fullName || '-'}
                        </strong>
                      </td>

                      <td>
                        {item.storeCode || '-'} -{' '}
                        {item.storeName || '-'}
                      </td>

                      <td>
                        {item.categoryName || '-'}
                      </td>

                      <td>
                        <span className="ranking-score">
                          {Number(item.score || 0)}
                        </span>
                      </td>

                      <td>
                        {formatDuration(item.duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="ranking-note">
          <FiAward />
          Sıralama önce puana, sonra süreye, ardından tamamlanma
          zamanına göre yapılır.
        </div>
      </section>
    </main>
  )
}

export default StoreRankingPage
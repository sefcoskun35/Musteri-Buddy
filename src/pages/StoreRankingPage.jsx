import { useEffect, useMemo, useState } from 'react'
import {
  FiAward,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiUsers,
} from 'react-icons/fi'
import AdminSidebar from '../components/AdminSidebar'
import { getAllResults } from '../services/adminResultService'
import '../styles/admin-dashboard.css'
import '../styles/store-ranking.css'

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR')

const getCompletedAtTimestamp = (value) => {
  if (!value) {
    return 0
  }

  if (typeof value?.toMillis === 'function') {
    return value.toMillis()
  }

  if (typeof value?.seconds === 'number') {
    return value.seconds * 1000
  }

  const parsedTimestamp = new Date(value).getTime()

  return Number.isNaN(parsedTimestamp)
    ? 0
    : parsedTimestamp
}

const compareResults = (firstResult, secondResult) => {
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

  return (
    getCompletedAtTimestamp(firstResult.completedAt) -
    getCompletedAtTimestamp(secondResult.completedAt)
  )
}

const getStoreKey = (item) =>
  String(item.storeCode || '').trim()

const getCategoryKey = (item) =>
  String(item.categoryName || '').trim()

const getParticipantKey = (item) => {
  const userId = String(
    item.userId ||
      item.uid ||
      item.employeeId ||
      '',
  ).trim()

  if (userId) {
    return userId
  }

  return [
    normalizeText(item.fullName),
    getStoreKey(item),
    getCategoryKey(item),
  ].join('__')
}

function StoreRankingPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [storeFilter, setStoreFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchText, setSearchText] = useState('')

  const loadResults = async () => {
    try {
      setLoading(true)
      setLoadError('')

      const data = await getAllResults()

      const validResults = Array.isArray(data)
        ? data.filter(
            (item) =>
              item &&
              item.active !== false &&
              item.isDemo !== true &&
              getStoreKey(item) &&
              getCategoryKey(item),
          )
        : []

      setResults(validResults)
    } catch (error) {
      console.error(
        'Mağaza içi kategori sıralaması yüklenemedi:',
        error,
      )

      setResults([])
      setLoadError(
        'Sıralama verileri alınamadı. Lütfen tekrar deneyin.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResults()
  }, [])

  const stores = useMemo(() => {
    const storeMap = new Map()

    results.forEach((item) => {
      const storeCode = getStoreKey(item)

      if (!storeCode) {
        return
      }

      storeMap.set(storeCode, {
        code: storeCode,
        name: String(item.storeName || '').trim(),
      })
    })

    return [...storeMap.values()].sort(
      (firstStore, secondStore) =>
        firstStore.code.localeCompare(
          secondStore.code,
          'tr',
          {
            numeric: true,
          },
        ),
    )
  }, [results])

  const availableCategories = useMemo(() => {
    const sourceResults = storeFilter
      ? results.filter(
          (item) =>
            getStoreKey(item) === storeFilter,
        )
      : results

    return [
      ...new Set(
        sourceResults
          .map((item) => getCategoryKey(item))
          .filter(Boolean),
      ),
    ].sort((firstCategory, secondCategory) =>
      firstCategory.localeCompare(
        secondCategory,
        'tr',
      ),
    )
  }, [results, storeFilter])

  useEffect(() => {
    if (
      categoryFilter &&
      !availableCategories.includes(categoryFilter)
    ) {
      setCategoryFilter('')
    }
  }, [availableCategories, categoryFilter])

  const bestParticipantResults = useMemo(() => {
    const participantResultMap = new Map()

    results.forEach((item) => {
      const participantKey = getParticipantKey(item)
      const groupKey = [
        getStoreKey(item),
        getCategoryKey(item),
        participantKey,
      ].join('__')

      const currentResult =
        participantResultMap.get(groupKey)

      if (
        !currentResult ||
        compareResults(item, currentResult) < 0
      ) {
        participantResultMap.set(groupKey, item)
      }
    })

    return [...participantResultMap.values()]
  }, [results])

  const rankedResults = useMemo(() => {
    const rankingGroupMap = new Map()

    bestParticipantResults.forEach((item) => {
      const storeCode = getStoreKey(item)
      const categoryName = getCategoryKey(item)
      const groupKey = `${storeCode}__${categoryName}`

      if (!rankingGroupMap.has(groupKey)) {
        rankingGroupMap.set(groupKey, [])
      }

      rankingGroupMap.get(groupKey).push(item)
    })

    const rankedItems = []

    rankingGroupMap.forEach((groupItems) => {
      const sortedGroup = [...groupItems].sort(
        compareResults,
      )

      sortedGroup.forEach((item, index) => {
        rankedItems.push({
          ...item,
          storeRank: index + 1,
          groupParticipantCount: sortedGroup.length,
        })
      })
    })

    return rankedItems
  }, [bestParticipantResults])

  const filteredRanking = useMemo(() => {
    const normalizedSearch =
      normalizeText(searchText)

    return rankedResults
      .filter((item) => {
        const matchesStore =
          !storeFilter ||
          getStoreKey(item) === storeFilter

        const matchesCategory =
          !categoryFilter ||
          getCategoryKey(item) === categoryFilter

        const matchesSearch =
          !normalizedSearch ||
          [
            item.fullName,
            item.storeCode,
            item.storeName,
            item.categoryName,
          ]
            .map(normalizeText)
            .join(' ')
            .includes(normalizedSearch)

        return (
          matchesStore &&
          matchesCategory &&
          matchesSearch
        )
      })
      .sort((firstItem, secondItem) => {
        const storeDifference = getStoreKey(
          firstItem,
        ).localeCompare(
          getStoreKey(secondItem),
          'tr',
          {
            numeric: true,
          },
        )

        if (storeDifference !== 0) {
          return storeDifference
        }

        const categoryDifference =
          getCategoryKey(
            firstItem,
          ).localeCompare(
            getCategoryKey(secondItem),
            'tr',
          )

        if (categoryDifference !== 0) {
          return categoryDifference
        }

        return (
          Number(firstItem.storeRank || 0) -
          Number(secondItem.storeRank || 0)
        )
      })
  }, [
    rankedResults,
    storeFilter,
    categoryFilter,
    searchText,
  ])

  const selectedStore = useMemo(
    () =>
      stores.find(
        (store) => store.code === storeFilter,
      ) || null,
    [stores, storeFilter],
  )

  const selectedRanking = useMemo(() => {
    if (!storeFilter || !categoryFilter) {
      return []
    }

    return filteredRanking
      .filter(
        (item) =>
          getStoreKey(item) === storeFilter &&
          getCategoryKey(item) ===
            categoryFilter,
      )
      .sort(
        (firstItem, secondItem) =>
          Number(firstItem.storeRank || 0) -
          Number(secondItem.storeRank || 0),
      )
  }, [
    filteredRanking,
    storeFilter,
    categoryFilter,
  ])

  const groupedRankings = useMemo(() => {
    const groupMap = new Map()

    filteredRanking.forEach((item) => {
      const storeCode = getStoreKey(item)
      const categoryName = getCategoryKey(item)
      const groupKey = `${storeCode}__${categoryName}`

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          key: groupKey,
          storeCode,
          storeName: String(
            item.storeName || '',
          ).trim(),
          categoryName,
          participants: [],
        })
      }

      groupMap.get(groupKey).participants.push(item)
    })

    return [...groupMap.values()].map((group) => ({
      ...group,
      participants: group.participants.sort(
        (firstItem, secondItem) =>
          Number(firstItem.storeRank || 0) -
          Number(secondItem.storeRank || 0),
      ),
    }))
  }, [filteredRanking])

  const formatDuration = (seconds = 0) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds || 0),
    )

    const minutes = Math.floor(safeSeconds / 60)
    const remainingSeconds = Math.round(
      safeSeconds % 60,
    )

    return `${String(minutes).padStart(
      2,
      '0',
    )}:${String(remainingSeconds).padStart(
      2,
      '0',
    )}`
  }

  const getRankLabel = (rank) => {
    if (rank === 1) {
      return '🥇'
    }

    if (rank === 2) {
      return '🥈'
    }

    if (rank === 3) {
      return '🥉'
    }

    return rank
  }

  const resetFilters = () => {
    setStoreFilter('')
    setCategoryFilter('')
    setSearchText('')
  }

  const uniqueStoreCount = new Set(
    filteredRanking.map((item) =>
      getStoreKey(item),
    ),
  ).size

  const uniqueCategoryCount = new Set(
    filteredRanking.map((item) =>
      getCategoryKey(item),
    ),
  ).size

  return (
    <main className="admin-dashboard">
      <AdminSidebar />

      <section className="admin-content">
        <header className="ranking-header">
          <div>
            <span>Yönetim</span>

            <h1>Mağaza İçi Kategori Sıralaması</h1>

            <p>
              Her mağazanın kategori bazlı başarı
              sıralamasını puan ve sınav süresine
              göre görüntüleyin.
            </p>
          </div>

          <div className="ranking-header-actions">
            <button
              type="button"
              onClick={loadResults}
              disabled={loading}
              title="Verileri yenile"
            >
              <FiRefreshCw />

              <span>
                {loading
                  ? 'Yenileniyor'
                  : 'Yenile'}
              </span>
            </button>

            <button
              type="button"
              disabled
              title="Excel indirme özelliği sonraki aşamada eklenecek"
            >
              <FiDownload />

              <span>Excel İndir</span>
            </button>
          </div>
        </header>

        <section className="ranking-filters">
          <label>
            <FiFilter />

            <select
              value={storeFilter}
              onChange={(event) =>
                setStoreFilter(
                  event.target.value,
                )
              }
            >
              <option value="">
                Tüm mağazalar
              </option>

              {stores.map((store) => (
                <option
                  key={store.code}
                  value={store.code}
                >
                  {store.code}
                  {store.name
                    ? ` - ${store.name}`
                    : ''}
                </option>
              ))}
            </select>
          </label>

          <label>
            <FiFilter />

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value,
                )
              }
            >
              <option value="">
                Tüm kategoriler
              </option>

              {availableCategories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            <FiSearch />

            <input
              type="text"
              placeholder="Katılımcı, mağaza veya kategori ara"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value,
                )
              }
            />
          </label>

          <button
            type="button"
            className="ranking-reset-button"
            onClick={resetFilters}
          >
            Filtreleri Temizle
          </button>
        </section>

        <section className="ranking-summary">
          <article>
            <FiUsers />

            <span>Katılımcı</span>

            <strong>
              {filteredRanking.length}
            </strong>
          </article>

          <article>
            <span>Mağaza</span>

            <strong>{uniqueStoreCount}</strong>
          </article>

          <article>
            <span>Kategori</span>

            <strong>
              {uniqueCategoryCount}
            </strong>
          </article>
        </section>

        {storeFilter && categoryFilter && (
          <section className="ranking-card">
            <header className="ranking-selected-header">
              <div>
                <span>Seçili sıralama</span>

                <h2>
                  {selectedStore?.name ||
                    selectedStore?.code ||
                    'Mağaza'}
                  {' → '}
                  {categoryFilter}
                </h2>
              </div>

              <strong>
                {selectedRanking.length}{' '}
                katılımcı
              </strong>
            </header>

            {selectedRanking.length === 0 ? (
              <div className="ranking-empty">
                Bu mağaza ve kategori için sonuç
                bulunamadı.
              </div>
            ) : (
              <div className="ranking-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Mağaza İçi Sıra</th>
                      <th>Ad Soyad</th>
                      <th>Puan</th>
                      <th>Doğru</th>
                      <th>Yanlış</th>
                      <th>Süre</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedRanking.map(
                      (item) => (
                        <tr key={item.id}>
                          <td>
                            <span
                              className={
                                item.storeRank <= 3
                                  ? 'ranking-medal'
                                  : 'ranking-number'
                              }
                            >
                              {getRankLabel(
                                item.storeRank,
                              )}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {item.fullName ||
                                '-'}
                            </strong>
                          </td>

                          <td>
                            <span className="ranking-score">
                              {Number(
                                item.score || 0,
                              )}
                            </span>
                          </td>

                          <td>
                            {Number(
                              item.correctCount ||
                                0,
                            )}
                          </td>

                          <td>
                            {Number(
                              item.wrongCount ||
                                0,
                            )}
                          </td>

                          <td>
                            {formatDuration(
                              item.duration,
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {!storeFilter ||
        !categoryFilter ? (
          <section className="ranking-groups">
            {loading ? (
              <div className="ranking-empty">
                Sıralamalar yükleniyor...
              </div>
            ) : loadError ? (
              <div className="ranking-empty">
                {loadError}
              </div>
            ) : groupedRankings.length === 0 ? (
              <div className="ranking-empty">
                Bu filtrelere uygun sıralama
                bulunamadı.
              </div>
            ) : (
              groupedRankings.map((group) => (
                <article
                  className="ranking-card"
                  key={group.key}
                >
                  <header className="ranking-selected-header">
                    <div>
                      <span>
                        Mağaza içi kategori
                        sıralaması
                      </span>

                      <h2>
                        {group.storeCode}
                        {group.storeName
                          ? ` - ${group.storeName}`
                          : ''}
                        {' → '}
                        {group.categoryName}
                      </h2>
                    </div>

                    <strong>
                      {
                        group.participants
                          .length
                      }{' '}
                      katılımcı
                    </strong>
                  </header>

                  <div className="ranking-table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Sıra</th>
                          <th>Ad Soyad</th>
                          <th>Puan</th>
                          <th>Süre</th>
                        </tr>
                      </thead>

                      <tbody>
                        {group.participants.map(
                          (item) => (
                            <tr key={item.id}>
                              <td>
                                <span
                                  className={
                                    item.storeRank <=
                                    3
                                      ? 'ranking-medal'
                                      : 'ranking-number'
                                  }
                                >
                                  {getRankLabel(
                                    item.storeRank,
                                  )}
                                </span>
                              </td>

                              <td>
                                <strong>
                                  {item.fullName ||
                                    '-'}
                                </strong>
                              </td>

                              <td>
                                <span className="ranking-score">
                                  {Number(
                                    item.score ||
                                      0,
                                  )}
                                </span>
                              </td>

                              <td>
                                {formatDuration(
                                  item.duration,
                                )}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>
              ))
            )}
          </section>
        ) : null}

        <div className="ranking-note">
          <FiAward />

          <span>
            Her katılımcının aynı mağaza ve
            kategorideki en iyi sonucu dikkate
            alınır. Sıralama önce puana, puan
            eşitse daha kısa sınav süresine,
            süre de eşitse daha erken tamamlanma
            zamanına göre belirlenir.
          </span>
        </div>
      </section>
    </main>
  )
}

export default StoreRankingPage
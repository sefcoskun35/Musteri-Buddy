import { useEffect, useMemo, useState } from 'react'
import {
  FiAward,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiUsers,
} from 'react-icons/fi'
import * as XLSX from 'xlsx'
import AdminSidebar from '../components/AdminSidebar'
import { getAllResults } from '../services/adminResultService'
import '../styles/admin-dashboard.css'
import '../styles/store-ranking.css'

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR')

const getStoreCode = (item) =>
  String(item?.storeCode || '').trim()

const getStoreName = (item) =>
  String(item?.storeName || '').trim()

const getCategoryName = (item) =>
  String(item?.categoryName || '').trim()

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

  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

const formatCompletedAt = (value) => {
  const timestamp = getCompletedAtTimestamp(value)

  if (!timestamp) {
    return ''
  }

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

const compareResults = (firstResult, secondResult) => {
  const scoreDifference =
    Number(secondResult?.score || 0) -
    Number(firstResult?.score || 0)

  if (scoreDifference !== 0) {
    return scoreDifference
  }

  const durationDifference =
    Number(firstResult?.duration || 0) -
    Number(secondResult?.duration || 0)

  if (durationDifference !== 0) {
    return durationDifference
  }

  return (
    getCompletedAtTimestamp(firstResult?.completedAt) -
    getCompletedAtTimestamp(secondResult?.completedAt)
  )
}

const getParticipantKey = (item) => {
  const uniqueId = String(
    item?.userId ||
      item?.uid ||
      item?.employeeId ||
      '',
  ).trim()

  if (uniqueId) {
    return uniqueId
  }

  return [
    normalizeText(item?.fullName),
    getStoreCode(item),
    getCategoryName(item),
  ].join('__')
}

const sanitizeFileName = (value) =>
  String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

function StoreRankingPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [storeFilter, setStoreFilter] = useState('')
  const [categoryFilter, setCategoryFilter] =
    useState('')
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
              getStoreCode(item) &&
              getCategoryName(item),
          )
        : []

      setResults(validResults)
    } catch (error) {
      console.error(
        'Mağaza içi sıralama yüklenemedi:',
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
      const code = getStoreCode(item)

      if (!code) {
        return
      }

      storeMap.set(code, {
        code,
        name: getStoreName(item),
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

  const categories = useMemo(() => {
    const sourceResults = storeFilter
      ? results.filter(
          (item) =>
            getStoreCode(item) === storeFilter,
        )
      : results

    return [
      ...new Set(
        sourceResults
          .map((item) => getCategoryName(item))
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
      !categories.includes(categoryFilter)
    ) {
      setCategoryFilter('')
    }
  }, [categories, categoryFilter])

  const bestParticipantResults = useMemo(() => {
    const bestResultMap = new Map()

    results.forEach((item) => {
      const key = [
        getStoreCode(item),
        getCategoryName(item),
        getParticipantKey(item),
      ].join('__')

      const savedResult = bestResultMap.get(key)

      if (
        !savedResult ||
        compareResults(item, savedResult) < 0
      ) {
        bestResultMap.set(key, item)
      }
    })

    return [...bestResultMap.values()]
  }, [results])

  const rankedResults = useMemo(() => {
    const groupMap = new Map()

    bestParticipantResults.forEach((item) => {
      const groupKey = [
        getStoreCode(item),
        getCategoryName(item),
      ].join('__')

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, [])
      }

      groupMap.get(groupKey).push(item)
    })

    const ranking = []

    groupMap.forEach((groupItems) => {
      const sortedItems = [...groupItems].sort(
        compareResults,
      )

      sortedItems.forEach((item, index) => {
        ranking.push({
          ...item,
          storeRank: index + 1,
          groupParticipantCount:
            sortedItems.length,
        })
      })
    })

    return ranking
  }, [bestParticipantResults])

  const filteredRanking = useMemo(() => {
    const normalizedSearch =
      normalizeText(searchText)

    return rankedResults
      .filter((item) => {
        const matchesStore =
          !storeFilter ||
          getStoreCode(item) === storeFilter

        const matchesCategory =
          !categoryFilter ||
          getCategoryName(item) ===
            categoryFilter

        const matchesSearch =
          !normalizedSearch ||
          [
            item?.fullName,
            item?.storeCode,
            item?.storeName,
            item?.categoryName,
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
        const storeDifference =
          getStoreCode(firstItem).localeCompare(
            getStoreCode(secondItem),
            'tr',
            {
              numeric: true,
            },
          )

        if (storeDifference !== 0) {
          return storeDifference
        }

        const categoryDifference =
          getCategoryName(
            firstItem,
          ).localeCompare(
            getCategoryName(secondItem),
            'tr',
          )

        if (categoryDifference !== 0) {
          return categoryDifference
        }

        return (
          Number(firstItem?.storeRank || 0) -
          Number(secondItem?.storeRank || 0)
        )
      })
  }, [
    rankedResults,
    storeFilter,
    categoryFilter,
    searchText,
  ])

  const groupedRankings = useMemo(() => {
    const groupMap = new Map()

    filteredRanking.forEach((item) => {
      const storeCode = getStoreCode(item)
      const storeName = getStoreName(item)
      const categoryName =
        getCategoryName(item)

      const key = `${storeCode}__${categoryName}`

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          storeCode,
          storeName,
          categoryName,
          participants: [],
        })
      }

      groupMap.get(key).participants.push(item)
    })

    return [...groupMap.values()].map(
      (group) => ({
        ...group,
        participants: group.participants.sort(
          (firstItem, secondItem) =>
            Number(firstItem?.storeRank || 0) -
            Number(secondItem?.storeRank || 0),
        ),
      }),
    )
  }, [filteredRanking])

  const selectedStore = useMemo(
    () =>
      stores.find(
        (store) => store.code === storeFilter,
      ) || null,
    [stores, storeFilter],
  )

  const formatDuration = (seconds = 0) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds || 0),
    )

    const minutes = Math.floor(
      safeSeconds / 60,
    )
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
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'

    return rank
  }

  const resetFilters = () => {
    setStoreFilter('')
    setCategoryFilter('')
    setSearchText('')
  }

  const downloadWorkbook = (
    workbook,
    fileName,
  ) => {
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      compression: true,
    })

    const excelBlob = new Blob(
      [excelBuffer],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    )

    const downloadUrl =
      window.URL.createObjectURL(excelBlob)

    const downloadLink =
      document.createElement('a')

    downloadLink.href = downloadUrl
    downloadLink.download = fileName
    downloadLink.style.display = 'none'

    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    window.setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl)
    }, 1000)
  }

  const handleExcelDownload = () => {
    if (exporting) {
      return
    }

    if (!filteredRanking.length) {
      window.alert(
        'Excel dosyasına aktarılacak sıralama verisi bulunamadı.',
      )
      return
    }

    try {
      setExporting(true)

      const detailRows = filteredRanking.map(
        (item) => ({
          'Mağaza Kodu': getStoreCode(item),
          'Mağaza Adı': getStoreName(item),
          Kategori: getCategoryName(item),
          'Mağaza İçi Sıra': Number(
            item?.storeRank || 0,
          ),
          'Ad Soyad': String(
            item?.fullName || '',
          ),
          Puan: Number(item?.score || 0),
          Doğru: Number(
            item?.correctCount || 0,
          ),
          Yanlış: Number(
            item?.wrongCount || 0,
          ),
          'Toplam Soru': Number(
            item?.totalQuestions || 0,
          ),
          Süre: formatDuration(
            item?.duration,
          ),
          'Süre (Saniye)': Number(
            item?.duration || 0,
          ),
          'Tamamlanma Tarihi':
            formatCompletedAt(
              item?.completedAt,
            ),
        }),
      )

      const summaryRows = groupedRankings.map(
        (group) => ({
          'Mağaza Kodu': group.storeCode,
          'Mağaza Adı': group.storeName,
          Kategori: group.categoryName,
          'Katılımcı Sayısı':
            group.participants.length,
          Birinci:
            group.participants[0]
              ?.fullName || '',
          'Birinci Puan':
            group.participants[0]
              ? Number(
                  group.participants[0]
                    ?.score || 0,
                )
              : '',
          İkinci:
            group.participants[1]
              ?.fullName || '',
          'İkinci Puan':
            group.participants[1]
              ? Number(
                  group.participants[1]
                    ?.score || 0,
                )
              : '',
          Üçüncü:
            group.participants[2]
              ?.fullName || '',
          'Üçüncü Puan':
            group.participants[2]
              ? Number(
                  group.participants[2]
                    ?.score || 0,
                )
              : '',
        }),
      )

      const detailWorksheet =
        XLSX.utils.json_to_sheet(detailRows)

      detailWorksheet['!cols'] = [
        { wch: 14 },
        { wch: 30 },
        { wch: 25 },
        { wch: 18 },
        { wch: 30 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 14 },
        { wch: 12 },
        { wch: 17 },
        { wch: 22 },
      ]

      detailWorksheet['!autofilter'] = {
        ref: `A1:L${detailRows.length + 1}`,
      }

      detailWorksheet['!freeze'] = {
        xSplit: 0,
        ySplit: 1,
      }

      const summaryWorksheet =
        XLSX.utils.json_to_sheet(summaryRows)

      summaryWorksheet['!cols'] = [
        { wch: 14 },
        { wch: 30 },
        { wch: 25 },
        { wch: 18 },
        { wch: 30 },
        { wch: 14 },
        { wch: 30 },
        { wch: 14 },
        { wch: 30 },
        { wch: 14 },
      ]

      const workbook =
        XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(
        workbook,
        detailWorksheet,
        'Detaylı Sıralama',
      )

      XLSX.utils.book_append_sheet(
        workbook,
        summaryWorksheet,
        'Kategori Özeti',
      )

      const today = new Date()
        .toISOString()
        .slice(0, 10)

      const storeName = storeFilter
        ? sanitizeFileName(
            selectedStore?.name ||
              selectedStore?.code ||
              storeFilter,
          )
        : 'Tum-Magazalar'

      const categoryName = categoryFilter
        ? sanitizeFileName(categoryFilter)
        : 'Tum-Kategoriler'

      downloadWorkbook(
        workbook,
        `Magaza-Ici-Kategori-Siralamasi-${storeName}-${categoryName}-${today}.xlsx`,
      )
    } catch (error) {
      console.error(
        'Excel dosyası indirilemedi:',
        error,
      )

      window.alert(
        'Excel dosyası indirilemedi. Tarayıcı indirme iznini kontrol edip tekrar deneyin.',
      )
    } finally {
      window.setTimeout(() => {
        setExporting(false)
      }, 500)
    }
  }

  const uniqueStoreCount = new Set(
    filteredRanking.map((item) =>
      getStoreCode(item),
    ),
  ).size

  const uniqueCategoryCount = new Set(
    filteredRanking.map((item) =>
      getCategoryName(item),
    ),
  ).size

  return (
    <main className="admin-dashboard">
      <AdminSidebar />

      <section className="admin-content">
        <header className="ranking-header">
          <div>
            <span>Yönetim</span>

            <h1>
              Mağaza İçi Kategori Sıralaması
            </h1>

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
              onClick={handleExcelDownload}
              disabled={loading || exporting}
            >
              <FiDownload />

              <span>
                {exporting
                  ? 'Hazırlanıyor'
                  : 'Excel İndir'}
              </span>
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
                    {group.participants.length}{' '}
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
                        <th>Doğru</th>
                        <th>Yanlış</th>
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
              </article>
            ))
          )}
        </section>

        <div className="ranking-note">
          <FiAward />

          <span>
            Excel İndir butonu ekrandaki mevcut
            filtrelere göre iki sayfalı bir Excel
            dosyası oluşturur. İlk sayfada detaylı
            sıralama, ikinci sayfada mağaza ve
            kategori özeti bulunur.
          </span>
        </div>
      </section>
    </main>
  )
}

export default StoreRankingPage
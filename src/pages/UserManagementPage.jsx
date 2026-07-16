import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  FiAlertCircle,
  FiAward,
  FiCheckCircle,
  FiGrid,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiSlash,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import AdminSidebar from '../components/AdminSidebar'
import {
  blockManagedUser,
  deleteManagedUser,
  getManagedUsers,
  unblockManagedUser,
} from '../services/userManagementService'

const PAGE_SIZE = 12

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLocaleLowerCase('tr-TR')

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  try {
    const date =
      typeof value?.toDate === 'function'
        ? value.toDate()
        : typeof value?.seconds === 'number'
          ? new Date(value.seconds * 1000)
          : new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '-'
    }

    return new Intl.DateTimeFormat(
      'tr-TR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(date)
  } catch {
    return '-'
  }
}

const getInitials = (fullName = '') => {
  const parts = String(fullName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return 'MB'
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toLocaleUpperCase('tr-TR')
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toLocaleUpperCase('tr-TR')
}

function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] =
    useState(true)
  const [refreshing, setRefreshing] =
    useState(false)

  const [searchTerm, setSearchTerm] =
    useState('')
  const [storeFilter, setStoreFilter] =
    useState('all')
  const [statusFilter, setStatusFilter] =
    useState('all')
  const [currentPage, setCurrentPage] =
    useState(1)

  const [selectedUser, setSelectedUser] =
    useState(null)
  const [actionType, setActionType] =
    useState(null)
  const [blockReason, setBlockReason] =
    useState('')
  const [processing, setProcessing] =
    useState(false)

  const [
    notification,
    setNotification,
  ] = useState(null)

  const showNotification = (
    type,
    message,
  ) => {
    setNotification({
      type,
      message,
    })

    window.setTimeout(() => {
      setNotification(null)
    }, 4500)
  }

  const loadUsers = async ({
    silent = false,
  } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const data =
        await getManagedUsers()

      setUsers(
        Array.isArray(data)
          ? data
          : [],
      )
    } catch (error) {
      console.error(
        'Kullanıcılar yüklenemedi:',
        error,
      )

      showNotification(
        'error',
        'Kullanıcılar yüklenemedi.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchTerm,
    storeFilter,
    statusFilter,
  ])

  const stores = useMemo(() => {
    const storeMap = new Map()

    users.forEach((user) => {
      const key =
        user.storeCode ||
        user.storeName

      if (!key) {
        return
      }

      storeMap.set(key, {
        value: key,
        label:
          user.storeCode &&
          user.storeName
            ? `${user.storeCode} - ${user.storeName}`
            : user.storeName ||
              user.storeCode,
      })
    })

    return [
      ...storeMap.values(),
    ].sort(
      (
        firstStore,
        secondStore,
      ) =>
        firstStore.label.localeCompare(
          secondStore.label,
          'tr',
        ),
    )
  }, [users])

  const filteredUsers =
    useMemo(() => {
      const normalizedSearch =
        normalizeText(searchTerm)

      return users.filter((user) => {
        const searchableText =
          normalizeText(
            [
              user.fullName,
              user.storeCode,
              user.storeName,
              ...(user.categories ||
                []),
            ].join(' '),
          )

        const matchesSearch =
          !normalizedSearch ||
          searchableText.includes(
            normalizedSearch,
          )

        const matchesStore =
          storeFilter === 'all' ||
          user.storeCode ===
            storeFilter ||
          user.storeName ===
            storeFilter

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter ===
            'active' &&
            !user.blocked) ||
          (statusFilter ===
            'blocked' &&
            user.blocked)

        return (
          matchesSearch &&
          matchesStore &&
          matchesStatus
        )
      })
    }, [
      users,
      searchTerm,
      storeFilter,
      statusFilter,
    ])

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        PAGE_SIZE,
    ),
  )

  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedUsers =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        PAGE_SIZE

      return filteredUsers.slice(
        startIndex,
        startIndex + PAGE_SIZE,
      )
    }, [
      filteredUsers,
      currentPage,
    ])

  const statistics = useMemo(() => {
    const activeUsers =
      users.filter(
        (user) => !user.blocked,
      )

    const blockedUsers =
      users.filter(
        (user) => user.blocked,
      )

    const uniqueStores =
      new Set(
        users
          .map(
            (user) =>
              user.storeCode ||
              user.storeName,
          )
          .filter(Boolean),
      )

    const averageScore =
      users.length > 0
        ? Math.round(
            users.reduce(
              (total, user) =>
                total +
                Number(
                  user.averageScore ||
                    0,
                ),
              0,
            ) / users.length,
          )
        : 0

    return {
      total: users.length,
      active: activeUsers.length,
      blocked:
        blockedUsers.length,
      stores: uniqueStores.size,
      averageScore,
    }
  }, [users])

  const clearFilters = () => {
    setSearchTerm('')
    setStoreFilter('all')
    setStatusFilter('all')
  }

  const openActionModal = (
    user,
    type,
  ) => {
    setSelectedUser(user)
    setActionType(type)
    setBlockReason('')
  }

  const closeActionModal = () => {
    if (processing) {
      return
    }

    setSelectedUser(null)
    setActionType(null)
    setBlockReason('')
  }

  const handleUserAction =
    async () => {
      if (
        !selectedUser ||
        !actionType
      ) {
        return
      }

      try {
        setProcessing(true)

        if (
          actionType === 'block'
        ) {
          await blockManagedUser(
            selectedUser,
            blockReason,
          )

          showNotification(
            'success',
            `${selectedUser.fullName} kullanıcısı engellendi.`,
          )
        }

        if (
          actionType === 'unblock'
        ) {
          await unblockManagedUser(
            selectedUser.id,
          )

          showNotification(
            'success',
            `${selectedUser.fullName} kullanıcısı aktifleştirildi.`,
          )
        }

        if (
          actionType === 'delete'
        ) {
          await deleteManagedUser(
            selectedUser,
          )

          showNotification(
            'success',
            `${selectedUser.fullName} kullanıcısı ve tüm sonuçları silindi.`,
          )
        }

        setSelectedUser(null)
        setActionType(null)
        setBlockReason('')

        await loadUsers({
          silent: true,
        })
      } catch (error) {
        console.error(
          'Kullanıcı işlemi başarısız:',
          error,
        )

        showNotification(
          'error',
          error?.message ||
            'İşlem tamamlanamadı. Firestore yetkilerini kontrol edin.',
        )
      } finally {
        setProcessing(false)
      }
    }

  const hasFilters =
    searchTerm ||
    storeFilter !== 'all' ||
    statusFilter !== 'all'

  const isDeleteAction =
    actionType === 'delete'

  const getModalTitle = () => {
    if (
      actionType === 'delete'
    ) {
      return 'Kullanıcıyı kalıcı sil'
    }

    if (
      actionType === 'block'
    ) {
      return 'Kullanıcıyı engelle'
    }

    return 'Kullanıcıyı aktifleştir'
  }

  const getModalDescription = () => {
    if (
      actionType === 'delete'
    ) {
      return (
        <>
          <strong>
            {selectedUser?.fullName}
          </strong>{' '}
          isimli kullanıcı, tüm sınav
          sonuçları ve mağaza sıralaması
          kayıtlarıyla birlikte kalıcı
          olarak silinecek. Bu işlem
          geri alınamaz.
        </>
      )
    }

    if (
      actionType === 'block'
    ) {
      return (
        <>
          <strong>
            {selectedUser?.fullName}
          </strong>{' '}
          isimli kullanıcının sınava
          tekrar girmesi engellenecek.
        </>
      )
    }

    return (
      <>
        <strong>
          {selectedUser?.fullName}
        </strong>{' '}
        isimli kullanıcı tekrar sınava
        katılabilecek.
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>

      <main className="user-management-page">
        <AdminSidebar />

        <section className="user-content">
          <header className="user-page-header">
            <div>
              <span className="user-eyebrow">
                KATILIMCI YÖNETİMİ
              </span>

              <h1>
                Kullanıcı Yönetimi
              </h1>

              <p>
                Kullanıcıları
                görüntüleyin,
                engelleyin,
                aktifleştirin veya
                tüm sınav kayıtlarıyla
                birlikte kalıcı olarak
                silin.
              </p>
            </div>

            <button
              type="button"
              className="user-refresh-button"
              disabled={refreshing}
              onClick={() =>
                loadUsers({
                  silent: true,
                })
              }
            >
              <FiRefreshCw
                className={
                  refreshing
                    ? 'rotating'
                    : ''
                }
              />
              Yenile
            </button>
          </header>

          <section className="user-statistics-grid">
            <article>
              <span className="user-stat-icon total">
                <FiUsers />
              </span>

              <div>
                <small>
                  Toplam Kullanıcı
                </small>
                <strong>
                  {statistics.total}
                </strong>
              </div>
            </article>

            <article>
              <span className="user-stat-icon active">
                <FiUserCheck />
              </span>

              <div>
                <small>
                  Aktif Kullanıcı
                </small>
                <strong>
                  {statistics.active}
                </strong>
              </div>
            </article>

            <article>
              <span className="user-stat-icon blocked">
                <FiSlash />
              </span>

              <div>
                <small>
                  Engelli Kullanıcı
                </small>
                <strong>
                  {statistics.blocked}
                </strong>
              </div>
            </article>

            <article>
              <span className="user-stat-icon store">
                <FiGrid />
              </span>

              <div>
                <small>
                  Mağaza
                </small>
                <strong>
                  {statistics.stores}
                </strong>
              </div>
            </article>

            <article>
              <span className="user-stat-icon score">
                <FiAward />
              </span>

              <div>
                <small>
                  Genel Ortalama
                </small>
                <strong>
                  {
                    statistics.averageScore
                  }
                </strong>
              </div>
            </article>
          </section>

          <section className="user-filter-panel">
            <div className="user-search-field">
              <FiSearch />

              <input
                type="search"
                value={searchTerm}
                placeholder="İsim, mağaza veya kategori ara..."
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  aria-label="Aramayı temizle"
                  onClick={() =>
                    setSearchTerm('')
                  }
                >
                  <FiX />
                </button>
              )}
            </div>

            <select
              value={storeFilter}
              onChange={(event) =>
                setStoreFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                Tüm mağazalar
              </option>

              {stores.map(
                (store) => (
                  <option
                    key={store.value}
                    value={store.value}
                  >
                    {store.label}
                  </option>
                ),
              )}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                Tüm durumlar
              </option>
              <option value="active">
                Aktif kullanıcılar
              </option>
              <option value="blocked">
                Engelli kullanıcılar
              </option>
            </select>

            {hasFilters && (
              <button
                type="button"
                className="user-clear-filters"
                onClick={clearFilters}
              >
                <FiX />
                Temizle
              </button>
            )}
          </section>

          <section className="user-table-panel">
            <header>
              <div>
                <h2>
                  Kullanıcı Listesi
                </h2>

                <p>
                  {
                    filteredUsers.length
                  }{' '}
                  kullanıcı
                  görüntüleniyor
                </p>
              </div>
            </header>

            {loading ? (
              <div className="user-loading-state">
                <span />
                <strong>
                  Kullanıcılar
                  yükleniyor
                </strong>
              </div>
            ) : filteredUsers.length ===
              0 ? (
              <div className="user-empty-state">
                <FiUsers />
                <h3>
                  Kullanıcı bulunamadı
                </h3>
                <p>
                  Seçilen filtrelere
                  uygun kullanıcı yok.
                </p>
              </div>
            ) : (
              <>
                <div className="user-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Kullanıcı
                        </th>
                        <th>Mağaza</th>
                        <th>Sınav</th>
                        <th>
                          Ortalama
                        </th>
                        <th>
                          En İyi
                        </th>
                        <th>
                          Son Sınav
                        </th>
                        <th>Durum</th>
                        <th>
                          İşlemler
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedUsers.map(
                        (user) => (
                          <tr
                            key={user.id}
                          >
                            <td>
                              <div className="user-person-cell">
                                <span>
                                  {getInitials(
                                    user.fullName,
                                  )}
                                </span>

                                <div>
                                  <strong>
                                    {user.fullName ||
                                      '-'}
                                  </strong>

                                  <small>
                                    {(user.categories ||
                                      []).length >
                                    0
                                      ? user.categories.join(
                                          ' • ',
                                        )
                                      : 'Kategori bulunmuyor'}
                                  </small>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="user-store-cell">
                                <strong>
                                  {user.storeCode ||
                                    '-'}
                                </strong>
                                <span>
                                  {user.storeName ||
                                    '-'}
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className="user-exam-cell">
                                <strong>
                                  {
                                    user.examCount
                                  }
                                </strong>
                                <span>
                                  {
                                    user.passedExamCount
                                  }{' '}
                                  geçti ·{' '}
                                  {
                                    user.failedExamCount
                                  }{' '}
                                  kaldı
                                </span>
                              </div>
                            </td>

                            <td>
                              <span
                                className={`user-score ${
                                  user.averageScore >=
                                  70
                                    ? 'success'
                                    : 'danger'
                                }`}
                              >
                                {
                                  user.averageScore
                                }
                              </span>
                            </td>

                            <td>
                              <strong className="user-best-score">
                                {
                                  user.bestScore
                                }
                              </strong>
                            </td>

                            <td>
                              <div className="user-date-cell">
                                <strong>
                                  {formatDate(
                                    user.lastExamAt,
                                  )}
                                </strong>
                                <span>
                                  Son puan:{' '}
                                  {
                                    user.lastScore
                                  }
                                </span>
                              </div>
                            </td>

                            <td>
                              <span
                                className={`user-status ${
                                  user.blocked
                                    ? 'blocked'
                                    : 'active'
                                }`}
                              >
                                {user.blocked ? (
                                  <FiSlash />
                                ) : (
                                  <FiCheckCircle />
                                )}

                                {user.blocked
                                  ? 'Engelli'
                                  : 'Aktif'}
                              </span>
                            </td>

                            <td>
                              <div className="user-action-group">
                                {user.blocked ? (
                                  <button
                                    type="button"
                                    className="user-action-button activate"
                                    onClick={() =>
                                      openActionModal(
                                        user,
                                        'unblock',
                                      )
                                    }
                                  >
                                    <FiUserCheck />
                                    Aktifleştir
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="user-action-button block"
                                    onClick={() =>
                                      openActionModal(
                                        user,
                                        'block',
                                      )
                                    }
                                  >
                                    <FiShield />
                                    Engelle
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="user-action-button delete"
                                  onClick={() =>
                                    openActionModal(
                                      user,
                                      'delete',
                                    )
                                  }
                                >
                                  <FiTrash2 />
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                <footer className="user-pagination">
                  <p>
                    Sayfa{' '}
                    <strong>
                      {currentPage}
                    </strong>{' '}
                    / {totalPages}
                  </p>

                  <div>
                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              page - 1,
                              1,
                            ),
                        )
                      }
                    >
                      Önceki
                    </button>

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              page + 1,
                              totalPages,
                            ),
                        )
                      }
                    >
                      Sonraki
                    </button>
                  </div>
                </footer>
              </>
            )}
          </section>
        </section>
      </main>

      {selectedUser &&
        actionType && (
          <div
            className="user-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeActionModal()
              }
            }}
          >
            <section
              className={`user-action-modal ${
                isDeleteAction
                  ? 'delete-modal'
                  : ''
              }`}
              role="dialog"
              aria-modal="true"
            >
              <div
                className={`user-modal-icon ${actionType}`}
              >
                {actionType ===
                'delete' ? (
                  <FiTrash2 />
                ) : actionType ===
                  'block' ? (
                  <FiShield />
                ) : (
                  <FiUserCheck />
                )}
              </div>

              <h2>
                {getModalTitle()}
              </h2>

              <p>
                {getModalDescription()}
              </p>

              {actionType ===
                'block' && (
                <label>
                  <span>
                    Engelleme nedeni
                  </span>

                  <textarea
                    rows="3"
                    maxLength="250"
                    value={
                      blockReason
                    }
                    placeholder="İsteğe bağlı açıklama..."
                    onChange={(
                      event,
                    ) =>
                      setBlockReason(
                        event.target
                          .value,
                      )
                    }
                  />

                  <small>
                    {
                      blockReason.length
                    }
                    /250
                  </small>
                </label>
              )}

              {isDeleteAction && (
                <div className="user-delete-warning">
                  <FiAlertCircle />

                  <div>
                    <strong>
                      Kalıcı silme işlemi
                    </strong>

                    <span>
                      Kullanıcı,
                      sınav sonuçları
                      ve sıralama
                      kayıtları tamamen
                      silinecektir.
                    </span>
                  </div>
                </div>
              )}

              <div className="user-modal-actions">
                <button
                  type="button"
                  disabled={processing}
                  onClick={
                    closeActionModal
                  }
                >
                  Vazgeç
                </button>

                <button
                  type="button"
                  className={
                    actionType ===
                    'delete'
                      ? 'confirm-delete'
                      : actionType ===
                          'block'
                        ? 'confirm-block'
                        : 'confirm-activate'
                  }
                  disabled={processing}
                  onClick={
                    handleUserAction
                  }
                >
                  {processing
                    ? 'İşleniyor...'
                    : actionType ===
                        'delete'
                      ? 'Kalıcı Olarak Sil'
                      : actionType ===
                          'block'
                        ? 'Kullanıcıyı Engelle'
                        : 'Kullanıcıyı Aktifleştir'}
                </button>
              </div>
            </section>
          </div>
        )}

      {notification && (
        <div
          className={`user-notification ${notification.type}`}
        >
          {notification.type ===
          'success' ? (
            <FiCheckCircle />
          ) : (
            <FiAlertCircle />
          )}

          <span>
            {notification.message}
          </span>

          <button
            type="button"
            aria-label="Bildirimi kapat"
            onClick={() =>
              setNotification(null)
            }
          >
            <FiX />
          </button>
        </div>
      )}
    </>
  )
}

const styles = `
  :root {
    --user-primary: #00856a;
    --user-primary-dark: #006b56;
    --user-primary-soft: #e8f6f2;
    --user-background: #f4f7f6;
    --user-surface: #ffffff;
    --user-text: #17211e;
    --user-muted: #6c7975;
    --user-border: #e1e9e6;
    --user-danger: #d63f4d;
    --user-danger-dark: #ad2633;
    --user-danger-soft: #fff0f2;
    --user-warning: #d58a17;
    --user-shadow: 0 14px 38px rgba(25, 51, 44, 0.07);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  .user-management-page {
    min-height: 100vh;
    display: flex;
    background: var(--user-background);
    color: var(--user-text);
    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .user-content {
    min-width: 0;
    flex: 1;
    padding: 32px;
  }

  .user-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 24px;
  }

  .user-eyebrow {
    display: inline-block;
    margin-bottom: 8px;
    color: var(--user-primary);
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.12em;
  }

  .user-page-header h1 {
    margin: 0;
    font-size: clamp(28px, 3vw, 38px);
    letter-spacing: -0.04em;
  }

  .user-page-header p {
    max-width: 700px;
    margin: 10px 0 0;
    color: var(--user-muted);
    font-size: 14px;
    line-height: 1.65;
  }

  .user-refresh-button {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 0 17px;
    border: 1px solid #cfe1dc;
    border-radius: 12px;
    background: #ffffff;
    color: var(--user-primary-dark);
    font-size: 13px;
    font-weight: 750;
  }

  .user-refresh-button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .rotating {
    animation: user-rotate 850ms linear infinite;
  }

  @keyframes user-rotate {
    to {
      transform: rotate(360deg);
    }
  }

  .user-statistics-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .user-statistics-grid article {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 18px;
    border: 1px solid var(--user-border);
    border-radius: 17px;
    background: #ffffff;
    box-shadow: var(--user-shadow);
  }

  .user-stat-icon {
    width: 43px;
    height: 43px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 13px;
    font-size: 19px;
  }

  .user-stat-icon.total {
    background: #edf2ff;
    color: #5368c8;
  }

  .user-stat-icon.active {
    background: var(--user-primary-soft);
    color: var(--user-primary);
  }

  .user-stat-icon.blocked {
    background: var(--user-danger-soft);
    color: var(--user-danger);
  }

  .user-stat-icon.store {
    background: #f3edff;
    color: #7959c5;
  }

  .user-stat-icon.score {
    background: #fff3df;
    color: var(--user-warning);
  }

  .user-statistics-grid article div {
    display: grid;
    gap: 4px;
  }

  .user-statistics-grid small {
    color: var(--user-muted);
    font-size: 11px;
  }

  .user-statistics-grid strong {
    font-size: 23px;
  }

  .user-filter-panel {
    display: grid;
    grid-template-columns:
      minmax(260px, 1fr)
      220px
      190px
      auto;
    gap: 11px;
    padding: 15px;
    margin-bottom: 18px;
    border: 1px solid var(--user-border);
    border-radius: 17px;
    background: #ffffff;
  }

  .user-search-field {
    height: 44px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 13px;
    border: 1px solid var(--user-border);
    border-radius: 11px;
    background: #fbfcfc;
  }

  .user-search-field input {
    width: 100%;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
  }

  .user-search-field button {
    border: 0;
    background: transparent;
    color: var(--user-muted);
  }

  .user-filter-panel select {
    height: 44px;
    padding: 0 12px;
    border: 1px solid var(--user-border);
    border-radius: 11px;
    outline: 0;
    background: #fbfcfc;
  }

  .user-clear-filters {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 0;
    border-radius: 11px;
    padding: 0 15px;
    background: #edf3f1;
    color: #56635f;
    font-weight: 700;
  }

  .user-table-panel {
    overflow: hidden;
    border: 1px solid var(--user-border);
    border-radius: 19px;
    background: #ffffff;
    box-shadow: var(--user-shadow);
  }

  .user-table-panel > header {
    padding: 20px 22px;
    border-bottom: 1px solid var(--user-border);
  }

  .user-table-panel h2 {
    margin: 0;
    font-size: 18px;
  }

  .user-table-panel header p {
    margin: 5px 0 0;
    color: var(--user-muted);
    font-size: 12px;
  }

  .user-table-scroll {
    overflow-x: auto;
  }

  .user-table-panel table {
    width: 100%;
    min-width: 1180px;
    border-collapse: collapse;
  }

  .user-table-panel th,
  .user-table-panel td {
    padding: 15px 17px;
    border-bottom: 1px solid #edf1ef;
    text-align: left;
    vertical-align: middle;
  }

  .user-table-panel th {
    color: #77827f;
    background: #fafcfb;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .user-person-cell {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .user-person-cell > span {
    width: 41px;
    height: 41px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 13px;
    color: #ffffff;
    background:
      linear-gradient(
        145deg,
        var(--user-primary),
        var(--user-primary-dark)
      );
    font-size: 12px;
    font-weight: 850;
  }

  .user-person-cell div,
  .user-store-cell,
  .user-exam-cell,
  .user-date-cell {
    display: grid;
    gap: 4px;
  }

  .user-person-cell strong,
  .user-store-cell strong,
  .user-exam-cell strong,
  .user-date-cell strong {
    font-size: 13px;
  }

  .user-person-cell small,
  .user-store-cell span,
  .user-exam-cell span,
  .user-date-cell span {
    color: var(--user-muted);
    font-size: 11px;
  }

  .user-score {
    display: inline-flex;
    min-width: 43px;
    justify-content: center;
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 850;
  }

  .user-score.success {
    color: var(--user-primary-dark);
    background: var(--user-primary-soft);
  }

  .user-score.danger {
    color: var(--user-danger);
    background: var(--user-danger-soft);
  }

  .user-best-score {
    font-size: 14px;
  }

  .user-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 11px;
    font-weight: 800;
  }

  .user-status.active {
    color: var(--user-primary-dark);
    background: var(--user-primary-soft);
  }

  .user-status.blocked {
    color: var(--user-danger);
    background: var(--user-danger-soft);
  }

  .user-action-group {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .user-action-button {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 10px;
    padding: 0 11px;
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
  }

  .user-action-button.activate {
    border: 1px solid #b9ddd3;
    color: var(--user-primary-dark);
    background: var(--user-primary-soft);
  }

  .user-action-button.block {
    border: 1px solid #e4c8cb;
    color: #9a4650;
    background: #fff7f8;
  }

  .user-action-button.delete {
    border: 1px solid #f1b9bf;
    color: #ffffff;
    background:
      linear-gradient(
        135deg,
        #e45261,
        var(--user-danger-dark)
      );
    box-shadow:
      0 8px 18px
      rgba(214, 63, 77, 0.2);
  }

  .user-loading-state,
  .user-empty-state {
    min-height: 310px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 9px;
    padding: 30px;
    text-align: center;
  }

  .user-loading-state > span {
    width: 37px;
    height: 37px;
    border: 4px solid #dce8e4;
    border-top-color: var(--user-primary);
    border-radius: 50%;
    animation: user-rotate 850ms linear infinite;
  }

  .user-empty-state svg {
    font-size: 38px;
    color: #94a29e;
  }

  .user-empty-state h3,
  .user-empty-state p {
    margin: 0;
  }

  .user-empty-state p {
    color: var(--user-muted);
  }

  .user-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 15px 20px;
  }

  .user-pagination p {
    margin: 0;
    color: var(--user-muted);
    font-size: 12px;
  }

  .user-pagination div {
    display: flex;
    gap: 8px;
  }

  .user-pagination button {
    min-height: 37px;
    border: 1px solid var(--user-border);
    border-radius: 9px;
    padding: 0 13px;
    background: #ffffff;
  }

  .user-pagination button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .user-modal-backdrop {
    position: fixed;
    z-index: 9999;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(10, 24, 20, 0.56);
    backdrop-filter: blur(8px);
  }

  .user-action-modal {
    width: min(100%, 470px);
    border-radius: 24px;
    padding: 27px;
    text-align: center;
    background: #ffffff;
    box-shadow:
      0 30px 80px
      rgba(8, 28, 22, 0.27);
  }

  .user-modal-icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    margin: 0 auto 17px;
    border-radius: 20px;
    font-size: 28px;
  }

  .user-modal-icon.block {
    color: #9d414c;
    background: var(--user-danger-soft);
  }

  .user-modal-icon.unblock {
    color: var(--user-primary);
    background: var(--user-primary-soft);
  }

  .user-modal-icon.delete {
    color: #ffffff;
    background:
      linear-gradient(
        145deg,
        #ef6573,
        var(--user-danger-dark)
      );
    box-shadow:
      0 14px 30px
      rgba(214, 63, 77, 0.3);
  }

  .user-action-modal h2 {
    margin: 0;
    font-size: 23px;
  }

  .user-action-modal > p {
    margin: 12px 0 0;
    color: var(--user-muted);
    font-size: 14px;
    line-height: 1.65;
  }

  .user-action-modal label {
    display: grid;
    gap: 8px;
    margin-top: 19px;
    text-align: left;
  }

  .user-action-modal label span {
    font-size: 12px;
    font-weight: 800;
  }

  .user-action-modal textarea {
    resize: vertical;
    min-height: 90px;
    border: 1px solid var(--user-border);
    border-radius: 12px;
    padding: 12px;
    outline: 0;
  }

  .user-action-modal label small {
    color: var(--user-muted);
    text-align: right;
  }

  .user-delete-warning {
    display: flex;
    gap: 12px;
    margin-top: 19px;
    border: 1px solid #f1c1c6;
    border-radius: 14px;
    padding: 14px;
    text-align: left;
    color: #982f3a;
    background: var(--user-danger-soft);
  }

  .user-delete-warning > svg {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 21px;
  }

  .user-delete-warning div {
    display: grid;
    gap: 4px;
  }

  .user-delete-warning strong {
    font-size: 13px;
  }

  .user-delete-warning span {
    font-size: 12px;
    line-height: 1.5;
  }

  .user-modal-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 22px;
  }

  .user-modal-actions button {
    min-height: 48px;
    border: 0;
    border-radius: 13px;
    font-weight: 850;
  }

  .user-modal-actions > button:first-child {
    color: #5f6e69;
    background: #edf2f0;
  }

  .confirm-block {
    color: #ffffff;
    background: #ae4a55;
  }

  .confirm-activate {
    color: #ffffff;
    background: var(--user-primary);
  }

  .confirm-delete {
    color: #ffffff;
    background:
      linear-gradient(
        135deg,
        #e95665,
        var(--user-danger-dark)
      );
    box-shadow:
      0 12px 24px
      rgba(214, 63, 77, 0.25);
  }

  .user-notification {
    position: fixed;
    z-index: 10000;
    right: 22px;
    bottom: 22px;
    max-width: 430px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 14px;
    padding: 14px 16px;
    color: #ffffff;
    box-shadow:
      0 20px 50px
      rgba(14, 38, 31, 0.2);
  }

  .user-notification.success {
    background: var(--user-primary-dark);
  }

  .user-notification.error {
    background: var(--user-danger-dark);
  }

  .user-notification button {
    border: 0;
    margin-left: auto;
    color: #ffffff;
    background: transparent;
  }

  @media (max-width: 1200px) {
    .user-statistics-grid {
      grid-template-columns:
        repeat(3, minmax(0, 1fr));
    }

    .user-filter-panel {
      grid-template-columns:
        1fr 1fr;
    }
  }

  @media (max-width: 760px) {
    .user-content {
      padding: 18px 12px 90px;
    }

    .user-page-header {
      flex-direction: column;
    }

    .user-statistics-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .user-filter-panel {
      grid-template-columns: 1fr;
    }

    .user-refresh-button {
      width: 100%;
      justify-content: center;
    }

    .user-pagination {
      align-items: flex-start;
      flex-direction: column;
    }

    .user-modal-actions {
      grid-template-columns: 1fr;
    }

    .user-notification {
      right: 12px;
      bottom: 12px;
      left: 12px;
    }
  }

  @media (max-width: 440px) {
    .user-statistics-grid {
      grid-template-columns: 1fr;
    }
  }
`

export default UserManagementPage
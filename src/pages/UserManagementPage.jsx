import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import {
  FiAlertCircle,
  FiAward,
  FiCheckCircle,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiSlash,
  FiUploadCloud,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import {
  blockManagedUser,
  getManagedUsers,
  unblockManagedUser,
} from '../services/userManagementService'

const PAGE_SIZE = 12

const normalizeText = (value) =>
  String(value ?? '').trim().toLocaleLowerCase('tr-TR')

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

    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
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
    return parts[0].slice(0, 2).toLocaleUpperCase('tr-TR')
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase(
    'tr-TR',
  )
}

function UserManagementPage() {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [storeFilter, setStoreFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedUser, setSelectedUser] = useState(null)
  const [blockReason, setBlockReason] = useState('')
  const [actionType, setActionType] = useState(null)
  const [processing, setProcessing] = useState(false)

  const [notification, setNotification] = useState(null)

  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
    })

    window.setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  const loadUsers = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const data = await getManagedUsers()

      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error)

      showNotification(
        'error',
        'Kullanıcılar yüklenemedi. Firestore bağlantısını kontrol edin.',
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
  }, [searchTerm, storeFilter, statusFilter])

  const stores = useMemo(() => {
    const storeMap = new Map()

    users.forEach((user) => {
      const key = user.storeCode || user.storeName

      if (!key) {
        return
      }

      storeMap.set(key, {
        value: key,
        label:
          user.storeCode && user.storeName
            ? `${user.storeCode} - ${user.storeName}`
            : user.storeName || user.storeCode,
      })
    })

    return Array.from(storeMap.values()).sort((firstStore, secondStore) =>
      firstStore.label.localeCompare(secondStore.label, 'tr'),
    )
  }, [users])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm)

    return users.filter((user) => {
      const searchableText = normalizeText(
        [
          user.fullName,
          user.storeCode,
          user.storeName,
          ...(user.categories || []),
        ].join(' '),
      )

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch)

      const matchesStore =
        storeFilter === 'all' ||
        user.storeCode === storeFilter ||
        user.storeName === storeFilter

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !user.blocked) ||
        (statusFilter === 'blocked' && user.blocked)

      return matchesSearch && matchesStore && matchesStatus
    })
  }, [users, searchTerm, storeFilter, statusFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE),
  )

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE

    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredUsers, currentPage])

  const statistics = useMemo(() => {
    const activeUsers = users.filter((user) => !user.blocked)
    const blockedUsers = users.filter((user) => user.blocked)

    const uniqueStores = new Set(
      users
        .map((user) => user.storeCode || user.storeName)
        .filter(Boolean),
    )

    const averageScore =
      users.length > 0
        ? Math.round(
            users.reduce(
              (total, user) => total + Number(user.averageScore || 0),
              0,
            ) / users.length,
          )
        : 0

    return {
      total: users.length,
      active: activeUsers.length,
      blocked: blockedUsers.length,
      stores: uniqueStores.size,
      averageScore,
    }
  }, [users])

  const clearFilters = () => {
    setSearchTerm('')
    setStoreFilter('all')
    setStatusFilter('all')
  }

  const openBlockModal = (user) => {
    setSelectedUser(user)
    setBlockReason('')
    setActionType('block')
  }

  const openUnblockModal = (user) => {
    setSelectedUser(user)
    setBlockReason('')
    setActionType('unblock')
  }

  const closeActionModal = () => {
    if (processing) {
      return
    }

    setSelectedUser(null)
    setBlockReason('')
    setActionType(null)
  }

  const handleUserAction = async () => {
    if (!selectedUser || !actionType) {
      return
    }

    try {
      setProcessing(true)

      if (actionType === 'block') {
        await blockManagedUser(selectedUser, blockReason)

        showNotification(
          'success',
          `${selectedUser.fullName} kullanıcısı engellendi.`,
        )
      } else {
        await unblockManagedUser(selectedUser.id)

        showNotification(
          'success',
          `${selectedUser.fullName} kullanıcısı tekrar aktifleştirildi.`,
        )
      }

      closeActionModal()
      await loadUsers({ silent: true })
    } catch (error) {
      console.error('Kullanıcı durumu güncellenemedi:', error)

      showNotification(
        'error',
        'Kullanıcı durumu güncellenemedi. Firestore yetkilerini kontrol edin.',
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('musteriBuddyAdmin')
    sessionStorage.removeItem('musteriBuddyAdminEmail')

    navigate('/yonetici', {
      replace: true,
    })
  }

  const hasFilters =
    searchTerm || storeFilter !== 'all' || statusFilter !== 'all'

  return (
    <>
      <style>{styles}</style>

      <main className="user-management-page">
<AdminSidebar />

        <section className="user-content">
          <header className="user-page-header">
            <div>
              <span className="user-eyebrow">KATILIMCI YÖNETİMİ</span>

              <h1>Kullanıcı Yönetimi</h1>

              <p>
                Sınava katılan kullanıcıları görüntüleyin, mağaza ve başarı
                bilgilerini inceleyin, gerektiğinde girişlerini engelleyin.
              </p>
            </div>

            <button
              type="button"
              className="user-refresh-button"
              disabled={refreshing}
              onClick={() => loadUsers({ silent: true })}
            >
              <FiRefreshCw className={refreshing ? 'rotating' : ''} />
              Yenile
            </button>
          </header>

          <section className="user-statistics-grid">
            <article>
              <span className="user-stat-icon total">
                <FiUsers />
              </span>

              <div>
                <small>Toplam Kullanıcı</small>
                <strong>{statistics.total}</strong>
              </div>
            </article>

            <article>
              <span className="user-stat-icon active">
                <FiUserCheck />
              </span>

              <div>
                <small>Aktif Kullanıcı</small>
                <strong>{statistics.active}</strong>
              </div>
            </article>

            <article>
              <span className="user-stat-icon blocked">
                <FiSlash />
              </span>

              <div>
                <small>Engelli Kullanıcı</small>
                <strong>{statistics.blocked}</strong>
              </div>
            </article>

            <article>
              <span className="user-stat-icon store">
                <FiGrid />
              </span>

              <div>
                <small>Katılım Sağlayan Mağaza</small>
                <strong>{statistics.stores}</strong>
              </div>
            </article>

            <article>
              <span className="user-stat-icon score">
                <FiAward />
              </span>

              <div>
                <small>Genel Ortalama</small>
                <strong>{statistics.averageScore}</strong>
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
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  aria-label="Aramayı temizle"
                  onClick={() => setSearchTerm('')}
                >
                  <FiX />
                </button>
              )}
            </div>

            <select
              value={storeFilter}
              onChange={(event) => setStoreFilter(event.target.value)}
            >
              <option value="all">Tüm mağazalar</option>

              {stores.map((store) => (
                <option key={store.value} value={store.value}>
                  {store.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Tüm durumlar</option>
              <option value="active">Aktif kullanıcılar</option>
              <option value="blocked">Engelli kullanıcılar</option>
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
                <h2>Kullanıcı Listesi</h2>

                <p>
                  {filteredUsers.length} kullanıcı görüntüleniyor
                  {filteredUsers.length !== users.length
                    ? ` · Toplam ${users.length}`
                    : ''}
                </p>
              </div>
            </header>

            {loading ? (
              <div className="user-loading-state">
                <span />
                <strong>Kullanıcılar yükleniyor</strong>
                <p>Katılımcı ve sınav bilgileri hazırlanıyor.</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="user-empty-state">
                <FiUsers />
                <h3>Kullanıcı bulunamadı</h3>
                <p>
                  Henüz sınava katılan kullanıcı yok veya seçilen filtrelere
                  uygun sonuç bulunamadı.
                </p>

                {hasFilters && (
                  <button type="button" onClick={clearFilters}>
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="user-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Kullanıcı</th>
                        <th>Mağaza</th>
                        <th>Sınav</th>
                        <th>Ortalama</th>
                        <th>En İyi</th>
                        <th>Son Sınav</th>
                        <th>Durum</th>
                        <th aria-label="İşlemler" />
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-person-cell">
                              <span>{getInitials(user.fullName)}</span>

                              <div>
                                <strong>{user.fullName || '-'}</strong>

                                <small>
                                  {(user.categories || []).length > 0
                                    ? user.categories.join(' • ')
                                    : 'Kategori bulunmuyor'}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="user-store-cell">
                              <strong>{user.storeCode || '-'}</strong>
                              <span>{user.storeName || '-'}</span>
                            </div>
                          </td>

                          <td>
                            <div className="user-exam-cell">
                              <strong>{user.examCount}</strong>
                              <span>
                                {user.passedExamCount} geçti ·{' '}
                                {user.failedExamCount} kaldı
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`user-score ${
                                user.averageScore >= 70 ? 'success' : 'danger'
                              }`}
                            >
                              {user.averageScore}
                            </span>
                          </td>

                          <td>
                            <strong className="user-best-score">
                              {user.bestScore}
                            </strong>
                          </td>

                          <td>
                            <div className="user-date-cell">
                              <strong>{formatDate(user.lastExamAt)}</strong>
                              <span>Son puan: {user.lastScore}</span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`user-status ${
                                user.blocked ? 'blocked' : 'active'
                              }`}
                            >
                              {user.blocked ? <FiSlash /> : <FiCheckCircle />}
                              {user.blocked ? 'Engelli' : 'Aktif'}
                            </span>
                          </td>

                          <td>
                            {user.blocked ? (
                              <button
                                type="button"
                                className="user-action-button activate"
                                onClick={() => openUnblockModal(user)}
                              >
                                <FiUserCheck />
                                Aktifleştir
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="user-action-button block"
                                onClick={() => openBlockModal(user)}
                              >
                                <FiShield />
                                Engelle
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <footer className="user-pagination">
                  <p>
                    <strong>
                      {(currentPage - 1) * PAGE_SIZE + 1}-
                      {Math.min(
                        currentPage * PAGE_SIZE,
                        filteredUsers.length,
                      )}
                    </strong>{' '}
                    arası gösteriliyor · Toplam {filteredUsers.length}
                  </p>

                  <div>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(page - 1, 1))
                      }
                    >
                      Önceki
                    </button>

                    <span>
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(page + 1, totalPages),
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

      {selectedUser && actionType && (
        <div
          className="user-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeActionModal()
            }
          }}
        >
          <section
            className="user-action-modal"
            role="dialog"
            aria-modal="true"
          >
            <div
              className={`user-modal-icon ${
                actionType === 'block' ? 'block' : 'activate'
              }`}
            >
              {actionType === 'block' ? <FiShield /> : <FiUserCheck />}
            </div>

            <h2>
              {actionType === 'block'
                ? 'Kullanıcıyı engelle'
                : 'Kullanıcıyı aktifleştir'}
            </h2>

            <p>
              <strong>{selectedUser.fullName}</strong>
              {actionType === 'block'
                ? ' isimli kullanıcının sınava tekrar girmesini engellemek üzeresiniz.'
                : ' isimli kullanıcı tekrar sınava katılabilecek.'}
            </p>

            {actionType === 'block' && (
              <label>
                <span>Engelleme nedeni</span>

                <textarea
                  rows="3"
                  maxLength="250"
                  value={blockReason}
                  placeholder="İsteğe bağlı açıklama..."
                  onChange={(event) => setBlockReason(event.target.value)}
                />

                <small>{blockReason.length}/250</small>
              </label>
            )}

            <div className="user-modal-actions">
              <button
                type="button"
                disabled={processing}
                onClick={closeActionModal}
              >
                Vazgeç
              </button>

              <button
                type="button"
                className={
                  actionType === 'block' ? 'confirm-block' : 'confirm-activate'
                }
                disabled={processing}
                onClick={handleUserAction}
              >
                {processing
                  ? 'İşleniyor...'
                  : actionType === 'block'
                    ? 'Kullanıcıyı Engelle'
                    : 'Kullanıcıyı Aktifleştir'}
              </button>
            </div>
          </section>
        </div>
      )}

      {notification && (
        <div className={`user-notification ${notification.type}`}>
          {notification.type === 'success' ? (
            <FiCheckCircle />
          ) : (
            <FiAlertCircle />
          )}

          <span>{notification.message}</span>

          <button
            type="button"
            aria-label="Bildirimi kapat"
            onClick={() => setNotification(null)}
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
    --user-danger: #cb4451;
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
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .user-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 27px 18px 20px;
    background: #ffffff;
    border-right: 1px solid var(--user-border);
  }

  .user-sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 10px 28px;
  }

  .user-sidebar-brand > span {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 14px;
    background: linear-gradient(
      145deg,
      var(--user-primary),
      var(--user-primary-dark)
    );
    color: #ffffff;
    font-size: 15px;
    font-weight: 850;
    box-shadow: 0 10px 22px rgba(0, 133, 106, 0.22);
  }

  .user-sidebar-brand > div {
    display: grid;
    gap: 3px;
  }

  .user-sidebar-brand strong {
    font-size: 16px;
  }

  .user-sidebar-brand small {
    color: var(--user-muted);
    font-size: 12px;
  }

  .user-sidebar nav {
    display: grid;
    gap: 7px;
  }

  .user-sidebar nav button,
  .user-logout-button {
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
    text-align: left;
    font-size: 14px;
    font-weight: 650;
    transition:
      background 160ms ease,
      color 160ms ease,
      transform 160ms ease;
  }

  .user-sidebar nav button:hover,
  .user-logout-button:hover {
    background: #f0f6f4;
    color: var(--user-primary-dark);
    transform: translateX(2px);
  }

  .user-sidebar nav button.active {
    background: var(--user-primary-soft);
    color: var(--user-primary-dark);
  }

  .user-sidebar nav svg,
  .user-logout-button svg {
    flex-shrink: 0;
    font-size: 19px;
  }

  .user-logout-button {
    margin-top: auto;
    color: #925159;
  }

  .user-logout-button:hover {
    background: var(--user-danger-soft);
    color: var(--user-danger);
  }

  .user-content {
    min-width: 0;
    padding: 34px;
  }

  .user-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 26px;
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
    font-size: clamp(28px, 3vw, 36px);
    line-height: 1.15;
    letter-spacing: -0.035em;
  }

  .user-page-header p {
    max-width: 680px;
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

  .user-refresh-button:hover:not(:disabled) {
    background: var(--user-primary-soft);
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
    gap: 15px;
    margin-bottom: 18px;
  }

  .user-statistics-grid article {
    min-width: 0;
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
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  .user-statistics-grid small {
    overflow: hidden;
    color: var(--user-muted);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-statistics-grid strong {
    font-size: 23px;
  }

  .user-filter-panel {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 220px 190px auto;
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

  .user-search-field > svg {
    flex-shrink: 0;
    color: #7c8985;
  }

  .user-search-field input {
    width: 100%;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--user-text);
    font-size: 13px;
  }

  .user-search-field button {
    border: 0;
    background: transparent;
    color: var(--user-muted);
  }

  .user-filter-panel > select {
    height: 44px;
    padding: 0 12px;
    border: 1px solid var(--user-border);
    border-radius: 11px;
    outline: 0;
    background: #fbfcfc;
    color: var(--user-text);
    font-size: 13px;
  }

  .user-clear-filters {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 13px;
    border: 0;
    border-radius: 10px;
    background: var(--user-danger-soft);
    color: var(--user-danger);
    font-size: 12px;
    font-weight: 750;
  }

  .user-table-panel {
    overflow: hidden;
    border: 1px solid var(--user-border);
    border-radius: 18px;
    background: #ffffff;
    box-shadow: var(--user-shadow);
  }

  .user-table-panel > header {
    padding: 20px 22px;
    border-bottom: 1px solid var(--user-border);
  }

  .user-table-panel h2 {
    margin: 0;
    font-size: 17px;
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
    min-width: 1160px;
    border-collapse: collapse;
  }

  .user-table-panel th {
    padding: 13px 16px;
    background: #f8faf9;
    color: #7c8884;
    text-align: left;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .user-table-panel td {
    padding: 15px 16px;
    border-top: 1px solid #edf1ef;
    vertical-align: middle;
    font-size: 12px;
  }

  .user-person-cell {
    min-width: 220px;
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .user-person-cell > span {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 12px;
    background: var(--user-primary-soft);
    color: var(--user-primary-dark);
    font-size: 11px;
    font-weight: 850;
  }

  .user-person-cell > div,
  .user-store-cell,
  .user-exam-cell,
  .user-date-cell {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .user-person-cell strong {
    font-size: 12px;
  }

  .user-person-cell small,
  .user-store-cell span,
  .user-exam-cell span,
  .user-date-cell span {
    max-width: 230px;
    overflow: hidden;
    color: #8a9692;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-score {
    min-width: 38px;
    display: inline-flex;
    justify-content: center;
    padding: 6px 8px;
    border-radius: 9px;
    font-size: 11px;
    font-weight: 850;
  }

  .user-score.success {
    background: var(--user-primary-soft);
    color: var(--user-primary-dark);
  }

  .user-score.danger {
    background: var(--user-danger-soft);
    color: var(--user-danger);
  }

  .user-best-score {
    color: #36423e;
    font-size: 12px;
  }

  .user-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 9px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 750;
  }

  .user-status.active {
    background: var(--user-primary-soft);
    color: var(--user-primary-dark);
  }

  .user-status.blocked {
    background: var(--user-danger-soft);
    color: var(--user-danger);
  }

  .user-action-button {
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    border: 1px solid;
    border-radius: 9px;
    background: #ffffff;
    font-size: 10px;
    font-weight: 750;
  }

  .user-action-button.block {
    border-color: #efc1c6;
    color: var(--user-danger);
  }

  .user-action-button.activate {
    border-color: #bfe0d7;
    color: var(--user-primary);
  }

  .user-pagination {
    min-height: 66px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 13px 20px;
    border-top: 1px solid var(--user-border);
    background: #fcfdfd;
  }

  .user-pagination p {
    margin: 0;
    color: var(--user-muted);
    font-size: 11px;
  }

  .user-pagination > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-pagination button {
    min-height: 34px;
    padding: 0 11px;
    border: 1px solid var(--user-border);
    border-radius: 9px;
    background: #ffffff;
    font-size: 11px;
  }

  .user-pagination button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .user-pagination span {
    min-width: 62px;
    text-align: center;
    color: var(--user-muted);
    font-size: 11px;
    font-weight: 700;
  }

  .user-loading-state,
  .user-empty-state {
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 45px 20px;
    text-align: center;
  }

  .user-loading-state > span {
    width: 36px;
    height: 36px;
    margin-bottom: 16px;
    border: 3px solid #dcebe6;
    border-top-color: var(--user-primary);
    border-radius: 50%;
    animation: user-rotate 850ms linear infinite;
  }

  .user-loading-state p,
  .user-empty-state p {
    max-width: 430px;
    margin: 7px 0 0;
    color: var(--user-muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .user-empty-state > svg {
    width: 48px;
    height: 48px;
    margin-bottom: 15px;
    padding: 11px;
    border-radius: 15px;
    background: var(--user-primary-soft);
    color: var(--user-primary);
  }

  .user-empty-state h3 {
    margin: 0;
    font-size: 17px;
  }

  .user-empty-state button {
    margin-top: 17px;
    padding: 10px 14px;
    border: 0;
    border-radius: 10px;
    background: var(--user-primary);
    color: #ffffff;
    font-size: 12px;
    font-weight: 750;
  }

  .user-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
    padding: 22px;
    background: rgba(13, 25, 21, 0.58);
    backdrop-filter: blur(5px);
  }

  .user-action-modal {
    width: min(460px, 100%);
    padding: 28px;
    border-radius: 20px;
    background: #ffffff;
    text-align: center;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
  }

  .user-modal-icon {
    width: 61px;
    height: 61px;
    display: grid;
    place-items: center;
    margin: 0 auto 17px;
    border-radius: 18px;
    font-size: 26px;
  }

  .user-modal-icon.block {
    background: var(--user-danger-soft);
    color: var(--user-danger);
  }

  .user-modal-icon.activate {
    background: var(--user-primary-soft);
    color: var(--user-primary);
  }

  .user-action-modal h2 {
    margin: 0;
    font-size: 20px;
  }

  .user-action-modal > p {
    margin: 11px 0 21px;
    color: var(--user-muted);
    font-size: 13px;
    line-height: 1.65;
  }

  .user-action-modal label {
    display: grid;
    gap: 8px;
    margin-bottom: 20px;
    text-align: left;
  }

  .user-action-modal label span {
    font-size: 11px;
    font-weight: 750;
  }

  .user-action-modal textarea {
    width: 100%;
    resize: vertical;
    padding: 11px 12px;
    border: 1px solid var(--user-border);
    border-radius: 11px;
    outline: 0;
  }

  .user-action-modal label small {
    color: var(--user-muted);
    text-align: right;
    font-size: 9px;
  }

  .user-modal-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .user-modal-actions button {
    min-height: 43px;
    border: 1px solid var(--user-border);
    border-radius: 11px;
    background: #ffffff;
    font-size: 12px;
    font-weight: 750;
  }

  .user-modal-actions button.confirm-block {
    border-color: var(--user-danger);
    background: var(--user-danger);
    color: #ffffff;
  }

  .user-modal-actions button.confirm-activate {
    border-color: var(--user-primary);
    background: var(--user-primary);
    color: #ffffff;
  }

  .user-modal-actions button:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .user-notification {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 1500;
    max-width: min(390px, calc(100vw - 36px));
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 14px;
    border: 1px solid;
    border-radius: 13px;
    background: #ffffff;
    box-shadow: 0 17px 44px rgba(23, 33, 30, 0.18);
  }

  .user-notification.success {
    border-color: #b9e1d5;
    color: var(--user-primary);
  }

  .user-notification.error {
    border-color: #efc2c7;
    color: var(--user-danger);
  }

  .user-notification span {
    color: var(--user-text);
    font-size: 12px;
    font-weight: 650;
  }

  .user-notification button {
    display: grid;
    place-items: center;
    padding: 0;
    margin-left: auto;
    border: 0;
    background: transparent;
    color: var(--user-muted);
  }

  @media (max-width: 1280px) {
    .user-statistics-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .user-filter-panel {
      grid-template-columns: minmax(250px, 1fr) 200px 180px;
    }

    .user-clear-filters {
      grid-column: 1 / -1;
      justify-self: end;
    }
  }

  @media (max-width: 900px) {
    .user-management-page {
      display: block;
    }

    .user-sidebar {
      position: sticky;
      z-index: 30;
      width: 100%;
      height: auto;
      padding: 13px 16px;
    }

    .user-sidebar-brand {
      padding: 0 0 12px;
    }

    .user-sidebar nav {
      display: flex;
      overflow-x: auto;
      gap: 7px;
    }

    .user-sidebar nav button {
      width: auto;
      min-width: max-content;
      min-height: 42px;
      padding: 0 12px;
    }

    .user-logout-button {
      position: absolute;
      top: 17px;
      right: 16px;
      width: 42px;
      min-height: 42px;
      justify-content: center;
      padding: 0;
      font-size: 0;
    }

    .user-content {
      padding: 25px 18px 40px;
    }

    .user-statistics-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .user-filter-panel {
      grid-template-columns: 1fr 1fr;
    }

    .user-search-field {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    .user-page-header {
      flex-direction: column;
    }

    .user-refresh-button {
      align-self: stretch;
      justify-content: center;
    }

    .user-statistics-grid {
      grid-template-columns: 1fr;
    }

    .user-filter-panel {
      grid-template-columns: 1fr;
    }

    .user-search-field,
    .user-clear-filters {
      grid-column: auto;
      width: 100%;
    }

    .user-pagination {
      align-items: flex-start;
      flex-direction: column;
    }

    .user-pagination > div {
      width: 100%;
      justify-content: space-between;
    }

    .user-modal-backdrop {
      align-items: end;
      padding: 0;
    }

    .user-action-modal {
      width: 100%;
      border-radius: 20px 20px 0 0;
    }

    .user-notification {
      right: 18px;
      bottom: 18px;
      left: 18px;
      max-width: none;
    }
  }
`

export default UserManagementPage
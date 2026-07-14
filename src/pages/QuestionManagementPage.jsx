import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiFileText,
  FiFilter,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi'
import { db } from '../services/firebase'
import '../styles/question-management.css'

const QUESTIONS_COLLECTION = 'questions'
const PAGE_SIZE = 10

const CATEGORY_OPTIONS = [
  {
    value: 'Healthy',
    label: 'Healthy',
  },
  {
    value: 'Personal Care',
    label: 'Personal Care',
  },
  {
    value: 'Hair Care',
    label: 'Hair Care',
  },
  {
    value: 'General Merchandise',
    label: 'General Merchandise',
  },
]

const ANSWER_OPTIONS = ['A', 'B', 'C', 'D']

const emptyForm = {
  category: '',
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  explanation: '',
  active: true,
}

const normalizeText = (value) => String(value ?? '').trim()

const normalizeSearchText = (value) =>
  normalizeText(value).toLocaleLowerCase('tr-TR')

const formatDate = (value) => {
  if (!value) return '-'

  try {
    const date =
      typeof value?.toDate === 'function'
        ? value.toDate()
        : value instanceof Date
          ? value
          : new Date(value)

    if (Number.isNaN(date.getTime())) return '-'

    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return '-'
  }
}

function QuestionManagementPage() {
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

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

  const loadQuestions = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      let snapshot

      try {
        snapshot = await getDocs(
          query(
            collection(db, QUESTIONS_COLLECTION),
            orderBy('createdAt', 'desc'),
          ),
        )
      } catch {
        snapshot = await getDocs(collection(db, QUESTIONS_COLLECTION))
      }

      const loadedQuestions = snapshot.docs
        .map((questionDocument) => ({
          id: questionDocument.id,
          ...questionDocument.data(),
        }))
        .sort((firstQuestion, secondQuestion) => {
          const firstDate =
            firstQuestion.createdAt?.toMillis?.() ||
            firstQuestion.updatedAt?.toMillis?.() ||
            0

          const secondDate =
            secondQuestion.createdAt?.toMillis?.() ||
            secondQuestion.updatedAt?.toMillis?.() ||
            0

          return secondDate - firstDate
        })

      setQuestions(loadedQuestions)
    } catch (error) {
      console.error('Sorular alınamadı:', error)
      showNotification(
        'error',
        'Sorular yüklenemedi. Firestore bağlantısını kontrol edin.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter])

  const availableCategories = useMemo(() => {
    const categoryMap = new Map()

    CATEGORY_OPTIONS.forEach((category) => {
      categoryMap.set(normalizeSearchText(category.value), category.value)
    })

    questions.forEach((question) => {
      const category = normalizeText(question.category)

      if (category) {
        categoryMap.set(normalizeSearchText(category), category)
      }
    })

    return Array.from(categoryMap.values()).sort((firstCategory, secondCategory) =>
      firstCategory.localeCompare(secondCategory, 'tr'),
    )
  }, [questions])

  const filteredQuestions = useMemo(() => {
    const normalizedSearchTerm = normalizeSearchText(searchTerm)

    return questions.filter((question) => {
      const questionText = normalizeSearchText(question.question)
      const categoryText = normalizeSearchText(question.category)
      const explanationText = normalizeSearchText(question.explanation)
      const optionText = Array.isArray(question.options)
        ? normalizeSearchText(question.options.join(' '))
        : ''

      const matchesSearch =
        !normalizedSearchTerm ||
        questionText.includes(normalizedSearchTerm) ||
        categoryText.includes(normalizedSearchTerm) ||
        explanationText.includes(normalizedSearchTerm) ||
        optionText.includes(normalizedSearchTerm)

      const matchesCategory =
        categoryFilter === 'all' ||
        categoryText === normalizeSearchText(categoryFilter)

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && question.active !== false) ||
        (statusFilter === 'passive' && question.active === false)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [questions, searchTerm, categoryFilter, statusFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / PAGE_SIZE),
  )

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredQuestions.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredQuestions, currentPage])

  const statistics = useMemo(() => {
    const activeCount = questions.filter(
      (question) => question.active !== false,
    ).length

    const passiveCount = questions.length - activeCount

    const categoryCount = new Set(
      questions
        .map((question) => normalizeSearchText(question.category))
        .filter(Boolean),
    ).size

    return {
      total: questions.length,
      active: activeCount,
      passive: passiveCount,
      categories: categoryCount,
    }
  }, [questions])

  const resetForm = () => {
    setForm(emptyForm)
    setFormErrors({})
    setEditingQuestion(null)
  }

  const openCreateForm = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const openEditForm = (question) => {
    const options = Array.isArray(question.options)
      ? question.options
      : ['', '', '', '']

    setEditingQuestion(question)
    setForm({
      category: normalizeText(question.category),
      question: normalizeText(question.question),
      optionA: normalizeText(options[0]),
      optionB: normalizeText(options[1]),
      optionC: normalizeText(options[2]),
      optionD: normalizeText(options[3]),
      correctAnswer: normalizeText(question.correctAnswer).toUpperCase() || 'A',
      explanation: normalizeText(question.explanation),
      active: question.active !== false,
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const closeForm = () => {
    if (saving) return

    setIsFormOpen(false)
    resetForm()
  }

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (formErrors[name]) {
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!normalizeText(form.category)) {
      errors.category = 'Kategori seçmelisiniz.'
    }

    if (!normalizeText(form.question)) {
      errors.question = 'Soru alanı boş bırakılamaz.'
    } else if (normalizeText(form.question).length < 10) {
      errors.question = 'Soru en az 10 karakter olmalıdır.'
    }

    if (!normalizeText(form.optionA)) {
      errors.optionA = 'A seçeneği boş bırakılamaz.'
    }

    if (!normalizeText(form.optionB)) {
      errors.optionB = 'B seçeneği boş bırakılamaz.'
    }

    if (!normalizeText(form.optionC)) {
      errors.optionC = 'C seçeneği boş bırakılamaz.'
    }

    if (!normalizeText(form.optionD)) {
      errors.optionD = 'D seçeneği boş bırakılamaz.'
    }

    if (!ANSWER_OPTIONS.includes(form.correctAnswer)) {
      errors.correctAnswer = 'Geçerli bir doğru cevap seçmelisiniz.'
    }

    const normalizedQuestion = normalizeSearchText(form.question)

    const duplicateQuestion = questions.some(
      (question) =>
        question.id !== editingQuestion?.id &&
        normalizeSearchText(question.question) === normalizedQuestion,
    )

    if (normalizedQuestion && duplicateQuestion) {
      errors.question = 'Bu soru daha önce eklenmiş.'
    }

    const normalizedOptions = [
      form.optionA,
      form.optionB,
      form.optionC,
      form.optionD,
    ]
      .map(normalizeSearchText)
      .filter(Boolean)

    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      errors.options = 'Seçenekler birbirinden farklı olmalıdır.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveQuestion = async (event) => {
    event.preventDefault()

    if (!validateForm()) return

    try {
      setSaving(true)

      const questionData = {
        category: normalizeText(form.category),
        question: normalizeText(form.question),
        options: [
          normalizeText(form.optionA),
          normalizeText(form.optionB),
          normalizeText(form.optionC),
          normalizeText(form.optionD),
        ],
        correctAnswer: form.correctAnswer,
        explanation: normalizeText(form.explanation),
        active: Boolean(form.active),
        updatedAt: serverTimestamp(),
      }

      if (editingQuestion) {
        await updateDoc(
          doc(db, QUESTIONS_COLLECTION, editingQuestion.id),
          questionData,
        )

        showNotification('success', 'Soru başarıyla güncellendi.')
      } else {
        await addDoc(collection(db, QUESTIONS_COLLECTION), {
          ...questionData,
          createdAt: serverTimestamp(),
        })

        showNotification('success', 'Yeni soru başarıyla eklendi.')
      }

      closeForm()
      await loadQuestions({ silent: true })
    } catch (error) {
      console.error('Soru kaydedilemedi:', error)
      showNotification(
        'error',
        'Soru kaydedilemedi. Firestore yetkilerini kontrol edin.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (question) => {
    try {
      const newStatus = question.active === false

      setQuestions((currentQuestions) =>
        currentQuestions.map((currentQuestion) =>
          currentQuestion.id === question.id
            ? {
                ...currentQuestion,
                active: newStatus,
              }
            : currentQuestion,
        ),
      )

      await updateDoc(doc(db, QUESTIONS_COLLECTION, question.id), {
        active: newStatus,
        updatedAt: serverTimestamp(),
      })

      showNotification(
        'success',
        newStatus ? 'Soru aktif hale getirildi.' : 'Soru pasif hale getirildi.',
      )
    } catch (error) {
      console.error('Soru durumu güncellenemedi:', error)

      setQuestions((currentQuestions) =>
        currentQuestions.map((currentQuestion) =>
          currentQuestion.id === question.id
            ? {
                ...currentQuestion,
                active: question.active !== false,
              }
            : currentQuestion,
        ),
      )

      showNotification('error', 'Soru durumu güncellenemedi.')
    }
  }

  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return

    try {
      setDeleting(true)

      await deleteDoc(doc(db, QUESTIONS_COLLECTION, deleteTarget.id))

      setQuestions((currentQuestions) =>
        currentQuestions.filter(
          (question) => question.id !== deleteTarget.id,
        ),
      )

      setDeleteTarget(null)
      showNotification('success', 'Soru kalıcı olarak silindi.')
    } catch (error) {
      console.error('Soru silinemedi:', error)
      showNotification(
        'error',
        'Soru silinemedi. Firestore yetkilerini kontrol edin.',
      )
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  const hasActiveFilters =
    searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'

  const getAnswerText = (question) => {
    const answerIndex = ANSWER_OPTIONS.indexOf(
      normalizeText(question.correctAnswer).toUpperCase(),
    )

    if (answerIndex < 0 || !Array.isArray(question.options)) {
      return '-'
    }

    return question.options[answerIndex] || '-'
  }

  return (
    <>
      <main className="question-management-page">
        <aside className="question-sidebar">
          <div className="question-sidebar-brand">
            <span className="question-brand-icon">MB</span>

            <div>
              <strong>Müşteri Buddy</strong>
              <small>Yönetim Paneli</small>
            </div>
          </div>

          <nav className="question-sidebar-navigation">
            <button
  type="button"
  onClick={() => navigate('/yonetim/dashboard')}
>
  <FiGrid />
  Dashboard
</button>

<button
  type="button"
  onClick={() => navigate('/yonetim')}
>
  <FiUploadCloud />
  Excel ile Yükle
</button>

            <button
              type="button"
              className="active"
            >
              <FiHelpCircle />
              Soru Yönetimi
            </button>

            <button
              type="button"
              onClick={() => navigate('/yonetim/sonuclar')}
            >
              <FiFileText />
              Sonuçlar
            </button>

            <button
              type="button"
              onClick={() => navigate('/yonetim/siralama')}
            >
              <FiCheckCircle />
              Mağaza Sıralaması
            </button>
          </nav>

          <button
            type="button"
            className="question-logout-button"
            onClick={() => navigate('/')}
          >
            <FiLogOut />
            Çıkış
          </button>
        </aside>

        <section className="question-main-content">
          <header className="question-page-header">
            <div>
              <span className="question-page-eyebrow">SORU BANKASI</span>
              <h1>Soru Yönetimi</h1>
              <p>
                Quiz sorularını görüntüleyin, düzenleyin, aktiflik durumlarını
                yönetin veya yeni soru ekleyin.
              </p>
            </div>

            <div className="question-header-actions">
              <button
                type="button"
                className="question-refresh-button"
                disabled={refreshing}
                onClick={() => loadQuestions({ silent: true })}
              >
                <FiRefreshCw className={refreshing ? 'rotating' : ''} />
                Yenile
              </button>

              <button
                type="button"
                className="question-add-button"
                onClick={openCreateForm}
              >
                <FiPlus />
                Yeni Soru
              </button>
            </div>
          </header>

          <section className="question-statistics-grid">
            <article>
              <span className="statistic-icon statistic-total">
                <FiHelpCircle />
              </span>

              <div>
                <small>Toplam Soru</small>
                <strong>{statistics.total}</strong>
              </div>
            </article>

            <article>
              <span className="statistic-icon statistic-active">
                <FiCheckCircle />
              </span>

              <div>
                <small>Aktif Soru</small>
                <strong>{statistics.active}</strong>
              </div>
            </article>

            <article>
              <span className="statistic-icon statistic-passive">
                <FiAlertCircle />
              </span>

              <div>
                <small>Pasif Soru</small>
                <strong>{statistics.passive}</strong>
              </div>
            </article>

            <article>
              <span className="statistic-icon statistic-category">
                <FiGrid />
              </span>

              <div>
                <small>Kategori</small>
                <strong>{statistics.categories}</strong>
              </div>
            </article>
          </section>

          <section className="question-filter-panel">
            <div className="question-search-field">
              <FiSearch />

              <input
                type="search"
                value={searchTerm}
                placeholder="Soru, seçenek veya kategori ara..."
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

            <div className="question-select-field">
              <FiGrid />

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">Tüm kategoriler</option>

                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="question-select-field">
              <FiFilter />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">Tüm durumlar</option>
                <option value="active">Aktif</option>
                <option value="passive">Pasif</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="question-clear-filter"
                onClick={clearFilters}
              >
                <FiX />
                Filtreleri Temizle
              </button>
            )}
          </section>

          <section className="question-table-panel">
            <div className="question-table-heading">
              <div>
                <h2>Soru Listesi</h2>
                <p>
                  {filteredQuestions.length} soru görüntüleniyor
                  {questions.length !== filteredQuestions.length
                    ? ` · Toplam ${questions.length}`
                    : ''}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="question-loading-state">
                <span className="question-loader" />
                <strong>Sorular yükleniyor</strong>
                <p>Lütfen kısa bir süre bekleyin.</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="question-empty-state">
                <span>
                  <FiHelpCircle />
                </span>

                <h3>
                  {questions.length === 0
                    ? 'Henüz soru bulunmuyor'
                    : 'Filtrelere uygun soru bulunamadı'}
                </h3>

                <p>
                  {questions.length === 0
                    ? 'İlk sorunuzu ekleyerek soru bankasını oluşturmaya başlayın.'
                    : 'Arama metnini veya seçili filtreleri değiştirmeyi deneyin.'}
                </p>

                {questions.length === 0 ? (
                  <button type="button" onClick={openCreateForm}>
                    <FiPlus />
                    İlk Soruyu Ekle
                  </button>
                ) : (
                  <button type="button" onClick={clearFilters}>
                    <FiX />
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="question-table-scroll">
                  <table className="question-table">
                    <thead>
                      <tr>
                        <th>Soru</th>
                        <th>Kategori</th>
                        <th>Doğru Cevap</th>
                        <th>Durum</th>
                        <th>Eklenme Tarihi</th>
                        <th aria-label="İşlemler" />
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedQuestions.map((question) => (
                        <tr key={question.id}>
                          <td>
                            <div className="question-cell">
                              <strong>{question.question || '-'}</strong>

                              <span>
                                {Array.isArray(question.options)
                                  ? question.options
                                      .map(
                                        (option, index) =>
                                          `${ANSWER_OPTIONS[index]}) ${option}`,
                                      )
                                      .join('  •  ')
                                  : 'Seçenek bilgisi bulunmuyor'}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="question-category-badge">
                              {question.category || 'Kategorisiz'}
                            </span>
                          </td>

                          <td>
                            <div className="question-answer-cell">
                              <span>
                                {normalizeText(
                                  question.correctAnswer,
                                ).toUpperCase() || '-'}
                              </span>

                              <small>{getAnswerText(question)}</small>
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`question-status-toggle ${
                                question.active === false ? 'passive' : 'active'
                              }`}
                              onClick={() => handleToggleStatus(question)}
                            >
                              <span />

                              {question.active === false ? 'Pasif' : 'Aktif'}
                            </button>
                          </td>

                          <td>
                            <span className="question-date">
                              {formatDate(
                                question.createdAt || question.updatedAt,
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="question-row-actions">
                              <button
                                type="button"
                                className="edit"
                                title="Soruyu düzenle"
                                aria-label="Soruyu düzenle"
                                onClick={() => openEditForm(question)}
                              >
                                <FiEdit2 />
                              </button>

                              <button
                                type="button"
                                className="delete"
                                title="Soruyu sil"
                                aria-label="Soruyu sil"
                                onClick={() => setDeleteTarget(question)}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <footer className="question-pagination">
                  <p>
                    <strong>
                      {(currentPage - 1) * PAGE_SIZE + 1}-
                      {Math.min(
                        currentPage * PAGE_SIZE,
                        filteredQuestions.length,
                      )}
                    </strong>{' '}
                    arası gösteriliyor · Toplam {filteredQuestions.length}
                  </p>

                  <div>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                    >
                      <FiChevronLeft />
                    </button>

                    <span>
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1),
                        )
                      }
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </footer>
              </>
            )}
          </section>
        </section>
      </main>

      {isFormOpen && (
        <div
          className="question-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm()
            }
          }}
        >
          <section
            className="question-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-form-title"
          >
            <header>
              <div>
                <span>
                  {editingQuestion ? <FiEdit2 /> : <FiPlus />}
                </span>

                <div>
                  <h2 id="question-form-title">
                    {editingQuestion ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
                  </h2>

                  <p>
                    Soruyu, seçenekleri ve doğru cevabı eksiksiz girin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Pencereyi kapat"
                disabled={saving}
                onClick={closeForm}
              >
                <FiX />
              </button>
            </header>

            <form onSubmit={handleSaveQuestion}>
              <div className="question-form-body">
                <div className="question-form-group">
                  <label htmlFor="category">Kategori</label>

                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    className={formErrors.category ? 'invalid' : ''}
                    onChange={handleFormChange}
                  >
                    <option value="">Kategori seçin</option>

                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  {formErrors.category && (
                    <small className="question-field-error">
                      <FiAlertCircle />
                      {formErrors.category}
                    </small>
                  )}
                </div>

                <div className="question-form-group">
                  <label htmlFor="question">Soru</label>

                  <textarea
                    id="question"
                    name="question"
                    rows="4"
                    maxLength="500"
                    value={form.question}
                    className={formErrors.question ? 'invalid' : ''}
                    placeholder="Quiz sorusunu yazın..."
                    onChange={handleFormChange}
                  />

                  <div className="question-field-meta">
                    <span>
                      {formErrors.question ? (
                        <small className="question-field-error">
                          <FiAlertCircle />
                          {formErrors.question}
                        </small>
                      ) : (
                        <small>Soru açık, anlaşılır ve tek anlamlı olmalıdır.</small>
                      )}
                    </span>

                    <small>{form.question.length}/500</small>
                  </div>
                </div>

                <div className="question-option-grid">
                  {[
                    {
                      key: 'A',
                      name: 'optionA',
                      value: form.optionA,
                    },
                    {
                      key: 'B',
                      name: 'optionB',
                      value: form.optionB,
                    },
                    {
                      key: 'C',
                      name: 'optionC',
                      value: form.optionC,
                    },
                    {
                      key: 'D',
                      name: 'optionD',
                      value: form.optionD,
                    },
                  ].map((option) => (
                    <div
                      className="question-form-group"
                      key={option.key}
                    >
                      <label htmlFor={option.name}>
                        <span className="question-option-letter">
                          {option.key}
                        </span>
                        Seçeneği
                      </label>

                      <input
                        id={option.name}
                        name={option.name}
                        type="text"
                        maxLength="250"
                        value={option.value}
                        className={
                          formErrors[option.name] || formErrors.options
                            ? 'invalid'
                            : ''
                        }
                        placeholder={`${option.key} seçeneğini yazın`}
                        onChange={handleFormChange}
                      />

                      {formErrors[option.name] && (
                        <small className="question-field-error">
                          <FiAlertCircle />
                          {formErrors[option.name]}
                        </small>
                      )}
                    </div>
                  ))}
                </div>

                {formErrors.options && (
                  <div className="question-form-wide-error">
                    <FiAlertCircle />
                    {formErrors.options}
                  </div>
                )}

                <div className="question-form-row">
                  <div className="question-form-group">
                    <label>Doğru Cevap</label>

                    <div className="question-answer-selector">
                      {ANSWER_OPTIONS.map((answer) => (
                        <label
                          key={answer}
                          className={
                            form.correctAnswer === answer ? 'selected' : ''
                          }
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={answer}
                            checked={form.correctAnswer === answer}
                            onChange={handleFormChange}
                          />

                          <span>{answer}</span>

                          {form.correctAnswer === answer && <FiCheck />}
                        </label>
                      ))}
                    </div>

                    {formErrors.correctAnswer && (
                      <small className="question-field-error">
                        <FiAlertCircle />
                        {formErrors.correctAnswer}
                      </small>
                    )}
                  </div>

                  <div className="question-form-group">
                    <label>Soru Durumu</label>

                    <label className="question-active-switch">
                      <input
                        type="checkbox"
                        name="active"
                        checked={form.active}
                        onChange={handleFormChange}
                      />

                      <span className="question-switch-control">
                        <span />
                      </span>

                      <div>
                        <strong>{form.active ? 'Aktif' : 'Pasif'}</strong>
                        <small>
                          {form.active
                            ? 'Soru quizlerde kullanılabilir.'
                            : 'Soru quizlerde gösterilmez.'}
                        </small>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="question-form-group">
                  <label htmlFor="explanation">
                    Cevap Açıklaması
                    <small>İsteğe bağlı</small>
                  </label>

                  <textarea
                    id="explanation"
                    name="explanation"
                    rows="3"
                    maxLength="500"
                    value={form.explanation}
                    placeholder="Doğru cevabın açıklamasını yazın..."
                    onChange={handleFormChange}
                  />

                  <div className="question-field-meta">
                    <small>
                      Quiz sonrasında kullanıcıya gösterilebilir.
                    </small>

                    <small>{form.explanation.length}/500</small>
                  </div>
                </div>
              </div>

              <footer className="question-form-footer">
                <button
                  type="button"
                  className="question-cancel-button"
                  disabled={saving}
                  onClick={closeForm}
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  className="question-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="question-button-loader" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      {editingQuestion ? 'Değişiklikleri Kaydet' : 'Soruyu Ekle'}
                    </>
                  )}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div
          className="question-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleting
            ) {
              setDeleteTarget(null)
            }
          }}
        >
          <section
            className="question-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-question-title"
          >
            <span className="question-delete-icon">
              <FiTrash2 />
            </span>

            <h2 id="delete-question-title">Soruyu silmek istiyor musunuz?</h2>

            <p>
              “{deleteTarget.question}” sorusu kalıcı olarak silinecek. Bu işlem
              geri alınamaz.
            </p>

            <div>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Vazgeç
              </button>

              <button
                type="button"
                className="confirm-delete"
                disabled={deleting}
                onClick={handleDeleteQuestion}
              >
                {deleting ? (
                  <>
                    <span className="question-button-loader" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Kalıcı Olarak Sil
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}

      {notification && (
        <div
          className={`question-notification ${notification.type}`}
          role="status"
        >
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

export default QuestionManagementPage
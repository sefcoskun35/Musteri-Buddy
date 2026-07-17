import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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
  writeBatch,
} from 'firebase/firestore'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit2,
  FiFilter,
  FiGrid,
  FiHelpCircle,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi'
import * as XLSX from 'xlsx'
import AdminSidebar from '../components/AdminSidebar'
import { db } from '../services/firebase'
import { uploadQuestions } from '../services/questionService'
import '../styles/question-management.css'

const QUESTIONS_COLLECTION = 'questions'
const PAGE_SIZE = 10
const FIRESTORE_BATCH_LIMIT = 450
const ANSWER_OPTIONS = ['A', 'B', 'C', 'D']

const CATEGORY_OPTIONS = [
  'Health',
  'Personal Care',
  'Hair Care',
  'General Merchandise',
]

const REQUIRED_EXCEL_COLUMNS = [
  'kategori',
  'soru',
  'secenek_a',
  'secenek_b',
  'secenek_c',
  'secenek_d',
  'dogru_secenek',
]

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

const normalizeText = (value) =>
  String(value ?? '').trim()

const normalizeSearchText = (value) =>
  normalizeText(value).toLocaleLowerCase(
    'tr-TR',
  )

const getOptionText = (option) => {
  if (
    option &&
    typeof option === 'object' &&
    !Array.isArray(option)
  ) {
    return normalizeText(
      option.text ??
        option.label ??
        option.value,
    )
  }

  return normalizeText(option)
}

const getQuestionOptions = (question) => {
  const options = Array.isArray(
    question?.options,
  )
    ? question.options
    : []

  return ANSWER_OPTIONS.map(
    (_, index) =>
      getOptionText(options[index]),
  )
}

const getCorrectAnswer = (question) => {
  const directAnswer = normalizeText(
    question?.correctAnswer,
  ).toUpperCase()

  if (
    ANSWER_OPTIONS.includes(
      directAnswer,
    )
  ) {
    return directAnswer
  }

  const options = Array.isArray(
    question?.options,
  )
    ? question.options
    : []

  const correctIndex =
    options.findIndex(
      (option) =>
        option &&
        typeof option === 'object' &&
        option.isCorrect === true,
    )

  return correctIndex >= 0
    ? ANSWER_OPTIONS[correctIndex]
    : ''
}

const normalizeQuestionDocument = (
  question,
) => ({
  ...question,
  category: normalizeText(
    question?.category,
  ),
  question: normalizeText(
    question?.question,
  ),
  options:
    getQuestionOptions(question),
  correctAnswer:
    getCorrectAnswer(question),
  explanation: normalizeText(
    question?.explanation,
  ),
  active:
    question?.active !== false,
})

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  try {
    const date =
      typeof value?.toDate ===
      'function'
        ? value.toDate()
        : value instanceof Date
          ? value
          : new Date(value)

    if (
      Number.isNaN(date.getTime())
    ) {
      return '-'
    }

    return new Intl.DateTimeFormat(
      'tr-TR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(date)
  } catch {
    return '-'
  }
}

const normalizeExcelHeader = (
  value,
) =>
  normalizeText(value)
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, '_')

function QuestionManagementPage() {
  const fileInputRef = useRef(null)
  const notificationTimerRef =
    useRef(null)

  const [questions, setQuestions] =
    useState([])
  const [loading, setLoading] =
    useState(true)
  const [refreshing, setRefreshing] =
    useState(false)
  const [uploading, setUploading] =
    useState(false)

  const [searchTerm, setSearchTerm] =
    useState('')
  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState('all')
  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')
  const [currentPage, setCurrentPage] =
    useState(1)

  const [isFormOpen, setIsFormOpen] =
    useState(false)
  const [
    editingQuestion,
    setEditingQuestion,
  ] = useState(null)
  const [form, setForm] =
    useState(emptyForm)
  const [formErrors, setFormErrors] =
    useState({})
  const [saving, setSaving] =
    useState(false)

  const [deleteTarget, setDeleteTarget] =
    useState(null)
  const [
    bulkDeleteTarget,
    setBulkDeleteTarget,
  ] = useState(null)
  const [
    bulkConfirmation,
    setBulkConfirmation,
  ] = useState('')
  const [deleting, setDeleting] =
    useState(false)

  const [
    notification,
    setNotification,
  ] = useState(null)

  const showNotification = (
    type,
    message,
  ) => {
    if (
      notificationTimerRef.current
    ) {
      window.clearTimeout(
        notificationTimerRef.current,
      )
    }

    setNotification({
      type,
      message,
    })

    notificationTimerRef.current =
      window.setTimeout(() => {
        setNotification(null)
      }, 4500)
  }

  useEffect(
    () => () => {
      if (
        notificationTimerRef.current
      ) {
        window.clearTimeout(
          notificationTimerRef.current,
        )
      }
    },
    [],
  )

  const loadQuestions = async ({
    silent = false,
  } = {}) => {
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
            collection(
              db,
              QUESTIONS_COLLECTION,
            ),
            orderBy(
              'createdAt',
              'desc',
            ),
          ),
        )
      } catch {
        snapshot = await getDocs(
          collection(
            db,
            QUESTIONS_COLLECTION,
          ),
        )
      }

      const loadedQuestions =
        snapshot.docs
          .map((questionDocument) =>
            normalizeQuestionDocument({
              id: questionDocument.id,
              ...questionDocument.data(),
            }),
          )
          .sort(
            (
              firstQuestion,
              secondQuestion,
            ) => {
              const firstDate =
                firstQuestion.createdAt
                  ?.toMillis?.() ||
                firstQuestion.updatedAt
                  ?.toMillis?.() ||
                0

              const secondDate =
                secondQuestion.createdAt
                  ?.toMillis?.() ||
                secondQuestion.updatedAt
                  ?.toMillis?.() ||
                0

              return (
                secondDate -
                firstDate
              )
            },
          )

      setQuestions(loadedQuestions)
    } catch (error) {
      console.error(
        'Sorular alınamadı:',
        error,
      )

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
  }, [
    searchTerm,
    categoryFilter,
    statusFilter,
  ])

  const availableCategories =
    useMemo(() => {
      const categoryMap =
        new Map()

      CATEGORY_OPTIONS.forEach(
        (category) => {
          categoryMap.set(
            normalizeSearchText(
              category,
            ),
            category,
          )
        },
      )

      questions.forEach(
        (question) => {
          if (question.category) {
            categoryMap.set(
              normalizeSearchText(
                question.category,
              ),
              question.category,
            )
          }
        },
      )

      return [
        ...categoryMap.values(),
      ].sort(
        (
          firstCategory,
          secondCategory,
        ) =>
          firstCategory.localeCompare(
            secondCategory,
            'tr',
          ),
      )
    }, [questions])

  const filteredQuestions =
    useMemo(() => {
      const normalizedSearchTerm =
        normalizeSearchText(
          searchTerm,
        )

      return questions.filter(
        (question) => {
          const questionText =
            normalizeSearchText(
              question.question,
            )

          const categoryText =
            normalizeSearchText(
              question.category,
            )

          const explanationText =
            normalizeSearchText(
              question.explanation,
            )

          const optionText =
            normalizeSearchText(
              question.options.join(
                ' ',
              ),
            )

          const matchesSearch =
            !normalizedSearchTerm ||
            questionText.includes(
              normalizedSearchTerm,
            ) ||
            categoryText.includes(
              normalizedSearchTerm,
            ) ||
            explanationText.includes(
              normalizedSearchTerm,
            ) ||
            optionText.includes(
              normalizedSearchTerm,
            )

          const matchesCategory =
            categoryFilter ===
              'all' ||
            categoryText ===
              normalizeSearchText(
                categoryFilter,
              )

          const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter ===
              'active' &&
              question.active !==
                false) ||
            (statusFilter ===
              'passive' &&
              question.active ===
                false)

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          )
        },
      )
    }, [
      questions,
      searchTerm,
      categoryFilter,
      statusFilter,
    ])

  const categoryQuestions =
    useMemo(() => {
      if (
        categoryFilter === 'all'
      ) {
        return []
      }

      const normalizedCategory =
        normalizeSearchText(
          categoryFilter,
        )

      return questions.filter(
        (question) =>
          normalizeSearchText(
            question.category,
          ) === normalizedCategory,
      )
    }, [
      questions,
      categoryFilter,
    ])

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredQuestions.length /
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

  const paginatedQuestions =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        PAGE_SIZE

      return filteredQuestions.slice(
        startIndex,
        startIndex + PAGE_SIZE,
      )
    }, [
      filteredQuestions,
      currentPage,
    ])

  const statistics = useMemo(() => {
    const activeCount =
      questions.filter(
        (question) =>
          question.active !== false,
      ).length

    return {
      total: questions.length,
      active: activeCount,
      passive:
        questions.length -
        activeCount,
      categories: new Set(
        questions
          .map((question) =>
            normalizeSearchText(
              question.category,
            ),
          )
          .filter(Boolean),
      ).size,
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

  const openEditForm = (
    question,
  ) => {
    const options =
      getQuestionOptions(question)

    setEditingQuestion(question)

    setForm({
      category:
        question.category,
      question:
        question.question,
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctAnswer:
        getCorrectAnswer(
          question,
        ) || 'A',
      explanation:
        question.explanation,
      active:
        question.active !== false,
    })

    setFormErrors({})
    setIsFormOpen(true)
  }

  const closeForm = () => {
    if (saving) {
      return
    }

    setIsFormOpen(false)
    resetForm()
  }

  const handleFormChange = (
    event,
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))

    if (formErrors[name]) {
      setFormErrors(
        (currentErrors) => ({
          ...currentErrors,
          [name]: '',
        }),
      )
    }
  }

  const validateForm = () => {
    const errors = {}

    if (
      !normalizeText(
        form.category,
      )
    ) {
      errors.category =
        'Kategori seçmelisiniz.'
    }

    if (
      !normalizeText(
        form.question,
      )
    ) {
      errors.question =
        'Soru alanı boş bırakılamaz.'
    }

    const optionValues = [
      form.optionA,
      form.optionB,
      form.optionC,
      form.optionD,
    ]

    optionValues.forEach(
      (option, index) => {
        if (!normalizeText(option)) {
          errors[
            `option${ANSWER_OPTIONS[index]}`
          ] =
            `${ANSWER_OPTIONS[index]} seçeneği boş bırakılamaz.`
        }
      },
    )

    const normalizedOptions =
      optionValues.map(
        normalizeSearchText,
      )

    if (
      normalizedOptions.every(
        Boolean,
      ) &&
      new Set(
        normalizedOptions,
      ).size !==
        normalizedOptions.length
    ) {
      errors.options =
        'Seçenekler birbirinden farklı olmalıdır.'
    }

    if (
      !ANSWER_OPTIONS.includes(
        form.correctAnswer,
      )
    ) {
      errors.correctAnswer =
        'Geçerli doğru cevap seçmelisiniz.'
    }

    const duplicateQuestion =
      questions.some(
        (question) =>
          question.id !==
            editingQuestion?.id &&
          normalizeSearchText(
            question.question,
          ) ===
            normalizeSearchText(
              form.question,
            ),
      )

    if (duplicateQuestion) {
      errors.question =
        'Bu soru daha önce eklenmiş.'
    }

    setFormErrors(errors)

    return (
      Object.keys(errors).length ===
      0
    )
  }

  const handleSaveQuestion =
    async (event) => {
      event.preventDefault()

      if (!validateForm()) {
        return
      }

      try {
        setSaving(true)

        const questionData = {
          category:
            normalizeText(
              form.category,
            ),
          question:
            normalizeText(
              form.question,
            ),
          options: [
            normalizeText(
              form.optionA,
            ),
            normalizeText(
              form.optionB,
            ),
            normalizeText(
              form.optionC,
            ),
            normalizeText(
              form.optionD,
            ),
          ],
          correctAnswer:
            form.correctAnswer,
          explanation:
            normalizeText(
              form.explanation,
            ),
          active: Boolean(
            form.active,
          ),
          updatedAt:
            serverTimestamp(),
        }

        if (editingQuestion) {
          await updateDoc(
            doc(
              db,
              QUESTIONS_COLLECTION,
              editingQuestion.id,
            ),
            questionData,
          )

          showNotification(
            'success',
            'Soru başarıyla güncellendi.',
          )
        } else {
          await addDoc(
            collection(
              db,
              QUESTIONS_COLLECTION,
            ),
            {
              ...questionData,
              createdAt:
                serverTimestamp(),
            },
          )

          showNotification(
            'success',
            'Yeni soru başarıyla eklendi.',
          )
        }

        setIsFormOpen(false)
        resetForm()

        await loadQuestions({
          silent: true,
        })
      } catch (error) {
        console.error(
          'Soru kaydedilemedi:',
          error,
        )

        showNotification(
          'error',
          'Soru kaydedilemedi. Firestore yetkilerini kontrol edin.',
        )
      } finally {
        setSaving(false)
      }
    }

  const handleToggleStatus =
    async (question) => {
      const newStatus =
        question.active === false

      try {
        setQuestions(
          (currentQuestions) =>
            currentQuestions.map(
              (currentQuestion) =>
                currentQuestion.id ===
                question.id
                  ? {
                      ...currentQuestion,
                      active:
                        newStatus,
                    }
                  : currentQuestion,
            ),
        )

        await updateDoc(
          doc(
            db,
            QUESTIONS_COLLECTION,
            question.id,
          ),
          {
            active: newStatus,
            updatedAt:
              serverTimestamp(),
          },
        )

        showNotification(
          'success',
          newStatus
            ? 'Soru aktif hale getirildi.'
            : 'Soru pasif hale getirildi.',
        )
      } catch (error) {
        console.error(
          'Soru durumu güncellenemedi:',
          error,
        )

        await loadQuestions({
          silent: true,
        })

        showNotification(
          'error',
          'Soru durumu güncellenemedi.',
        )
      }
    }

  const handleDeleteQuestion =
    async () => {
      if (!deleteTarget) {
        return
      }

      try {
        setDeleting(true)

        await deleteDoc(
          doc(
            db,
            QUESTIONS_COLLECTION,
            deleteTarget.id,
          ),
        )

        setQuestions(
          (currentQuestions) =>
            currentQuestions.filter(
              (question) =>
                question.id !==
                deleteTarget.id,
            ),
        )

        setDeleteTarget(null)

        showNotification(
          'success',
          'Soru kalıcı olarak silindi.',
        )
      } catch (error) {
        console.error(
          'Soru silinemedi:',
          error,
        )

        showNotification(
          'error',
          'Soru silinemedi.',
        )
      } finally {
        setDeleting(false)
      }
    }

  const openCategoryDeleteModal =
    () => {
      if (
        categoryFilter ===
          'all' ||
        categoryQuestions.length === 0
      ) {
        return
      }

      setBulkConfirmation('')

      setBulkDeleteTarget({
        type: 'category',
        category: categoryFilter,
        questions:
          categoryQuestions,
        confirmationText:
          categoryFilter,
      })
    }

  const openAllDeleteModal = () => {
    if (questions.length === 0) {
      return
    }

    setBulkConfirmation('')

    setBulkDeleteTarget({
      type: 'all',
      category: '',
      questions,
      confirmationText: 'SİL',
    })
  }

  const closeBulkDeleteModal =
    () => {
      if (deleting) {
        return
      }

      setBulkDeleteTarget(null)
      setBulkConfirmation('')
    }

  const deleteQuestionsInBatches =
    async (questionIds) => {
      for (
        let index = 0;
        index < questionIds.length;
        index +=
          FIRESTORE_BATCH_LIMIT
      ) {
        const currentIds =
          questionIds.slice(
            index,
            index +
              FIRESTORE_BATCH_LIMIT,
          )

        const batch =
          writeBatch(db)

        currentIds.forEach(
          (questionId) => {
            batch.delete(
              doc(
                db,
                QUESTIONS_COLLECTION,
                questionId,
              ),
            )
          },
        )

        await batch.commit()
      }
    }

  const handleBulkDeleteQuestions =
    async () => {
      if (!bulkDeleteTarget) {
        return
      }

      const confirmationText =
        normalizeText(
          bulkDeleteTarget
            .confirmationText,
        )

      if (
        normalizeText(
          bulkConfirmation,
        ) !== confirmationText
      ) {
        return
      }

      const targetQuestions =
        bulkDeleteTarget.questions

      if (
        !targetQuestions.length
      ) {
        return
      }

      const questionIds =
        targetQuestions.map(
          (question) => question.id,
        )

      const deletedQuestionIds =
        new Set(questionIds)

      try {
        setDeleting(true)

        await deleteQuestionsInBatches(
          questionIds,
        )

        setQuestions(
          (currentQuestions) =>
            currentQuestions.filter(
              (question) =>
                !deletedQuestionIds.has(
                  question.id,
                ),
            ),
        )

        const deletedCount =
          questionIds.length

        const deleteType =
          bulkDeleteTarget.type

        const deletedCategory =
          bulkDeleteTarget.category

        setBulkDeleteTarget(null)
        setBulkConfirmation('')
        setCurrentPage(1)

        if (
          deleteType === 'all'
        ) {
          setSearchTerm('')
          setCategoryFilter('all')
          setStatusFilter('all')
        }

        if (
          deleteType === 'category'
        ) {
          setCategoryFilter('all')
        }

        showNotification(
          'success',
          deleteType === 'category'
            ? `${deletedCategory} kategorisindeki ${deletedCount} soru kalıcı olarak silindi.`
            : `${deletedCount} sorunun tamamı kalıcı olarak silindi.`,
        )
      } catch (error) {
        console.error(
          'Toplu soru silme hatası:',
          error,
        )

        await loadQuestions({
          silent: true,
        })

        showNotification(
          'error',
          'Soruların tamamı silinemedi. Lütfen tekrar deneyin.',
        )
      } finally {
        setDeleting(false)
      }
    }

  const handleExcelUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      event.target.value = ''

      if (!file) {
        return
      }

      try {
        setUploading(true)

        const fileBuffer =
          await file.arrayBuffer()

        const workbook =
          XLSX.read(fileBuffer, {
            type: 'array',
          })

        const firstSheetName =
          workbook.SheetNames[0]

        if (!firstSheetName) {
          throw new Error(
            'Excel dosyasında çalışma sayfası bulunamadı.',
          )
        }

        const worksheet =
          workbook.Sheets[
            firstSheetName
          ]

        const rawRows =
          XLSX.utils.sheet_to_json(
            worksheet,
            {
              defval: '',
              raw: false,
            },
          )

        if (!rawRows.length) {
          throw new Error(
            'Excel dosyasında soru bulunamadı.',
          )
        }

        const rows = rawRows.map(
          (rawRow) => {
            const normalizedRow = {}

            Object.entries(
              rawRow,
            ).forEach(
              ([key, value]) => {
                normalizedRow[
                  normalizeExcelHeader(
                    key,
                  )
                ] = value
              },
            )

            return normalizedRow
          },
        )

        const availableColumns =
          Object.keys(rows[0])

        const missingColumns =
          REQUIRED_EXCEL_COLUMNS.filter(
            (column) =>
              !availableColumns.includes(
                column,
              ),
          )

        if (
          missingColumns.length > 0
        ) {
          throw new Error(
            `Eksik sütunlar: ${missingColumns.join(
              ', ',
            )}`,
          )
        }

        const uploadedCount =
          await uploadQuestions(rows)

        showNotification(
          'success',
          `${uploadedCount} soru başarıyla yüklendi.`,
        )

        await loadQuestions({
          silent: true,
        })
      } catch (error) {
        console.error(
          'Excel yükleme hatası:',
          error,
        )

        showNotification(
          'error',
          error?.message ||
            'Excel dosyası yüklenemedi.',
        )
      } finally {
        setUploading(false)
      }
    }

  const handleTemplateDownload =
    () => {
      const templateRows = [
        {
          kategori: 'Health',
          soru:
            'Örnek soru metni',
          secenek_a:
            'A seçeneği',
          secenek_b:
            'B seçeneği',
          secenek_c:
            'C seçeneği',
          secenek_d:
            'D seçeneği',
          dogru_secenek: 'A',
          aciklama:
            'İsteğe bağlı açıklama',
        },
      ]

      const worksheet =
        XLSX.utils.json_to_sheet(
          templateRows,
        )

      worksheet['!cols'] = [
        { wch: 24 },
        { wch: 50 },
        { wch: 34 },
        { wch: 34 },
        { wch: 34 },
        { wch: 34 },
        { wch: 18 },
        { wch: 50 },
      ]

      const workbook =
        XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Sorular',
      )

      XLSX.writeFile(
        workbook,
        'Musteri_Buddy_Soru_Yukleme_Sablonu.xlsx',
      )
    }

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  const hasActiveFilters =
    searchTerm ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all'

  const bulkConfirmationMatches =
    bulkDeleteTarget
      ? normalizeText(
          bulkConfirmation,
        ) ===
        normalizeText(
          bulkDeleteTarget
            .confirmationText,
        )
      : false

  return (
    <>
      <main className="question-management-page">
        <AdminSidebar />

        <section className="question-main-content">
          <header className="question-page-header">
            <div>
              <span className="question-page-eyebrow">
                SORU BANKASI
              </span>

              <h1>Soru Yönetimi</h1>

              <p>
                Quiz sorularını görüntüleyin,
                düzenleyin ve Excel ile toplu
                yükleyin.
              </p>
            </div>

            <div className="question-header-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={
                  handleExcelUpload
                }
              />

              <button
                type="button"
                className="question-refresh-button"
                onClick={
                  handleTemplateDownload
                }
              >
                <FiDownload />
                Şablon İndir
              </button>

              <button
                type="button"
                className="question-refresh-button"
                disabled={uploading}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <FiUploadCloud />

                {uploading
                  ? 'Yükleniyor'
                  : 'Excel Yükle'}
              </button>

              <button
                type="button"
                className="question-refresh-button"
                disabled={refreshing}
                onClick={() =>
                  loadQuestions({
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

              <button
                type="button"
                className="question-add-button"
                onClick={
                  openCreateForm
                }
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
                <small>
                  Toplam Soru
                </small>

                <strong>
                  {statistics.total}
                </strong>
              </div>
            </article>

            <article>
              <span className="statistic-icon statistic-active">
                <FiCheckCircle />
              </span>

              <div>
                <small>
                  Aktif Soru
                </small>

                <strong>
                  {statistics.active}
                </strong>
              </div>
            </article>

            <article>
              <span className="statistic-icon statistic-passive">
                <FiAlertCircle />
              </span>

              <div>
                <small>
                  Pasif Soru
                </small>

                <strong>
                  {statistics.passive}
                </strong>
              </div>
            </article>

            <article>
              <span className="statistic-icon statistic-category">
                <FiGrid />
              </span>

              <div>
                <small>Kategori</small>

                <strong>
                  {statistics.categories}
                </strong>
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

            <div className="question-select-field">
              <FiGrid />

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
              >
                <option value="all">
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
            </div>

            <div className="question-select-field">
              <FiFilter />

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
                  Aktif
                </option>

                <option value="passive">
                  Pasif
                </option>
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
                  {
                    filteredQuestions.length
                  }{' '}
                  soru görüntüleniyor
                </p>
              </div>

              <div className="question-header-actions">
                {categoryFilter !==
                  'all' && (
                  <button
                    type="button"
                    className="question-refresh-button"
                    disabled={
                      deleting ||
                      categoryQuestions.length ===
                        0
                    }
                    onClick={
                      openCategoryDeleteModal
                    }
                  >
                    <FiTrash2 />

                    {categoryFilter}{' '}
                    Sorularını Sil
                  </button>
                )}

                <button
                  type="button"
                  className="question-add-button"
                  disabled={
                    deleting ||
                    questions.length ===
                      0
                  }
                  onClick={
                    openAllDeleteModal
                  }
                >
                  <FiTrash2 />
                  Tüm Soruları Sil
                </button>
              </div>
            </div>

            {loading ? (
              <div className="question-loading-state">
                <span className="question-loader" />

                <strong>
                  Sorular yükleniyor
                </strong>
              </div>
            ) : filteredQuestions.length ===
              0 ? (
              <div className="question-empty-state">
                <span>
                  <FiHelpCircle />
                </span>

                <h3>
                  Soru bulunamadı
                </h3>

                <p>
                  Yeni soru ekleyebilir veya
                  Excel dosyası
                  yükleyebilirsiniz.
                </p>
              </div>
            ) : (
              <>
                <div className="question-table-scroll">
                  <table className="question-table">
                    <thead>
                      <tr>
                        <th>Soru</th>
                        <th>Kategori</th>
                        <th>
                          Doğru Cevap
                        </th>
                        <th>Durum</th>
                        <th>
                          Eklenme Tarihi
                        </th>
                        <th />
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedQuestions.map(
                        (question) => {
                          const options =
                            getQuestionOptions(
                              question,
                            )

                          const correctAnswer =
                            getCorrectAnswer(
                              question,
                            )

                          const correctIndex =
                            ANSWER_OPTIONS.indexOf(
                              correctAnswer,
                            )

                          return (
                            <tr
                              key={
                                question.id
                              }
                            >
                              <td>
                                <div className="question-cell">
                                  <strong>
                                    {question.question ||
                                      '-'}
                                  </strong>

                                  <span>
                                    {options
                                      .map(
                                        (
                                          option,
                                          index,
                                        ) =>
                                          `${ANSWER_OPTIONS[index]}) ${option}`,
                                      )
                                      .join(
                                        '  •  ',
                                      )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <span className="question-category-badge">
                                  {question.category ||
                                    'Kategorisiz'}
                                </span>
                              </td>

                              <td>
                                <div className="question-answer-cell">
                                  <span>
                                    {correctAnswer ||
                                      '-'}
                                  </span>

                                  <small>
                                    {correctIndex >=
                                    0
                                      ? options[
                                          correctIndex
                                        ] ||
                                        '-'
                                      : '-'}
                                  </small>
                                </div>
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className={`question-status-toggle ${
                                    question.active ===
                                    false
                                      ? 'passive'
                                      : 'active'
                                  }`}
                                  onClick={() =>
                                    handleToggleStatus(
                                      question,
                                    )
                                  }
                                >
                                  <span />

                                  {question.active ===
                                  false
                                    ? 'Pasif'
                                    : 'Aktif'}
                                </button>
                              </td>

                              <td>
                                <span className="question-date">
                                  {formatDate(
                                    question.createdAt ||
                                      question.updatedAt,
                                  )}
                                </span>
                              </td>

                              <td>
                                <div className="question-row-actions">
                                  <button
                                    type="button"
                                    className="edit"
                                    aria-label="Soruyu düzenle"
                                    onClick={() =>
                                      openEditForm(
                                        question,
                                      )
                                    }
                                  >
                                    <FiEdit2 />
                                  </button>

                                  <button
                                    type="button"
                                    className="delete"
                                    aria-label="Soruyu sil"
                                    onClick={() =>
                                      setDeleteTarget(
                                        question,
                                      )
                                    }
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        },
                      )}
                    </tbody>
                  </table>
                </div>

                <footer className="question-pagination">
                  <button
                    type="button"
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page - 1,
                      )
                    }
                  >
                    <FiChevronLeft />
                  </button>

                  <p>
                    Sayfa{' '}
                    <strong>
                      {currentPage}
                    </strong>{' '}
                    / {totalPages}
                  </p>

                  <button
                    type="button"
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page + 1,
                      )
                    }
                  >
                    <FiChevronRight />
                  </button>
                </footer>
              </>
            )}
          </section>
        </section>
      </main>

      {notification && (
        <div
          className={`question-notification ${notification.type}`}
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
        </div>
      )}

      {isFormOpen && (
        <div className="question-modal-backdrop">
          <form
            className="question-modal"
            onSubmit={
              handleSaveQuestion
            }
          >
            <header>
              <div>
                <h2>
                  {editingQuestion
                    ? 'Soruyu Düzenle'
                    : 'Yeni Soru'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
              >
                <FiX />
              </button>
            </header>

            <div className="question-modal-body">
              <label>
                <span>Kategori</span>

                <select
                  name="category"
                  value={form.category}
                  onChange={
                    handleFormChange
                  }
                >
                  <option value="">
                    Kategori seçin
                  </option>

                  {CATEGORY_OPTIONS.map(
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

                {formErrors.category && (
                  <small>
                    {
                      formErrors.category
                    }
                  </small>
                )}
              </label>

              <label>
                <span>Soru</span>

                <textarea
                  name="question"
                  value={form.question}
                  onChange={
                    handleFormChange
                  }
                  rows="3"
                />

                {formErrors.question && (
                  <small>
                    {
                      formErrors.question
                    }
                  </small>
                )}
              </label>

              {ANSWER_OPTIONS.map(
                (letter) => {
                  const fieldName =
                    `option${letter}`

                  return (
                    <label
                      key={letter}
                    >
                      <span>
                        {letter} Seçeneği
                      </span>

                      <input
                        name={
                          fieldName
                        }
                        value={
                          form[
                            fieldName
                          ]
                        }
                        onChange={
                          handleFormChange
                        }
                      />

                      {formErrors[
                        fieldName
                      ] && (
                        <small>
                          {
                            formErrors[
                              fieldName
                            ]
                          }
                        </small>
                      )}
                    </label>
                  )
                },
              )}

              {formErrors.options && (
                <small>
                  {formErrors.options}
                </small>
              )}

              <label>
                <span>
                  Doğru Cevap
                </span>

                <select
                  name="correctAnswer"
                  value={
                    form.correctAnswer
                  }
                  onChange={
                    handleFormChange
                  }
                >
                  {ANSWER_OPTIONS.map(
                    (answer) => (
                      <option
                        key={answer}
                        value={answer}
                      >
                        {answer}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span>Açıklama</span>

                <textarea
                  name="explanation"
                  value={
                    form.explanation
                  }
                  onChange={
                    handleFormChange
                  }
                  rows="2"
                />
              </label>

              <label className="question-checkbox-field">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={
                    handleFormChange
                  }
                />

                <span>
                  Soru aktif olsun
                </span>
              </label>
            </div>

            <footer>
              <button
                type="button"
                onClick={closeForm}
              >
                Vazgeç
              </button>

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? 'Kaydediliyor'
                  : 'Kaydet'}
              </button>
            </footer>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="question-modal-backdrop">
          <div className="question-delete-modal">
            <FiTrash2 />

            <h2>Soruyu Sil</h2>

            <p>
              Bu soru kalıcı olarak
              silinecek.
            </p>

            <div>
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteTarget(null)
                }
              >
                Vazgeç
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={
                  handleDeleteQuestion
                }
              >
                {deleting
                  ? 'Siliniyor'
                  : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteTarget && (
        <div className="question-modal-backdrop">
          <div className="question-delete-modal">
            <FiTrash2 />

            <h2>
              {bulkDeleteTarget.type ===
              'category'
                ? 'Kategorideki Soruları Sil'
                : 'Tüm Soruları Sil'}
            </h2>

            <p>
              {bulkDeleteTarget.type ===
              'category'
                ? `${bulkDeleteTarget.category} kategorisindeki ${bulkDeleteTarget.questions.length} soru kalıcı olarak silinecek.`
                : `Soru bankasındaki ${bulkDeleteTarget.questions.length} sorunun tamamı kalıcı olarak silinecek.`}
            </p>

            <p>
              Bu işlem geri alınamaz.
            </p>

            <label>
              <span>
                Devam etmek için{' '}
                <strong>
                  {
                    bulkDeleteTarget.confirmationText
                  }
                </strong>{' '}
                yazın.
              </span>

              <input
                type="text"
                value={
                  bulkConfirmation
                }
                autoFocus
                autoComplete="off"
                disabled={deleting}
                onChange={(event) =>
                  setBulkConfirmation(
                    event.target.value,
                  )
                }
              />
            </label>

            <div>
              <button
                type="button"
                disabled={deleting}
                onClick={
                  closeBulkDeleteModal
                }
              >
                Vazgeç
              </button>

              <button
                type="button"
                disabled={
                  deleting ||
                  !bulkConfirmationMatches
                }
                onClick={
                  handleBulkDeleteQuestions
                }
              >
                {deleting
                  ? 'Siliniyor'
                  : bulkDeleteTarget.type ===
                      'category'
                    ? 'Kategoriyi Sil'
                    : 'Tümünü Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default QuestionManagementPage
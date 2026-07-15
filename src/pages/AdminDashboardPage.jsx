import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import AdminSidebar from '../components/AdminSidebar'
import {
  FiAlertCircle,
  FiAward,
  FiCheckCircle,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiUploadCloud,
  FiUsers,
} from 'react-icons/fi'
import { uploadQuestions } from '../services/questionService'
import '../styles/admin-dashboard.css'

const requiredColumns = [
  'kategori',
  'soru',
  'secenek_a',
  'secenek_b',
  'secenek_c',
  'secenek_d',
  'dogru_secenek',
]

function AdminDashboardPage() {
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  const validation = useMemo(() => {
    if (!rows.length) {
      return {
        validRows: [],
        invalidRows: [],
      }
    }

    const seenQuestions = new Set()
    const validRows = []
    const invalidRows = []

    rows.forEach((row, index) => {
      const errors = []

      const normalizedQuestion = String(row.soru || '')
        .trim()
        .toLocaleLowerCase('tr-TR')

      requiredColumns.forEach((column) => {
        if (!String(row[column] ?? '').trim()) {
          errors.push(`${column} alanı boş`)
        }
      })

      const correctOption = String(row.dogru_secenek || '')
        .trim()
        .toUpperCase()

      if (
        correctOption &&
        !['A', 'B', 'C', 'D'].includes(correctOption)
      ) {
        errors.push(
          'dogru_secenek yalnızca A, B, C veya D olabilir',
        )
      }

      if (
        normalizedQuestion &&
        seenQuestions.has(normalizedQuestion)
      ) {
        errors.push(
          'Aynı soru dosyada birden fazla kez bulunuyor',
        )
      }

      if (normalizedQuestion) {
        seenQuestions.add(normalizedQuestion)
      }

      const preparedRow = {
        ...row,
        satirNo: index + 2,
        errors,
      }

      if (errors.length) {
        invalidRows.push(preparedRow)
      } else {
        validRows.push(preparedRow)
      }
    })

    return {
      validRows,
      invalidRows,
    }
  }, [rows])

  const categorySummary = useMemo(() => {
    return validation.validRows.reduce((summary, row) => {
      const category = String(row.kategori || '').trim()

      if (!category) {
        return summary
      }

      summary[category] = (summary[category] || 0) + 1

      return summary
    }, {})
  }, [validation.validRows])

  const handleDatabaseUpload = async () => {
    if (
      !validation.validRows.length ||
      validation.invalidRows.length > 0
    ) {
      return
    }

    try {
      setIsUploading(true)
      setUploadMessage('')

      const count = await uploadQuestions(
        validation.validRows,
      )

      setUploadMessage(
        `${count} soru başarıyla veritabanına yüklendi.`,
      )
    } catch (error) {
      console.error('Sorular yüklenemedi:', error)

      setUploadMessage(
        'Sorular yüklenemedi. Firestore bağlantısını ve kurallarını kontrol edin.',
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]

    setRows([])
    setFileError('')
    setUploadMessage('')
    setFileName(file?.name || '')

    if (!file) {
      return
    }

    try {
      const buffer = await file.arrayBuffer()

      const workbook = XLSX.read(buffer, {
        type: 'array',
      })

      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      const rawRows = XLSX.utils.sheet_to_json(
        worksheet,
        {
          defval: '',
          raw: false,
        },
      )

      if (!rawRows.length) {
        setFileError(
          'Excel dosyasında okunabilir veri bulunamadı.',
        )

        return
      }

      const normalizeHeader = (value) =>
        String(value || '')
          .trim()
          .toLocaleLowerCase('tr-TR')
          .replace(/ç/g, 'c')
          .replace(/ğ/g, 'g')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ş/g, 's')
          .replace(/ü/g, 'u')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')

      const parsedRows = rawRows.map((row) =>
        Object.entries(row).reduce(
          (normalizedRow, [key, value]) => {
            normalizedRow[normalizeHeader(key)] = value

            return normalizedRow
          },
          {},
        ),
      )

      const columns = Object.keys(parsedRows[0])

      const missingColumns = requiredColumns.filter(
        (column) => !columns.includes(column),
      )

      if (missingColumns.length) {
        setFileError(
          `Eksik sütunlar: ${missingColumns.join(', ')}`,
        )

        return
      }

      setRows(parsedRows)
    } catch (error) {
      console.error('Excel dosyası okunamadı:', error)

      setFileError(
        'Excel dosyası okunamadı. Dosya biçimini kontrol edin.',
      )
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('musteriBuddyAdmin')
    sessionStorage.removeItem(
      'musteriBuddyAdminEmail',
    )

    navigate('/yonetici', {
      replace: true,
    })
  }

  return (
    <main className="admin-dashboard">
  <AdminSidebar />

      <section className="admin-content">
        <header className="admin-content-header">
          <div>
            <span>Soru Bankası</span>

            <h1>Excel ile soru yükle</h1>

            <p>
              Dosyanızı seçin. Sistem sütunları, boş
              alanları, doğru cevapları ve tekrar eden
              soruları otomatik olarak kontrol eder.
            </p>
          </div>
        </header>

        <section className="upload-panel">
          <label className="upload-area">
            <FiUploadCloud />

            <strong>Excel dosyası seç</strong>

            <span>
              .xlsx veya .xls dosyası
              yükleyebilirsiniz.
            </span>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
            />
          </label>

          {fileName && (
            <div className="selected-file">
              <FiFileText />
              <span>{fileName}</span>
            </div>
          )}

          {fileError && (
            <div className="validation-message validation-error">
              <FiAlertCircle />
              {fileError}
            </div>
          )}
        </section>

        {rows.length > 0 && (
          <>
            <section className="summary-grid">
              <article>
                <span>Toplam Satır</span>
                <strong>{rows.length}</strong>
              </article>

              <article>
                <span>Geçerli</span>

                <strong>
                  {validation.validRows.length}
                </strong>
              </article>

              <article>
                <span>Hatalı</span>

                <strong>
                  {validation.invalidRows.length}
                </strong>
              </article>

              <article>
                <span>Kategori</span>

                <strong>
                  {
                    Object.keys(categorySummary)
                      .length
                  }
                </strong>
              </article>
            </section>

            <section className="category-summary-panel">
              <h2>Kategori dağılımı</h2>

              <div className="category-summary-list">
                {Object.entries(categorySummary).map(
                  ([category, count]) => (
                    <div key={category}>
                      <span>{category}</span>

                      <strong>
                        {count} soru
                      </strong>
                    </div>
                  ),
                )}
              </div>
            </section>

            {validation.invalidRows.length === 0 ? (
              <div className="validation-message validation-success">
                <FiCheckCircle />

                Tüm satırlar geçerli. Dosya
                veritabanına yüklenmeye hazır.
              </div>
            ) : (
              <section className="error-table-panel">
                <h2>Hatalı satırlar</h2>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Satır</th>
                        <th>Kategori</th>
                        <th>Soru</th>
                        <th>Hata</th>
                      </tr>
                    </thead>

                    <tbody>
                      {validation.invalidRows.map(
                        (row) => (
                          <tr
                            key={`${row.satirNo}-${row.soru}`}
                          >
                            <td>{row.satirNo}</td>

                            <td>
                              {row.kategori || '-'}
                            </td>

                            <td>
                              {row.soru || '-'}
                            </td>

                            <td>
                              {row.errors.join(
                                ' • ',
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <button
              type="button"
              className="database-upload-button"
              disabled={
                validation.invalidRows.length >
                  0 ||
                validation.validRows.length ===
                  0 ||
                isUploading
              }
              onClick={handleDatabaseUpload}
            >
              <FiUploadCloud />

              {isUploading
                ? 'Yükleniyor...'
                : 'Veritabanına Yükle'}
            </button>

            {uploadMessage && (
              <div
                className={`validation-message ${
                  uploadMessage.includes(
                    'başarıyla',
                  )
                    ? 'validation-success'
                    : 'validation-error'
                }`}
              >
                {uploadMessage.includes(
                  'başarıyla',
                ) ? (
                  <FiCheckCircle />
                ) : (
                  <FiAlertCircle />
                )}

                {uploadMessage}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default AdminDashboardPage
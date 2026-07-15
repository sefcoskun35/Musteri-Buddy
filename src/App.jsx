import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import CategoryPage from './pages/CategoryPage'
import QuizPage from './pages/QuizPage'
import ResultPage from './pages/ResultPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminResultsPage from './pages/AdminResultsPage'
import StoreRankingPage from './pages/StoreRankingPage'
import QuestionManagementPage from './pages/QuestionManagementPage'
import DashboardPage from './pages/DashboardPage'
import UserManagementPage from './pages/UserManagementPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/kategoriler"
        element={<CategoryPage />}
      />

      <Route
        path="/quiz/:categoryId"
        element={<QuizPage />}
      />

      <Route path="/sonuc" element={<ResultPage />} />

      <Route
        path="/yonetici"
        element={<AdminLoginPage />}
      />

      <Route
        path="/yonetim/sorular"
        element={<QuestionManagementPage />}
      />

<Route
  path="/yonetim/dashboard"
  element={<DashboardPage />}
/>

<Route
  path="/yonetim/kullanicilar"
  element={<UserManagementPage />}
/>

<Route
  path="/yonetim/sonuclar"
  element={<AdminResultsPage />}
/>

<Route
  path="/yonetim/siralama"
  element={<StoreRankingPage />}
/>

<Route
  path="/yonetim"
  element={<AdminDashboardPage />}
/>
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import { LoginPage } from './pages/LoginPage'
import { TimelinePage } from './pages/TimelinePage'
import { DayPage } from './pages/DayPage'
import { MapPage } from './pages/MapPage'
import { SummaryPage } from './pages/SummaryPage'
import { ReservationsPage } from './pages/ReservationsPage'
import { TodayPage } from './pages/TodayPage'
import { InstallBanner } from './components/InstallBanner'
import { Layout } from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useSession()
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<TimelinePage />} />
          <Route path="/dia/:dayNum" element={<DayPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/resum" element={<SummaryPage />} />
          <Route path="/reservas" element={<ReservationsPage />} />
          <Route path="/avui" element={<TodayPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallBanner />
    </BrowserRouter>
  )
}

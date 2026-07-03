import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ProtectedAccountRoute from './components/ProtectedAccountRoute'
import ProtectedRoomRoute from './components/ProtectedRoomRoute'
import { AuthProvider } from './context/AuthContext'
import AccessDeniedPage from './pages/AccessDeniedPage'
import AccessPage from './pages/AccessPage'
import CouplesPage from './pages/CouplesPage'
import DashboardPage from './pages/DashboardPage'
import FeaturesPage from './pages/FeaturesPage'
import LandingPage from './pages/LandingPage'
import PreviewPage from './pages/PreviewPage'
import PrivateRoomPage from './pages/PrivateRoomPage'
import RoomsDirectoryPage from './pages/RoomsDirectoryPage'
import StudentPage from './pages/StudentPage'
import VipOverviewPage from './pages/VipOverviewPage'
import VipPage from './pages/VipPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/access" element={<AccessPage />} />
            <Route path="/rooms" element={<RoomsDirectoryPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedAccountRoute>
                  <DashboardPage />
                </ProtectedAccountRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedAccountRoute allowedTypes={['student']}>
                  <StudentPage />
                </ProtectedAccountRoute>
              }
            />
            <Route
              path="/couples"
              element={
                <ProtectedAccountRoute allowedTypes={['couples']}>
                  <CouplesPage />
                </ProtectedAccountRoute>
              }
            />
            <Route
              path="/vip"
              element={
                <ProtectedAccountRoute allowedTypes={['vip']}>
                  <VipPage />
                </ProtectedAccountRoute>
              }
            />
            <Route
              path="/vip/overview"
              element={
                <ProtectedAccountRoute allowedTypes={['vip']}>
                  <VipOverviewPage />
                </ProtectedAccountRoute>
              }
            />
            <Route
              path="/student-preview"
              element={
                <ProtectedAccountRoute allowedTypes={['vip']}>
                  <PreviewPage type="student" />
                </ProtectedAccountRoute>
              }
            />
            <Route
              path="/couples-preview"
              element={
                <ProtectedAccountRoute allowedTypes={['vip']}>
                  <PreviewPage type="couples" />
                </ProtectedAccountRoute>
              }
            />
            <Route
              path="/our-room"
              element={
                <ProtectedRoomRoute>
                  <PrivateRoomPage />
                </ProtectedRoomRoute>
              }
            />
            <Route path="/access-denied" element={<AccessDeniedPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

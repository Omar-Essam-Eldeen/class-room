import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ProtectedRoomRoute from './components/ProtectedRoomRoute'
import AccessDeniedPage from './pages/AccessDeniedPage'
import AccessPage from './pages/AccessPage'
import DashboardPage from './pages/DashboardPage'
import FeaturesPage from './pages/FeaturesPage'
import LandingPage from './pages/LandingPage'
import PrivateRoomPage from './pages/PrivateRoomPage'
import { ensureDemoData } from './data/storage'
import './App.css'

function App() {
  useEffect(() => {
    ensureDemoData()
  }, [])

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/access" element={<AccessPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
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
  )
}

export default App

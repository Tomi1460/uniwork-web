import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import './index.css'
import { AuthProvider, useAuth } from './context/AuthContext'

// Landing sections (all assembled in LandingPage)
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import Solutions from './components/Solutions'
import DownloadApp from './components/DownloadApp'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'

// App pages (lazy loaded)
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardCliente = lazy(() => import('./pages/app/DashboardCliente'))
const DashboardPrestador = lazy(() => import('./pages/app/DashboardPrestador'))

import ProtectedRoute from './components/ProtectedRoute'

// ---- Landing Page ----
function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <Solutions />
        <DownloadApp />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

// ---- Loading Fallback ----
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-dark)', flexDirection: 'column', gap: '1rem'
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid rgba(108,99,255,0.3)',
        borderTopColor: '#6c63ff',
        borderRadius: '50%',
        animation: 'rotate-slow 0.8s linear infinite'
      }}></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cargando...</p>
    </div>
  )
}

// ---- Smart Redirect after login ----
function AppRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.email === 'admin@uniwork.com.ar') return <Navigate to="/app/admin" replace />
  if (user.user_metadata?.role === 'provider') return <Navigate to="/app/dashboard-prestador" replace />
  return <Navigate to="/app/dashboard-cliente" replace />
}

// ---- Root App ----
function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />

            {/* App redirect */}
            <Route path="/app" element={<AppRedirect />} />

            {/* Client dashboard */}
            <Route
              path="/app/dashboard-cliente"
              element={
                <ProtectedRoute>
                  <DashboardCliente />
                </ProtectedRoute>
              }
            />

            {/* Provider dashboard */}
            <Route
              path="/app/dashboard-prestador"
              element={
                <ProtectedRoute>
                  <DashboardPrestador />
                </ProtectedRoute>
              }
            />

            {/* Catch all → back to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App

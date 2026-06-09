import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AppLayout.css'

const clientNav = [
  { path: '/app/dashboard-cliente', icon: '🏠', label: 'Inicio' },
  { path: '/app/servicios', icon: '🔍', label: 'Buscar servicios' },
  { path: '/app/mis-servicios', icon: '📋', label: 'Mis solicitudes' },
  { path: '/app/pagos', icon: '💳', label: 'Pagos' },
  { path: '/app/perfil', icon: '👤', label: 'Mi perfil' },
]

const providerNav = [
  { path: '/app/dashboard-prestador', icon: '📊', label: 'Panel' },
  { path: '/app/ordenes', icon: '📋', label: 'Mis órdenes' },
  { path: '/app/clientes', icon: '👥', label: 'Clientes' },
  { path: '/app/ganancias', icon: '💰', label: 'Ganancias' },
  { path: '/app/configuracion', icon: '⚙️', label: 'Configuración' },
]

export default function AppLayout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const isProvider = user?.user_metadata?.role === 'provider'
  const navItems = isProvider ? providerNav : clientNav
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const userInitial = userName.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="app-sidebar__header">
          <button className="app-sidebar__logo" onClick={() => navigate('/')}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="url(#al1)" strokeWidth="2"/>
              <path d="M8 10l6 8 6-8" stroke="url(#al2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="al1" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#ff6584"/></linearGradient>
                <linearGradient id="al2" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#ff6584"/></linearGradient>
              </defs>
            </svg>
            {sidebarOpen && <span className="app-sidebar__logo-text">Uni<span className="text-gradient">work</span></span>}
          </button>
          <button
            className="app-sidebar__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Colapsar' : 'Expandir'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div className="app-sidebar__role-badge">
            <span className="glow-dot"></span>
            {isProvider ? 'Modo Prestador' : 'Modo Cliente'}
          </div>
        )}

        {/* Nav items */}
        <nav className="app-sidebar__nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`app-sidebar__nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="app-sidebar__nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="app-sidebar__nav-label">{item.label}</span>}
              {!sidebarOpen && location.pathname === item.path && <span className="app-sidebar__active-dot"></span>}
            </button>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="app-sidebar__footer">
          <div className="app-sidebar__user">
            <div className="app-sidebar__avatar">{userInitial}</div>
            {sidebarOpen && (
              <div className="app-sidebar__user-info">
                <span className="app-sidebar__user-name">{userName}</span>
                <span className="app-sidebar__user-role">{isProvider ? 'Prestador' : 'Cliente'}</span>
              </div>
            )}
          </div>
          <button
            className="app-sidebar__signout"
            onClick={handleSignOut}
            title="Cerrar sesión"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        {/* Top bar */}
        <header className="app-topbar">
          <div className="app-topbar__left">
            <button className="app-topbar__menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          </div>
          <div className="app-topbar__right">
            <div className="app-topbar__user">
              <div className="app-topbar__avatar">{userInitial}</div>
              <span className="app-topbar__name">{userName}</span>
            </div>
          </div>
        </header>
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  )
}

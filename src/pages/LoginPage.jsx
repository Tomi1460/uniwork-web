import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'
import appServiciosImg from '../assets/app_servicios.png'
import appPrestadorImg from '../assets/app_prestador.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, signIn, signUp, getRedirectPath } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [role, setRole] = useState('client') // 'client' | 'provider'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Already logged in → redirect
  useEffect(() => {
    if (user) navigate(getRedirectPath(), { replace: true })
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (mode === 'forgot') {
        const { error } = await import('../supabaseClient').then(m =>
          m.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          })
        )
        if (error) throw error
        setSuccessMsg('Te enviamos un enlace de recuperación. Revisa tu correo.')
        return
      }

      if (mode === 'signup') {
        if (fullName.trim().length < 3) throw new Error('El nombre debe tener al menos 3 caracteres.')
        const { data, error } = await signUp(email, password, fullName.trim(), role)
        if (error) throw error
        if (data.session) {
          navigate(getRedirectPath(data.user), { replace: true })
        } else {
          setSuccessMsg('¡Cuenta creada! Revisa tu correo para confirmarla y luego inicia sesión.')
          setMode('login')
        }
      } else {
        const { data, error } = await signIn(email, password)
        if (error) throw error
        navigate(getRedirectPath(data.user), { replace: true })
      }
    } catch (err) {
      console.error(err)
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos.')
      } else if (err.message?.includes('User already registered')) {
        setError('Este email ya está registrado. Inicia sesión.')
      } else {
        setError(err.message || 'Ha ocurrido un error. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    login: 'Bienvenido de nuevo',
    signup: 'Crear cuenta',
    forgot: 'Recuperar contraseña',
  }

  const subtitles = {
    login: 'Ingresa para gestionar tus servicios',
    signup: 'Únete a Uniwork y empieza a trabajar',
    forgot: 'Te enviaremos un enlace seguro por email',
  }

  return (
    <div className="login-page">
      {/* Left side — branding */}
      <div className="login-page__left">
        <div className="login-page__brand">
          <button className="login-page__logo" onClick={() => navigate('/')}>
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="url(#lg1)" strokeWidth="2"/>
              <path d="M8 10l6 8 6-8" stroke="url(#lg2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#ff6584"/></linearGradient>
                <linearGradient id="lg2" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#ff6584"/></linearGradient>
              </defs>
            </svg>
            Uni<span className="text-gradient">work</span>
          </button>
          <h2 className="login-page__left-headline">
            Tu plataforma de<br /><span className="text-gradient">trabajo inteligente</span>
          </h2>
          <p className="login-page__left-desc">
            Conecta con clientes, gestiona tus servicios y cobra de forma segura. Todo en un solo lugar.
          </p>
          <div className="login-page__screenshots">
            <img src={appServiciosImg} alt="App servicios" className="login-page__ss login-page__ss--1" />
            <img src={appPrestadorImg} alt="App prestador" className="login-page__ss login-page__ss--2" />
          </div>
        </div>
        <div className="login-page__left-orb1"></div>
        <div className="login-page__left-orb2"></div>
      </div>

      {/* Right side — form */}
      <div className="login-page__right">
        <div className="login-page__form-container">
          <button className="login-page__back" onClick={() => navigate('/')}>
            ← Volver al inicio
          </button>

          <div className="login-page__form-header">
            <h1 className="heading-md">{titles[mode]}</h1>
            <p className="login-page__subtitle">{subtitles[mode]}</p>
          </div>

          <form className="login-page__form" onSubmit={handleSubmit}>
            {error && <div className="login-page__alert login-page__alert--error">{error}</div>}
            {successMsg && <div className="login-page__alert login-page__alert--success">{successMsg}</div>}

            {mode === 'signup' && (
              <>
                <div className="login-page__field">
                  <label htmlFor="fullName" className="login-page__label">Nombre completo</label>
                  <input
                    id="fullName"
                    className="login-page__input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    required
                  />
                </div>
                <div className="login-page__field">
                  <label className="login-page__label">Tipo de cuenta</label>
                  <div className="login-page__roles">
                    <label className={`login-page__role ${role === 'client' ? 'active' : ''}`}>
                      <input type="radio" name="role" value="client" checked={role === 'client'} onChange={(e) => setRole(e.target.value)} style={{ display: 'none' }} />
                      <span className="login-page__role-icon">👤</span>
                      <span className="login-page__role-name">Quiero contratar</span>
                      <span className="login-page__role-desc">Busco servicios</span>
                    </label>
                    <label className={`login-page__role ${role === 'provider' ? 'active' : ''}`}>
                      <input type="radio" name="role" value="provider" checked={role === 'provider'} onChange={(e) => setRole(e.target.value)} style={{ display: 'none' }} />
                      <span className="login-page__role-icon">💼</span>
                      <span className="login-page__role-name">Quiero trabajar</span>
                      <span className="login-page__role-desc">Ofrezco servicios</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="login-page__field">
              <label htmlFor="email" className="login-page__label">Correo electrónico</label>
              <input
                id="email"
                className="login-page__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div className="login-page__field">
                <div className="login-page__label-row">
                  <label htmlFor="password" className="login-page__label">Contraseña</label>
                  {mode === 'login' && (
                    <button type="button" className="login-page__forgot-link" onClick={() => setMode('forgot')}>
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  className="login-page__input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button type="submit" className="login-page__submit btn btn-primary" disabled={loading}>
              {loading ? <span className="login-page__spinner"></span> : mode === 'login' ? 'Iniciar Sesión' : mode === 'signup' ? 'Crear Cuenta' : 'Enviar enlace'}
            </button>
          </form>

          <div className="login-page__switch">
            {mode === 'login' ? (
              <p>¿No tienes cuenta? <button type="button" className="login-page__switch-btn" onClick={() => setMode('signup')}>Regístrate</button></p>
            ) : (
              <p>¿Ya tienes cuenta? <button type="button" className="login-page__switch-btn" onClick={() => setMode('login')}>Inicia sesión</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

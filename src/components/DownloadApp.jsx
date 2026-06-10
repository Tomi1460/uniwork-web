import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './DownloadApp.css'

// TODO: Replace with your actual Play Store URL when available
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.uniwork.app'

import appServicios from '../assets/app_servicios.png'
import appPrestador from '../assets/app_prestador.png'
import appChat from '../assets/app_chat.png'
import appPagos from '../assets/app_pagos.png'

export default function DownloadApp() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [activeScreen, setActiveScreen] = useState(0)
  const navigate = useNavigate()

  const screens = [
    { src: appServicios, label: 'Servicios disponibles', desc: 'Explora y contrata prestadores cercanos' },
    { src: appPrestador, label: 'Panel del prestador', desc: 'Gestiona órdenes y ganancias' },
    { src: appChat, label: 'Chat integrado', desc: 'Coordina con clientes en tiempo real' },
  ]

  return (
    <section id="download" className="section download">
      {/* Background */}
      <div className="download__bg">
        <div className="download__orb-1"></div>
        <div className="download__orb-2"></div>
      </div>

      <div className="container">
        <div className="download__header">
          <div className="section-label">
            <span className="glow-dot"></span>
            Elige cómo empezar
          </div>
          <h2 className="heading-lg">
            Úsalo como <span className="text-gradient">prefieras</span>
          </h2>
          <p className="download__subtitle">
            Estamos buscando a nuestros <strong>primeros prestadores verificados</strong> y <strong>clientes pioneros</strong> en Paraná, Entre Ríos. Contáctanos para participar de nuestra fase de prueba cerrada.
          </p>
        </div>

        <div className="download__cards">

          {/* Play Store Card */}
          <div
            id="card-playstore"
            className={`download__card download__card--android ${hoveredCard === 'android' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard('android')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="download__card-glow download__card-glow--android"></div>
            <div className="download__card-badge">Disponible en</div>
            <div className="download__card-icon">
              {/* Google Play Icon SVG */}
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <path d="M3.18 23.2c-.28-.15-.48-.4-.57-.7L12 12.8l2.6 2.6-11.42 7.8z" fill="url(#gp1)"/>
                <path d="M20.82 14.14c.35-.2.56-.56.56-.95s-.21-.75-.56-.95L17.5 10.5l-2.9 2.9 2.9 2.9 3.32-2.16z" fill="url(#gp2)"/>
                <path d="M3.18.8c-.28.15-.48.4-.57.7L12 11.2l2.6-2.6L3.18.8z" fill="url(#gp3)"/>
                <path d="M12 12L3.18 3.2c.09-.3.29-.55.57-.7L14.6 9.6 12 12z" fill="url(#gp4)"/>
                <defs>
                  <linearGradient id="gp1" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#00C4FF"/><stop offset="1" stopColor="#007CFF"/></linearGradient>
                  <linearGradient id="gp2" x1="0" y1="0" x2="24" y2="0"><stop stopColor="#FFD400"/><stop offset="1" stopColor="#FF9000"/></linearGradient>
                  <linearGradient id="gp3" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#43E97B"/><stop offset="1" stopColor="#00C070"/></linearGradient>
                  <linearGradient id="gp4" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#FF5252"/><stop offset="1" stopColor="#FF1744"/></linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="heading-md download__card-title">Aplicación Móvil</h3>
            <p className="download__card-desc">
              Descarga la app en tu dispositivo Android y lleva Uniwork contigo a donde vayas. Notificaciones push, acceso offline y más.
            </p>
            <ul className="download__features">
              <li>✅ Notificaciones en tiempo real</li>
              <li>✅ Interfaz optimizada para móvil</li>
              <li>✅ Acceso rápido con biometría</li>
              <li>✅ Funciones exclusivas del app</li>
            </ul>
            <a
              id="btn-playstore"
              href="https://wa.link/92v8k3"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg download__btn"
              style={{ padding: '1rem', height: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Contáctanos por WhatsApp
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.9 }}>
                Solicita acceso a la fase de prueba o verifícate como prestador
              </span>
            </a>
            <div className="download__store-badge">
              <svg viewBox="0 0 135 40" width="135" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="135" height="40" rx="8" fill="#1a1a2e"/>
                <rect x=".5" y=".5" width="134" height="39" rx="7.5" stroke="rgba(255,255,255,0.2)"/>
                <text x="35" y="15" fill="white" fontSize="8" fontFamily="Inter,sans-serif" opacity=".8">GET IT ON</text>
                <text x="35" y="29" fill="white" fontSize="14" fontFamily="Outfit,sans-serif" fontWeight="700">Google Play</text>
                <circle cx="16" cy="20" r="10" fill="url(#sg1)"/>
                <defs><linearGradient id="sg1" x1="6" y1="10" x2="26" y2="30"><stop stopColor="#43E97B"/><stop offset="1" stopColor="#007CFF"/></linearGradient></defs>
              </svg>
            </div>
          </div>

          {/* VS Divider */}
          <div className="download__vs">
            <div className="download__vs-line"></div>
            <span className="download__vs-text">ó</span>
            <div className="download__vs-line"></div>
          </div>

          {/* Web App Card */}
          <div
            id="card-webapp"
            className={`download__card download__card--web ${hoveredCard === 'web' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard('web')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="download__card-glow download__card-glow--web"></div>
            <div className="download__card-badge">Acceso inmediato</div>
            <div className="download__card-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="url(#web1)" strokeWidth="1.5"/>
                <path d="M2 12h20M12 2c-3 3-4.5 6-4.5 10S9 19 12 22M12 2c3 3 4.5 6 4.5 10S15 19 12 22" stroke="url(#web2)" strokeWidth="1.5"/>
                <defs>
                  <linearGradient id="web1" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#ff6584"/></linearGradient>
                  <linearGradient id="web2" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#ff6584"/></linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="heading-md download__card-title">Versión Web</h3>
            <p className="download__card-desc">
              Inicia sesión directamente desde tu navegador y usa Uniwork al instante. Sin descargas, sin instalación. Solo necesitas tu cuenta.
            </p>
            <ul className="download__features">
              <li>✅ Acceso instantáneo desde cualquier PC</li>
              <li>✅ Sin necesidad de instalar nada</li>
              <li>✅ Misma cuenta, todos tus datos</li>
              <li>✅ Pantalla grande para más productividad</li>
            </ul>
            <button
              id="btn-webapp-login"
              className="btn btn-outline btn-lg download__btn"
              onClick={() => navigate('/login')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Iniciar sesión en la Web
            </button>
            <p className="download__register-hint">
              ¿No tienes cuenta?{' '}
              <button className="download__register-link" style={{background:'none',border:'none',cursor:'pointer',padding:0,fontSize:'inherit'}} onClick={() => navigate('/login')}>Regístrate gratis →</button>
            </p>
          </div>
        </div>

        {/* Synced Indicator */}
        <div className="download__sync">
          <div className="glow-dot"></div>
          <span>Tu cuenta se sincroniza en todos tus dispositivos en tiempo real</span>
        </div>

        {/* App Screenshots Gallery */}
        <div className="download__gallery">
          <div className="download__gallery-header">
            <h3 className="heading-sm">Así se ve la app</h3>
            <div className="download__gallery-tabs">
              {screens.map((s, i) => (
                <button
                  key={i}
                  className={`download__gallery-tab ${activeScreen === i ? 'active' : ''}`}
                  onClick={() => setActiveScreen(i)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="download__gallery-view">
            <div className="download__gallery-phone">
              <img
                src={screens[activeScreen].src}
                alt={screens[activeScreen].label}
                className="download__gallery-img"
              />
            </div>
            <div className="download__gallery-info">
              <h4 className="heading-sm" style={{color:'var(--text-primary)'}}>{screens[activeScreen].label}</h4>
              <p style={{color:'var(--text-secondary)', marginTop:'0.5rem'}}>{screens[activeScreen].desc}</p>
              <div style={{display:'flex',gap:'0.5rem',marginTop:'1.5rem',flexWrap:'wrap'}}>
                {screens.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveScreen(i)}
                    style={{
                      width: i === activeScreen ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: i === activeScreen ? 'var(--color-primary)' : 'var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

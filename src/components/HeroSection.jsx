import { CheckCircle, Rocket, Hand } from 'lucide-react'
import './HeroSection.css'

export default function HeroSection() {
  const scrollTo = (id) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="hero">
      {/* Background orbs */}
      <div className="hero__bg">
        <div className="hero__orb hero__orb--1"></div>
        <div className="hero__orb hero__orb--2"></div>
        <div className="hero__orb hero__orb--3"></div>
        <div className="hero__grid-overlay"></div>
      </div>

      <div className="hero__inner container">
        {/* Badge */}
        <div className="hero__badge animate-fadeInUp delay-1">
          <span className="glow-dot"></span>
          Etapa de prueba cerrada
        </div>

        {/* Headline */}
        <h1 className="heading-xl hero__title animate-fadeInUp delay-2">
          Resolvé problemas en el hogar de forma<br />
          <span className="text-gradient">rápida y segura</span>
        </h1>

        {/* Sub */}
        <p className="hero__subtitle animate-fadeInUp delay-3">
          Uniwork conecta personas con prestadores de oficios de confianza. Estamos en fase de prueba en <strong>Paraná, Entre Ríos</strong>, verificando a nuestros primeros prestadores y sumando clientes para iniciar.
        </p>

        {/* CTA Buttons */}
        <div className="hero__ctas animate-fadeInUp delay-4">
          <button
            id="cta-download"
            className="btn btn-primary btn-lg"
            onClick={() => scrollTo('#download')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M8 12l4 4 4-4M12 8v8"/>
            </svg>
            Descargar App
          </button>
        </div>
      </div>

      {/* Floating Cards Visual */}
      <div className="hero__visual animate-fadeInUp delay-3">
        <div className="hero__phone-mockup animate-float">
          <div className="mockup__screen">
            <div className="mockup__header">
              <div className="mockup__avatar"></div>
              <div>
                <div className="mockup__name">Hola, Juan <Hand size={14} style={{ display: 'inline', verticalAlign: 'middle', color: '#FFD700' }} /></div>
                <div className="mockup__sub">Nuevas solicitudes de clientes</div>
              </div>
            </div>
            <div className="mockup__cards">
              {['Plomería General', 'Instalación Eléctrica', 'Reparación de AA'].map((job, i) => (
                <div key={i} className="mockup__job-card">
                  <div className="mockup__job-dot" style={{ background: i === 0 ? '#6c63ff' : i === 1 ? '#43e97b' : '#ff6584' }}></div>
                  <span>{job}</span>
                  <div className="mockup__job-badge">Nuevo</div>
                </div>
              ))}
            </div>
            <div className="mockup__earnings">
              <span className="mockup__earnings-label">Ganancias este mes</span>
              <span className="mockup__earnings-value text-gradient-green">$45,000</span>
            </div>
          </div>
        </div>

        {/* Floating notification */}
        <div className="hero__notif hero__notif--1">
          <CheckCircle size={20} className="hero__notif-icon hero__notif-icon--success" />
          <div>
            <p className="hero__notif-title">Servicio aceptado</p>
            <p className="hero__notif-sub">Plomero en camino</p>
          </div>
        </div>
        <div className="hero__notif hero__notif--2">
          <Rocket size={20} className="hero__notif-icon hero__notif-icon--rocket" />
          <div>
            <p className="hero__notif-title">Nuevo cliente</p>
            <p className="hero__notif-sub">Solicitud recibida</p>
          </div>
        </div>
      </div>
    </section>
  )
}

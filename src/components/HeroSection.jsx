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
          Disponible ahora en Android &amp; Web
        </div>

        {/* Headline */}
        <h1 className="heading-xl hero__title animate-fadeInUp delay-2">
          El trabajo del futuro,<br />
          <span className="text-gradient">disponible hoy</span>
        </h1>

        {/* Sub */}
        <p className="hero__subtitle animate-fadeInUp delay-3">
          Uniwork conecta empresas con trabajadores independientes. Publica proyectos, gestiona servicios, 
          y colabora en tiempo real — desde tu teléfono o directamente desde la web.
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
          <button
            id="cta-webapp"
            className="btn btn-secondary btn-lg"
            onClick={() => scrollTo('#download')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            Usar desde la web
          </button>
        </div>

        {/* Stats */}
        <div className="hero__stats animate-fadeInUp delay-5">
          {[
            { value: '10K+', label: 'Usuarios activos' },
            { value: '50K+', label: 'Servicios gestionados' },
            { value: '98%', label: 'Satisfacción' },
            { value: '24/7', label: 'Disponibilidad' },
          ].map((stat) => (
            <div key={stat.label} className="hero__stat">
              <span className="hero__stat-value">{stat.value}</span>
              <span className="hero__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cards Visual */}
      <div className="hero__visual animate-fadeInUp delay-3">
        <div className="hero__phone-mockup animate-float">
          <div className="mockup__screen">
            <div className="mockup__header">
              <div className="mockup__avatar"></div>
              <div>
                <div className="mockup__name">Hola, Carlos 👋</div>
                <div className="mockup__sub">Tienes 3 nuevos trabajos</div>
              </div>
            </div>
            <div className="mockup__cards">
              {['Diseño UI/UX', 'Desarrollo Web', 'Consultoría'].map((job, i) => (
                <div key={i} className="mockup__job-card">
                  <div className="mockup__job-dot" style={{ background: i === 0 ? '#6c63ff' : i === 1 ? '#43e97b' : '#ff6584' }}></div>
                  <span>{job}</span>
                  <div className="mockup__job-badge">Nuevo</div>
                </div>
              ))}
            </div>
            <div className="mockup__earnings">
              <span className="mockup__earnings-label">Ganancias este mes</span>
              <span className="mockup__earnings-value text-gradient-green">$2,840</span>
            </div>
          </div>
        </div>

        {/* Floating notification */}
        <div className="hero__notif hero__notif--1">
          <span>✅</span>
          <div>
            <p className="hero__notif-title">Servicio completado</p>
            <p className="hero__notif-sub">Pago recibido: $350</p>
          </div>
        </div>
        <div className="hero__notif hero__notif--2">
          <span>🚀</span>
          <div>
            <p className="hero__notif-title">Nuevo cliente</p>
            <p className="hero__notif-sub">Te ha contactado</p>
          </div>
        </div>
      </div>
    </section>
  )
}

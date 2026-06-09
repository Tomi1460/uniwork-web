import './Footer.css'

const footerLinks = {
  'Producto': [
    { label: 'Características', href: '#about' },
    { label: 'Soluciones', href: '#solutions' },
    { label: 'Precios', href: '#pricing' },
    { label: 'App móvil', href: '#download' },
  ],
  'Empresa': [
    { label: 'Sobre nosotros', href: '#about' },
    { label: 'Blog', href: '#' },
    { label: 'Trabaja con nosotros', href: '#contact' },
    { label: 'Prensa', href: '#' },
  ],
  'Soporte': [
    { label: 'Centro de ayuda', href: '#' },
    { label: 'Contacto', href: '#contact' },
    { label: 'Estado del servicio', href: '#' },
    { label: 'Comunidad', href: '#' },
  ],
  'Legal': [
    { label: 'Privacidad', href: '#' },
    { label: 'Términos de uso', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
}

export default function Footer() {
  const scrollTo = (href) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container">
          <div className="footer__layout">
            {/* Brand */}
            <div className="footer__brand">
              <div className="footer__logo">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="13" stroke="url(#fg1)" strokeWidth="2"/>
                  <path d="M8 10l6 8 6-8" stroke="url(#fg2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="fg1" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#ff6584"/></linearGradient>
                    <linearGradient id="fg2" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#ff6584"/></linearGradient>
                  </defs>
                </svg>
                <span className="footer__logo-text">Uni<span className="text-gradient">work</span></span>
              </div>
              <p className="footer__tagline">
                El futuro del trabajo independiente, hoy. Conectamos talento con oportunidades en toda Latinoamérica.
              </p>
              <div className="footer__badges">
                <a href="#download" className="footer__store-btn" onClick={(e) => { e.preventDefault(); scrollTo('#download') }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17.9 5L7 11.5v1L17.9 19l2.6-1.5v-11L17.9 5zM5 19.5V4.5L4 4 3 4.5v15L4 20l1-.5z" fill="#43e97b"/>
                  </svg>
                  Play Store
                </a>
                <a href="#download" className="footer__store-btn" onClick={(e) => { e.preventDefault(); scrollTo('#download') }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2c-3 3-4.5 6-4.5 10S9 19 12 22M12 2c3 3 4.5 6 4.5 10S15 19 12 22"/>
                  </svg>
                  Versión Web
                </a>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="footer__col">
                <h4 className="footer__col-title">{group}</h4>
                <ul className="footer__links">
                  {links.map(link => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="footer__link"
                        onClick={(e) => { if (link.href.startsWith('#')) { e.preventDefault(); scrollTo(link.href) } }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-inner">
            <p className="footer__copyright">© {new Date().getFullYear()} Uniwork. Todos los derechos reservados.</p>
            <p className="footer__made">
              Hecho con ❤️ para Latinoamérica
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

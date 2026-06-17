import { Heart } from 'lucide-react'
import './Footer.css'

const footerLinks = {
  'Producto': [
    { label: 'Características', href: '#about' },
    { label: 'Soluciones', href: '#solutions' },
    { label: 'App móvil', href: '#download' },
  ],
  'Empresa': [
    { label: 'Sobre nosotros', href: '#about' },
    { label: 'Trabaja con nosotros', href: '#contact' },
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
                <img
                  src="/uniwork-logo.png"
                  alt="Uniwork"
                  className="footer__logo-img"
                />
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
              Hecho con <Heart size={14} className="footer__heart-icon" /> para Latinoamérica
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

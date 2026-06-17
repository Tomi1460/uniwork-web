import { useState, useEffect } from 'react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Soluciones', href: '#solutions' },
    { label: 'Contacto', href: '#contact' },
  ]

  const scrollTo = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav id="navbar" className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <a href="#" className="navbar__logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <img
            src="/uniwork-logo.png"
            alt="Uniwork"
            className="navbar__logo-img"
          />
        </a>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {navLinks.map(link => (
            <li key={link.href}>
              <button className="navbar__link" onClick={() => scrollTo(link.href)}>
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="navbar__actions">
          <a href="#login" className="btn btn-secondary btn-sm" onClick={(e) => { e.preventDefault(); scrollTo('#download') }}>
            Iniciar sesión
          </a>
          <a href="#download" className="btn btn-primary btn-sm" onClick={(e) => { e.preventDefault(); scrollTo('#download') }}>
            Empieza gratis
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          id="menu-toggle"
          className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <button key={link.href} className="navbar__mobile-link" onClick={() => scrollTo(link.href)}>
            {link.label}
          </button>
        ))}
        <div className="navbar__mobile-actions">
          <button className="btn btn-secondary" onClick={() => scrollTo('#download')}>Iniciar sesión</button>
          <button className="btn btn-primary" onClick={() => scrollTo('#download')}>Empieza gratis</button>
        </div>
      </div>
    </nav>
  )
}

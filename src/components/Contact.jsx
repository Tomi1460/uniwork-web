import './Contact.css'

const contactInfo = [
  { icon: '📧', label: 'Email', value: 'uniworkmarket@gmail.com', href: 'mailto:uniworkmarket@gmail.com' },
  { icon: '📱', label: 'WhatsApp', value: 'Consultanos por WhatsApp', href: 'https://wa.link/92v8k3' },
  { icon: '📍', label: 'Argentina', value: 'Paraná, Argentina', href: '#' },
]

const socialLinks = [
  { label: 'Instagram', icon: '📸', href: 'https://www.instagram.com/uniwork.arg?igsh=MWJlNXE1MWR1cWppdw%3D%3D&utm_source=qr' },
  { label: 'TikTok', icon: '🎵', href: 'https://www.tiktok.com/@uniwork.arg?_r=1&_t=ZS-974vYGLMm2r' },
]

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="contact__bg">
        <div className="contact__orb"></div>
      </div>

      <div className="container">
        <div className="contact__centered">

          {/* Header */}
          <div className="contact__header">
            <div className="section-label">
              <span className="glow-dot"></span>
              Contacto
            </div>
            <h2 className="heading-lg">
              ¿Tenés alguna <span className="text-gradient">consulta?</span>
            </h2>
            <p className="contact__subtitle">
              Estamos en desarrollo activo. Si sos prestador de servicios y querés ser de los primeros en sumarte,
              o tenés alguna pregunta sobre Uniwork, escribinos.
            </p>
          </div>

          {/* Contact cards */}
          <div className="contact__cards">
            {contactInfo.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="contact__card"
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                <span className="contact__card-icon">{item.icon}</span>
                <div>
                  <div className="contact__card-label">{item.label}</div>
                  <div className="contact__card-value">{item.value}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="contact__social">
            <p className="contact__social-label">Seguinos en redes</p>
            <div className="contact__social-links">
              {socialLinks.map(s => (
                <a key={s.label} href={s.href} className="contact__social-link" title={s.label} target="_blank" rel="noopener noreferrer">
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

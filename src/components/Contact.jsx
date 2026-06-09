import { useState } from 'react'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'success' | 'error'

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    // TODO: Integrate with your backend API or email service (e.g., Resend, SendGrid)
    // For now, we simulate a successful submission
    await new Promise(r => setTimeout(r, 1500))
    setStatus('success')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  const contactInfo = [
    { icon: '📧', label: 'Email', value: 'hola@uniwork.app', href: 'mailto:hola@uniwork.app' },
    { icon: '🌐', label: 'Web', value: 'www.uniwork.app', href: 'https://www.uniwork.app' },
    { icon: '📱', label: 'WhatsApp', value: '+1 (555) 000-0000', href: 'https://wa.me/15550000000' },
  ]

  const socialLinks = [
    { label: 'Instagram', icon: '📸', href: '#' },
    { label: 'LinkedIn', icon: '💼', href: '#' },
    { label: 'Twitter/X', icon: '🐦', href: '#' },
    { label: 'TikTok', icon: '🎵', href: '#' },
  ]

  return (
    <section id="contact" className="section contact">
      <div className="contact__bg">
        <div className="contact__orb"></div>
      </div>

      <div className="container">
        <div className="contact__layout">
          {/* Info Side */}
          <div className="contact__info">
            <div className="section-label">
              <span className="glow-dot"></span>
              Contáctanos
            </div>
            <h2 className="heading-lg contact__title">
              Hablemos sobre <span className="text-gradient">tu proyecto</span>
            </h2>
            <p className="contact__subtitle">
              ¿Tienes preguntas, quieres hacer una demo o necesitas soporte? Estamos aquí para ayudarte. 
              Respondemos en menos de 24 horas.
            </p>

            <div className="contact__info-items">
              {contactInfo.map(item => (
                <a key={item.label} href={item.href} className="contact__info-item" target="_blank" rel="noopener noreferrer">
                  <span className="contact__info-icon">{item.icon}</span>
                  <div>
                    <div className="contact__info-label">{item.label}</div>
                    <div className="contact__info-value">{item.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="contact__social">
              <p className="contact__social-label">Síguenos</p>
              <div className="contact__social-links">
                {socialLinks.map(s => (
                  <a key={s.label} href={s.href} className="contact__social-link" title={s.label} target="_blank" rel="noopener noreferrer">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact__form-wrapper">
            <form id="contact-form" className="contact__form" onSubmit={handleSubmit}>
              <div className="contact__form-row">
                <div className="contact__field">
                  <label htmlFor="name" className="contact__label">Nombre completo</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="contact__input"
                    placeholder="Juan García"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="contact__field">
                  <label htmlFor="email" className="contact__label">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="contact__input"
                    placeholder="juan@empresa.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="contact__field">
                <label htmlFor="subject" className="contact__label">Asunto</label>
                <select id="subject" name="subject" className="contact__input contact__select" value={form.subject} onChange={handleChange} required>
                  <option value="">Selecciona un tema...</option>
                  <option value="demo">Quiero una demo</option>
                  <option value="pricing">Preguntas sobre precios</option>
                  <option value="support">Soporte técnico</option>
                  <option value="partnership">Alianzas y partnership</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="contact__field">
                <label htmlFor="message" className="contact__label">Mensaje</label>
                <textarea
                  id="message"
                  name="message"
                  className="contact__input contact__textarea"
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {status === 'success' ? (
                <div className="contact__success">
                  <span>✅</span>
                  <span>¡Mensaje enviado! Te responderemos pronto.</span>
                </div>
              ) : (
                <button
                  id="btn-send-message"
                  type="submit"
                  className="btn btn-primary btn-lg contact__submit"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <>
                      <span className="contact__spinner"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar mensaje
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

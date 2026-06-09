import './ValueProposition.css'

const values = [
  {
    number: '01',
    title: 'Todo en uno',
    desc: 'No más saltar entre apps. Gestiona servicios, chatea con clientes, cobra y analiza tu negocio desde una sola plataforma unificada.',
    color: '#6c63ff',
  },
  {
    number: '02',
    title: 'Tiempo real, siempre',
    desc: 'Actualizaciones instantáneas. Cuando alguien acepta tu servicio, lo sabrás en segundos. Sin retrasos, sin confusiones.',
    color: '#ff6584',
  },
  {
    number: '03',
    title: 'Web + Móvil',
    desc: 'Usa Uniwork desde tu teléfono Android o directamente desde el navegador. Tu cuenta se sincroniza en todos tus dispositivos automáticamente.',
    color: '#43e97b',
  },
  {
    number: '04',
    title: 'Sin complicaciones',
    desc: 'Interfaz intuitiva diseñada para que cualquier persona pueda usarla desde el primer día, sin curva de aprendizaje.',
    color: '#f59e0b',
  },
]

const testimonials = [
  {
    name: 'María González',
    role: 'Diseñadora Freelance',
    text: 'Uniwork me permitió triplicar mis clientes en 3 meses. Todo el proceso de cotización, coordinación y cobro es increíblemente simple.',
    avatar: 'MG',
    color: '#6c63ff',
  },
  {
    name: 'Carlos Ruíz',
    role: 'CEO, TechStartup Co.',
    text: 'Gestionamos 20+ freelancers con Uniwork y nos ahorra horas semanales en coordinación. Indispensable para nuestro equipo.',
    avatar: 'CR',
    color: '#ff6584',
  },
  {
    name: 'Luisa Mendoza',
    role: 'Desarrolladora Web',
    text: 'La mejor plataforma para trabajadores independientes. Los pagos son seguros y el soporte siempre está disponible.',
    avatar: 'LM',
    color: '#43e97b',
  },
]

export default function ValueProposition() {
  return (
    <section id="value" className="section value">
      <div className="container">
        {/* Header */}
        <div className="value__header">
          <div className="section-label">
            <span className="glow-dot"></span>
            Por qué Uniwork
          </div>
          <h2 className="heading-lg">
            La ventaja <span className="text-gradient">que marca la diferencia</span>
          </h2>
          <p className="value__subtitle">
            No solo somos otra plataforma de trabajo. Somos el ecosistema completo diseñado para el futuro del trabajo independiente en Latinoamérica.
          </p>
        </div>

        {/* Value Items */}
        <div className="value__items">
          {values.map((v) => (
            <div key={v.number} className="value__item">
              <div className="value__number" style={{ color: v.color }}>{v.number}</div>
              <div className="value__divider" style={{ background: v.color }}></div>
              <div className="value__text">
                <h3 className="heading-sm value__item-title" style={{ color: v.color }}>{v.title}</h3>
                <p className="value__item-desc">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: '5rem 0' }}></div>

        {/* Testimonials */}
        <div className="value__testimonials-header">
          <h3 className="heading-md">
            Lo que dicen <span className="text-gradient">nuestros usuarios</span>
          </h3>
        </div>
        <div className="value__testimonials grid-3">
          {testimonials.map((t) => (
            <div key={t.name} className="card value__testimonial">
              <div className="value__stars">★★★★★</div>
              <p className="value__quote">"{t.text}"</p>
              <div className="value__author">
                <div className="value__avatar" style={{ background: `linear-gradient(135deg, ${t.color} 0%, #ff6584 100%)` }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="value__author-name">{t.name}</div>
                  <div className="value__author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

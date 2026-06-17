import { useState } from 'react'
import { Home, Wrench, Check } from 'lucide-react'
import './Solutions.css'

const solutions = [
  {
    id: 'clients',
    label: 'Para Clientes',
    Icon: Home,
    color: '#6c63ff',
    headline: 'Resolvé problemas en tu hogar con confianza',
    desc: 'Buscá, compará y contratá prestadores de servicios calificados para tu hogar. Desde plomería hasta electricidad, con total transparencia y seguridad.',
    points: [
      'Buscá prestadores por oficio o cercanía',
      'Revisá calificaciones y reseñas reales',
      'Coordiná fecha y modalidad por chat integrado',
      'Confirmá y calificá el servicio una vez terminado',
      'Soporte y resolución de conflictos',
    ],
  },
  {
    id: 'providers',
    label: 'Para Prestadores',
    Icon: Wrench,
    color: '#43e97b',
    headline: 'Tu oficio, organizado y profesional',
    desc: 'Publicá tus servicios, conseguí clientes sin depender del boca a boca y construí una reputación sólida. Uniwork es la herramienta para profesionalizar tu actividad.',
    points: [
      'Cuidamos tu reputación con calificaciones verificadas',
      'Gestioná solicitudes entrantes y órdenes activas',
      'Comunicación directa con el cliente',
      'Historial de trabajos y ganancias',
      'Los primeros 4 servicios son gratis',
    ],
  },
]

export default function Solutions() {
  const [active, setActive] = useState('clients')
  const sol = solutions.find(s => s.id === active)

  return (
    <section id="solutions" className="section solutions">
      <div className="container">
        <div className="solutions__header">
          <div className="section-label">
            <span className="glow-dot"></span>
            Nuestras Soluciones
          </div>
          <h2 className="heading-lg solutions__title">
            Diseñado para <span className="text-gradient">ambas partes</span>
          </h2>
          <p className="solutions__subtitle">
            Uniwork centraliza la oferta y la demanda, creando un entorno transparente para quienes necesitan un servicio y para quienes lo ofrecen.
          </p>
        </div>

        {/* Tabs */}
        <div className="solutions__tabs" role="tablist">
          {solutions.map(s => (
            <button
              key={s.id}
              id={`tab-${s.id}`}
              role="tab"
              aria-selected={active === s.id}
              className={`solutions__tab ${active === s.id ? 'active' : ''}`}
              onClick={() => setActive(s.id)}
              style={{ '--tab-color': s.color }}
            >
              <s.Icon size={18} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="solutions__panel" key={active}>
          <div className="solutions__content">
            <h3 className="heading-md solutions__panel-title">{sol.headline}</h3>
            <p className="solutions__panel-desc">{sol.desc}</p>
            <ul className="solutions__list">
              {sol.points.map((p, i) => (
                <li key={i} className="solutions__list-item">
                  <Check size={18} className="solutions__check-icon" style={{ color: sol.color }} />
                  {p}
                </li>
              ))}
            </ul>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', background: `linear-gradient(135deg, ${sol.color} 0%, #ff6584 100%)` }}
              onClick={() => {
                const dl = document.querySelector('#download')
                if (dl) dl.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Comenzar ahora →
            </button>
          </div>

          <div className="solutions__visual">
            <div className="solutions__icon-big" style={{ '--sol-color': sol.color }}>
              <sol.Icon size={56} style={{ color: sol.color }} />
            </div>
            <div className="solutions__decorlines">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="solutions__decorline" style={{ '--i': i, '--color': sol.color }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import './Solutions.css'

const solutions = [
  {
    id: 'workers',
    label: 'Para Trabajadores',
    icon: '👤',
    color: '#6c63ff',
    headline: 'Tu carrera, en tus manos',
    desc: 'Accede a miles de oportunidades de trabajo, gestiona tus servicios y cobra de forma segura. Uniwork te da el control total de tu carrera independiente.',
    points: [
      'Crea tu perfil profesional verificado',
      'Recibe solicitudes de trabajo directamente',
      'Chat con clientes en tiempo real',
      'Cobra de forma segura y automática',
      'Rastrea tus ganancias con analítica clara',
    ],
  },
  {
    id: 'companies',
    label: 'Para Empresas',
    icon: '🏢',
    color: '#ff6584',
    headline: 'Talento cuando lo necesitas',
    desc: 'Publica servicios, encuentra al profesional ideal y gestiona todo tu equipo independiente desde un solo panel. Rápido, flexible y sin papeleo.',
    points: [
      'Publica servicios en minutos',
      'Encuentra profesionales verificados',
      'Gestiona múltiples proyectos en paralelo',
      'Panel de administración completo',
      'Historial de servicios y facturación',
    ],
  },
  {
    id: 'teams',
    label: 'Para Equipos',
    icon: '🤝',
    color: '#43e97b',
    headline: 'Colaboración sin fricciones',
    desc: 'Coordina equipos mixtos de empleados y colaboradores externos. Asigna tareas, supervisa avances y mantén todo sincronizado en un solo lugar.',
    points: [
      'Asignación inteligente de tareas',
      'Seguimiento de avances en tiempo real',
      'Notificaciones y alertas automáticas',
      'Integración con tus herramientas actuales',
      'Reportes de desempeño por equipo',
    ],
  },
]

export default function Solutions() {
  const [active, setActive] = useState('workers')
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
            Diseñado para <span className="text-gradient">cada caso de uso</span>
          </h2>
          <p className="solutions__subtitle">
            Ya sea que seas un profesional independiente, una empresa en crecimiento o un equipo que necesita coordinación, Uniwork tiene una solución para ti.
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
              <span>{s.icon}</span>
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
                  <span className="solutions__check" style={{ color: sol.color }}>✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', background: `linear-gradient(135deg, ${sol.color} 0%, #ff6584 100%)` }}
            >
              Comenzar ahora →
            </button>
          </div>

          <div className="solutions__visual">
            <div className="solutions__icon-big" style={{ '--sol-color': sol.color }}>
              <span>{sol.icon}</span>
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

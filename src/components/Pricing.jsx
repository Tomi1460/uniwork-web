import './Pricing.css'

const plans = [
  {
    id: 'free',
    name: 'Gratis',
    price: '$0',
    period: 'para siempre',
    desc: 'Perfecto para comenzar y explorar la plataforma.',
    color: '#9aa5c4',
    features: [
      '1 perfil activo',
      'Hasta 3 servicios por mes',
      'Chat básico',
      'Soporte por email',
    ],
    excluded: [
      'Analítica avanzada',
      'Pagos integrados',
      'Soporte prioritario',
    ],
    cta: 'Comenzar gratis',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    period: 'por mes',
    desc: 'Para freelancers que quieren crecer sin límites.',
    color: '#6c63ff',
    features: [
      'Servicios ilimitados',
      'Pagos integrados seguros',
      'Analítica y reportes',
      'Perfil verificado destacado',
      'Soporte prioritario 24/7',
      'Notificaciones push',
    ],
    excluded: [],
    cta: 'Comenzar con Pro',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$39',
    period: 'por mes',
    desc: 'Para empresas y equipos que manejan múltiples proyectos.',
    color: '#43e97b',
    features: [
      'Todo lo de Pro',
      'Hasta 20 usuarios',
      'Panel de administración',
      'API access',
      'Onboarding dedicado',
      'SLA garantizado',
    ],
    excluded: [],
    cta: 'Hablar con ventas',
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="section pricing">
      <div className="pricing__bg">
        <div className="pricing__orb"></div>
      </div>
      <div className="container">
        <div className="pricing__header">
          <div className="section-label">
            <span className="glow-dot"></span>
            Precios
          </div>
          <h2 className="heading-lg">
            Simple y <span className="text-gradient">transparente</span>
          </h2>
          <p className="pricing__subtitle">
            Sin sorpresas ni costos ocultos. Elige el plan que más se adapte a tu ritmo de trabajo.
          </p>
        </div>

        <div className="pricing__cards">
          {plans.map(plan => (
            <div
              key={plan.id}
              id={`plan-${plan.id}`}
              className={`pricing__card ${plan.popular ? 'pricing__card--popular' : ''}`}
              style={{ '--plan-color': plan.color }}
            >
              {plan.popular && (
                <div className="pricing__popular-badge">⭐ Más popular</div>
              )}
              <div className="pricing__card-glow"></div>
              <div className="pricing__plan-name">{plan.name}</div>
              <div className="pricing__price">
                <span className="pricing__price-amount">{plan.price}</span>
                <span className="pricing__price-period">{plan.period}</span>
              </div>
              <p className="pricing__plan-desc">{plan.desc}</p>

              <div className="pricing__divider"></div>

              <ul className="pricing__features">
                {plan.features.map(f => (
                  <li key={f} className="pricing__feature pricing__feature--included">
                    <span className="pricing__feat-icon" style={{ color: plan.color }}>✓</span>
                    {f}
                  </li>
                ))}
                {plan.excluded.map(f => (
                  <li key={f} className="pricing__feature pricing__feature--excluded">
                    <span className="pricing__feat-icon">✕</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                id={`btn-plan-${plan.id}`}
                className={`btn btn-lg pricing__cta ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                style={plan.popular ? { background: `linear-gradient(135deg, ${plan.color} 0%, #ff6584 100%)` } : {}}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

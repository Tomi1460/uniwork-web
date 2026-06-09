import './AboutUs.css'

const features = [
  {
    icon: '🔗',
    title: 'Conexión inteligente',
    desc: 'Conectamos trabajadores independientes con empresas que necesitan talento de forma rápida y transparente.',
  },
  {
    icon: '📋',
    title: 'Gestión de servicios',
    desc: 'Crea, asigna y da seguimiento a servicios y órdenes de trabajo en tiempo real desde cualquier dispositivo.',
  },
  {
    icon: '💬',
    title: 'Comunicación en tiempo real',
    desc: 'Chat integrado para que empresas y trabajadores se coordinen sin complicaciones, dentro de la plataforma.',
  },
  {
    icon: '💳',
    title: 'Pagos seguros',
    desc: 'Sistema de pagos integrado con confirmaciones automáticas y registro completo de transacciones.',
  },
  {
    icon: '📊',
    title: 'Panel de analítica',
    desc: 'Visualiza el rendimiento de tu negocio, ganancias, servicios completados y más, todo en un dashboard claro.',
  },
  {
    icon: '🛡️',
    title: 'Seguridad y confianza',
    desc: 'Verificación de identidad, historial de calificaciones y contratos digitales para mayor tranquilidad.',
  },
]

export default function AboutUs() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="about__header">
          <div className="section-label">
            <span className="glow-dot"></span>
            Qué hacemos
          </div>
          <h2 className="heading-lg about__title">
            Una plataforma. <br />
            <span className="text-gradient">Infinitas posibilidades.</span>
          </h2>
          <p className="about__subtitle">
            Uniwork es el ecosistema completo para el trabajo independiente. Desde publicar un servicio 
            hasta cobrar por él, todo ocurre dentro de una misma plataforma diseñada para la eficiencia.
          </p>
        </div>

        <div className="about__grid grid-3">
          {features.map((f, i) => (
            <div key={i} className="card about__card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="about__icon">{f.icon}</div>
              <h3 className="heading-sm about__feature-title">{f.title}</h3>
              <p className="about__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

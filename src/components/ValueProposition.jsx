import './ValueProposition.css'

const values = [
  {
    number: '01',
    title: 'Reducción de la incertidumbre',
    desc: 'La contratación de servicios del hogar siempre fue un proceso informal y poco confiable. Uniwork estructura el mercado con validación de antecedentes, calificaciones verificadas y comunicación dentro de la plataforma.',
    color: '#6c63ff',
  },
  {
    number: '02',
    title: 'Confianza como pilar central',
    desc: 'Incorporamos verificación de antecedentes de los prestadores, un sistema de reputación acumulable y mecanismos de resolución de conflictos. No solo intermediamos, construimos confianza.',
    color: '#ff6584',
  },
  {
    number: '03',
    title: 'Un sector resiliente al cambio tecnológico',
    desc: 'A diferencia de otros mercados, los oficios del hogar requieren presencia física y habilidades prácticas. La automatización y la IA no los reemplazan, lo que posiciona a Uniwork en un segmento con demanda sostenida y baja sustitución.',
    color: '#43e97b',
  },
  {
    number: '04',
    title: 'Altamente escalable',
    desc: 'Gracias a su base digital, Uniwork puede expandirse a nuevos usuarios, categorías y mercados sin modificar su estructura central. Un modelo adaptable a distintos contextos geográficos y de demanda.',
    color: '#f59e0b',
  },
]

const howItWorks = [
  { step: '01', icon: '🔍', title: 'El cliente busca', desc: 'Explora prestadores disponibles por categoría, ubicación y calificaciones.' },
  { step: '02', icon: '📋', title: 'Selecciona y solicita', desc: 'Elige al prestador ideal y envía una solicitud de servicio con los detalles del trabajo.' },
  { step: '03', icon: '💬', title: 'Coordinan dentro de la app', desc: 'El prestador acepta y ambas partes coordinan fecha, modalidad (domicilio o local) y precio.' },
  { step: '04', icon: '✅', title: 'Confirma y califica', desc: 'Una vez finalizado el servicio, el cliente confirma y califica la experiencia. La reputación del prestador crece.' },
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
            No somos solo otra app de servicios. Somos la primera plataforma diseñada para transformar 
            un mercado históricamente informal en un ecosistema digital de confianza.
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

        {/* How it works */}
        <div className="value__how-header">
          <div className="section-label">
            <span className="glow-dot"></span>
            Cómo funciona
          </div>
          <h3 className="heading-lg">
            Simple, <span className="text-gradient">paso a paso</span>
          </h3>
          <p className="value__subtitle" style={{ maxWidth: 480 }}>
            Todo el flujo se gestiona dentro de la plataforma, asegurando orden, comunicación y control en cada etapa.
          </p>
        </div>

        <div className="value__how-grid grid-4">
          {howItWorks.map((h, i) => (
            <div key={h.step} className="value__how-card card">
              <div className="value__how-icon">{h.icon}</div>
              <div className="value__how-step" style={{ color: `hsl(${240 + i * 30}, 80%, 75%)` }}>Paso {h.step}</div>
              <h4 className="heading-sm">{h.title}</h4>
              <p className="value__how-desc">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

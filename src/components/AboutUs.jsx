import './AboutUs.css'

export default function AboutUs() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="about__layout">
          
          <div className="about__content">
            <div className="section-label">
              <span className="glow-dot"></span>
              Nuestro Propósito
            </div>
            
            <h2 className="heading-lg about__title">
              Transformando la contratación de <span className="text-gradient">servicios del hogar</span>
            </h2>
            
            <div className="about__text-blocks">
              <p className="about__lead">
                Actualmente, la contratación de servicios como plomería, electricidad o peluquería depende de recomendaciones informales o búsquedas poco confiables.
              </p>
              
              <p className="about__desc">
                Esto genera desconfianza y dificultad para comparar opciones. Al mismo tiempo, muchos trabajadores independientes carecen de herramientas para posicionarse y profesionalizar su actividad.
                En un mundo donde la IA reemplaza tareas digitales, los oficios del hogar siguen requiriendo habilidades prácticas, posicionando a Uniwork en un segmento de alta demanda.
              </p>
            </div>

            <div className="about__pillars">
              <div className="about__pillar">
                <div className="about__pillar-icon">🔒</div>
                <div>
                  <h4 className="heading-xs">Seguridad</h4>
                  <p>Validación de antecedentes y sistema de calificaciones reales.</p>
                </div>
              </div>
              
              <div className="about__pillar">
                <div className="about__pillar-icon">💼</div>
                <div>
                  <h4 className="heading-xs">Profesionalización</h4>
                  <p>Herramientas para que el prestador construya su reputación y gestione su trabajo.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}

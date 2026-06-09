import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabaseClient'
import AppLayout from '../../components/AppLayout'
import '../../components/AppLayout.css'

const statusLabel = { pending: 'Pendiente', in_progress: 'En curso', completed: 'Completado', cancelled: 'Cancelado' }
const statusClass = { pending: 'badge--pending', in_progress: 'badge--active', completed: 'badge--completed', cancelled: 'badge--cancelled' }

export default function DashboardCliente() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [recentRequests, setRecentRequests] = useState([])
  const [kpis, setKpis] = useState({ total: 0, active: 0, completed: 0, spent: 0 })
  const [loading, setLoading] = useState(true)
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Cliente'

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch service requests for this client
      const { data: requests } = await supabase
        .from('solicitudes_servicio')
        .select(`
          id, estado, created_at, descripcion, precio_acordado,
          servicio:servicios(titulo, categoria),
          prestador:prestadores(prestador_id, usuarios:users(full_name))
        `)
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (requests) {
        setRecentRequests(requests)
        setKpis({
          total: requests.length,
          active: requests.filter(r => r.estado === 'in_progress' || r.estado === 'pending').length,
          completed: requests.filter(r => r.estado === 'completed').length,
          spent: requests.filter(r => r.estado === 'completed').reduce((acc, r) => acc + (r.precio_acordado || 0), 0),
        })
      }

      // Fetch available services to browse
      const { data: svcs } = await supabase
        .from('servicios')
        .select('id, titulo, categoria, precio_base, prestadores(usuarios:users(full_name))')
        .eq('activo', true)
        .limit(6)

      if (svcs) setServices(svcs)
    } catch (err) {
      console.error('Error fetching client data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getHour = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <AppLayout>
      <div className="dash-page">
        {/* Header */}
        <div className="dash-header">
          <div>
            <p className="dash-greeting">{getHour()},</p>
            <h1 className="dash-title">{userName} 👋</h1>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.href = '/app/servicios'}>
            + Solicitar servicio
          </button>
        </div>

        {/* KPIs */}
        <div className="dash-kpis">
          {[
            { icon: '📋', label: 'Total solicitudes', value: kpis.total, color: 'linear-gradient(90deg, #6c63ff, #8b85ff)', delta: null },
            { icon: '⚡', label: 'En curso', value: kpis.active, color: 'linear-gradient(90deg, #f59e0b, #fcd34d)', delta: null },
            { icon: '✅', label: 'Completados', value: kpis.completed, color: 'linear-gradient(90deg, #43e97b, #38f9d7)', delta: null },
            { icon: '💳', label: 'Total gastado', value: `$${kpis.spent.toLocaleString('es-AR')}`, color: 'linear-gradient(90deg, #ff6584, #ff8fa3)', delta: null },
          ].map(kpi => (
            <div key={kpi.label} className="dash-kpi" style={{ '--kpi-color': kpi.color }}>
              <div className="dash-kpi__icon">{kpi.icon}</div>
              <div className="dash-kpi__label">{kpi.label}</div>
              <div className="dash-kpi__value">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

          {/* Recent requests */}
          <div>
            <div className="dash-section-title">
              Solicitudes recientes
              <button onClick={fetchData}>↻ Actualizar</button>
            </div>
            {loading ? (
              <div className="dash-loading">
                {[...Array(4)].map((_, i) => <div key={i} className="dash-skeleton" />)}
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="dash-empty">
                <p>📭 Aún no tienes solicitudes.</p>
                <p>¡Busca un servicio y contrata tu primer prestador!</p>
              </div>
            ) : (
              <div className="dash-list">
                {recentRequests.slice(0, 6).map(req => (
                  <div key={req.id} className="dash-item">
                    <div className="dash-item__avatar">
                      {req.servicio?.categoria?.charAt(0)?.toUpperCase() || '🔧'}
                    </div>
                    <div className="dash-item__info">
                      <div className="dash-item__name">{req.servicio?.titulo || 'Servicio'}</div>
                      <div className="dash-item__sub">
                        {req.prestador?.usuarios?.full_name || 'Prestador'} ·{' '}
                        {new Date(req.created_at).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                    <div className="dash-item__actions">
                      {req.precio_acordado && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: 8 }}>
                          ${Number(req.precio_acordado).toLocaleString('es-AR')}
                        </span>
                      )}
                      <span className={`badge ${statusClass[req.estado] || 'badge--pending'}`}>
                        {statusLabel[req.estado] || req.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Servicios disponibles */}
          <div>
            <div className="dash-section-title">
              Servicios disponibles
              <button>Ver todos →</button>
            </div>
            {loading ? (
              <div className="dash-loading">
                {[...Array(4)].map((_, i) => <div key={i} className="dash-skeleton" />)}
              </div>
            ) : services.length === 0 ? (
              <div className="dash-empty">No hay servicios disponibles en este momento.</div>
            ) : (
              <div className="dash-list">
                {services.map(svc => (
                  <div key={svc.id} className="dash-item">
                    <div className="dash-item__avatar" style={{ background: 'var(--gradient-primary)', fontSize: '1.1rem' }}>
                      🛠️
                    </div>
                    <div className="dash-item__info">
                      <div className="dash-item__name">{svc.titulo}</div>
                      <div className="dash-item__sub">{svc.categoria}</div>
                    </div>
                    <div className="dash-item__actions">
                      {svc.precio_base && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent-2)' }}>
                          ${Number(svc.precio_base).toLocaleString('es-AR')}
                        </span>
                      )}
                      <button className="btn btn-primary btn-sm">Contratar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

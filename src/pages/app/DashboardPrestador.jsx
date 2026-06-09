import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabaseClient'
import AppLayout from '../../components/AppLayout'
import '../../components/AppLayout.css'

const statusLabel = {
  SOLICITADO: 'Solicitado', ACEPTADO: 'Aceptado', EN_PROCESO: 'En curso',
  SOLICITUD_FINALIZACION: 'Fin. pendiente', FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado', EN_DISPUTA: 'En disputa'
}
const statusClass = {
  SOLICITADO: 'badge--pending', ACEPTADO: 'badge--active', EN_PROCESO: 'badge--active',
  SOLICITUD_FINALIZACION: 'badge--pending', FINALIZADO: 'badge--completed',
  CANCELADO: 'badge--cancelled', EN_DISPUTA: 'badge--cancelled'
}

export default function DashboardPrestador() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [kpis, setKpis] = useState({ pending: 0, active: 0, completed: 0, earnings: 0, rating: '—' })
  const [isConnected, setIsConnected] = useState(() => localStorage.getItem('prestador_is_connected') === 'true')
  const [loading, setLoading] = useState(true)
  const [processingReq, setProcessingReq] = useState(null)
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Prestador'

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Active/in-progress orders
      const { data: activeData } = await supabase
        .from('solicitudes')
        .select(`
          solicitud_id, estado, fecha_solicitud, monto_acordado,
          servicios(titulo, categoria),
          clientes(nombre_completo)
        `)
        .eq('prestador_id', user.id)
        .in('estado', ['ACEPTADO', 'EN_PROCESO', 'SOLICITUD_FINALIZACION', 'FINALIZADO'])
        .order('fecha_solicitud', { ascending: false })
        .limit(20)

      if (activeData) {
        setActiveOrders(activeData)
        const completed = activeData.filter(o => o.estado === 'FINALIZADO')
        const earning = completed.reduce((acc, o) => acc + (o.monto_acordado || 0), 0)
        setKpis(prev => ({
          ...prev,
          active: activeData.filter(o => ['ACEPTADO', 'EN_PROCESO'].includes(o.estado)).length,
          completed: completed.length,
          earnings: earning
        }))
      }

      // Pending requests (only if connected)
      if (isConnected) {
        const { data: pendingData } = await supabase
          .from('solicitudes')
          .select(`
            solicitud_id, estado, fecha_solicitud,
            servicios(titulo, categoria, precio_estimado),
            clientes(nombre_completo)
          `)
          .eq('prestador_id', user.id)
          .eq('estado', 'SOLICITADO')
          .order('fecha_solicitud', { ascending: false })

        if (pendingData) {
          setRequests(pendingData)
          setKpis(prev => ({ ...prev, pending: pendingData.length }))
        }
      } else {
        setRequests([])
        setKpis(prev => ({ ...prev, pending: 0 }))
      }
    } catch (err) {
      console.error('Error fetching prestador data:', err)
    } finally {
      setLoading(false)
    }
  }, [user, isConnected])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [fetchData])

  const toggleConnection = async () => {
    const next = !isConnected
    setIsConnected(next)
    localStorage.setItem('prestador_is_connected', String(next))
    if (next) fetchData()
    else setRequests([])
  }

  const acceptRequest = async (requestId) => {
    setProcessingReq(requestId)
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ estado: 'ACEPTADO' })
        .eq('solicitud_id', requestId)
      if (!error) {
        setRequests(prev => prev.filter(r => r.solicitud_id !== requestId))
        setKpis(prev => ({ ...prev, pending: prev.pending - 1, active: prev.active + 1 }))
        fetchData()
      }
    } catch (err) {
      console.error('Error accepting request:', err)
    } finally {
      setProcessingReq(null)
    }
  }

  const rejectRequest = async (requestId) => {
    setProcessingReq(requestId)
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ estado: 'CANCELADO' })
        .eq('solicitud_id', requestId)
      if (!error) {
        setRequests(prev => prev.filter(r => r.solicitud_id !== requestId))
        setKpis(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }))
      }
    } catch (err) {
      console.error('Error rejecting request:', err)
    } finally {
      setProcessingReq(null)
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
            <h1 className="dash-title">{userName} 🔧</h1>
          </div>
          {/* Connection Toggle */}
          <button
            id="btn-toggle-connection"
            className={`btn btn-lg ${isConnected ? 'btn-primary' : 'btn-secondary'}`}
            onClick={toggleConnection}
            style={isConnected ? { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' } : {}}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: isConnected ? '#fff' : 'var(--text-muted)', display: 'inline-block' }}></span>
            {isConnected ? 'Disponible' : 'No disponible'}
          </button>
        </div>

        {/* KPIs */}
        <div className="dash-kpis">
          {[
            { icon: '⏳', label: 'Solicitudes nuevas', value: kpis.pending, color: 'linear-gradient(90deg, #f59e0b, #fcd34d)' },
            { icon: '⚡', label: 'Órdenes activas', value: kpis.active, color: 'linear-gradient(90deg, #6c63ff, #8b85ff)' },
            { icon: '✅', label: 'Completados', value: kpis.completed, color: 'linear-gradient(90deg, #43e97b, #38f9d7)' },
            { icon: '💰', label: 'Ganado este mes', value: `$${kpis.earnings.toLocaleString('es-AR')}`, color: 'linear-gradient(90deg, #ff6584, #ff8fa3)' },
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

          {/* Pending Requests */}
          <div>
            <div className="dash-section-title">
              Solicitudes nuevas
              {isConnected ? (
                <span className="badge badge--active">Recibiendo</span>
              ) : (
                <span className="badge badge--cancelled">Desconectado</span>
              )}
            </div>

            {!isConnected ? (
              <div className="dash-empty">
                <p>🔴 Estás desconectado.</p>
                <p>Activa tu disponibilidad para recibir solicitudes de clientes.</p>
              </div>
            ) : loading ? (
              <div className="dash-loading">
                {[...Array(3)].map((_, i) => <div key={i} className="dash-skeleton" />)}
              </div>
            ) : requests.length === 0 ? (
              <div className="dash-empty">
                <p>📭 No hay solicitudes nuevas.</p>
                <p>Cuando un cliente te contacte, aparecerá aquí.</p>
              </div>
            ) : (
              <div className="dash-list">
                {requests.map(req => {
                  const clientName = req.clientes?.nombre_completo || 'Cliente'
                  const serviceTitle = req.servicios?.titulo || 'Servicio'
                  const price = req.servicios?.precio_estimado
                  const isProcessing = processingReq === req.solicitud_id
                  return (
                    <div key={req.solicitud_id} className="dash-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="dash-item__avatar">{clientName.charAt(0)}</div>
                        <div className="dash-item__info">
                          <div className="dash-item__name">{serviceTitle}</div>
                          <div className="dash-item__sub">
                            {clientName} · {price ? `$${Number(price).toLocaleString('es-AR')}` : 'Precio a acordar'}
                          </div>
                        </div>
                        <span className="badge badge--pending">Nueva</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          id={`btn-accept-${req.solicitud_id}`}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #43e97b, #38f9d7)', color: '#0d1121' }}
                          onClick={() => acceptRequest(req.solicitud_id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? '...' : '✓ Aceptar'}
                        </button>
                        <button
                          id={`btn-reject-${req.solicitud_id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => rejectRequest(req.solicitud_id)}
                          disabled={isProcessing}
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active Orders */}
          <div>
            <div className="dash-section-title">
              Órdenes activas
              <button onClick={fetchData}>↻ Actualizar</button>
            </div>
            {loading ? (
              <div className="dash-loading">
                {[...Array(4)].map((_, i) => <div key={i} className="dash-skeleton" />)}
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="dash-empty">
                <p>📭 No hay órdenes activas.</p>
                <p>Acepta solicitudes para verlas aquí.</p>
              </div>
            ) : (
              <div className="dash-list">
                {activeOrders.slice(0, 8).map(order => {
                  const clientName = order.clientes?.nombre_completo || 'Cliente'
                  const serviceTitle = order.servicios?.titulo || 'Servicio'
                  return (
                    <div key={order.solicitud_id} className="dash-item">
                      <div className="dash-item__avatar">{clientName.charAt(0)}</div>
                      <div className="dash-item__info">
                        <div className="dash-item__name">{serviceTitle}</div>
                        <div className="dash-item__sub">
                          {clientName} · {new Date(order.fecha_solicitud).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                      <div className="dash-item__actions">
                        {order.monto_acordado && (
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent-2)', marginRight: 8 }}>
                            ${Number(order.monto_acordado).toLocaleString('es-AR')}
                          </span>
                        )}
                        <span className={`badge ${statusClass[order.estado] || 'badge--pending'}`}>
                          {statusLabel[order.estado] || order.estado}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

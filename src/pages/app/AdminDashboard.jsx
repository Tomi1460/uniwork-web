import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Mail, Phone, MapPin, Search, TrendingUp, AlertCircle, CheckCircle, MessageSquare, Send, X } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pagos-pendientes');

    // Estados para pagos pendientes
    const [pagosPendientes, setPagosPendientes] = useState([]);
    const [loadingPagos, setLoadingPagos] = useState(false);

    // Estados para reportes
    const [reportes, setReportes] = useState([]);
    const [loadingReportes, setLoadingReportes] = useState(false);

    // Estados para sub-tabs de reportes
    const [activeReportTab, setActiveReportTab] = useState('servicios');

    // Estados para Soporte
    const [activeSupportTab, setActiveSupportTab] = useState('clientes');
    const [supportTickets, setSupportTickets] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState(0); // Added missing state
    const [loadingSupport, setLoadingSupport] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketMessages, setTicketMessages] = useState([]);
    const [adminMessage, setAdminMessage] = useState('');
    const [sendingAdminMessage, setSendingAdminMessage] = useState(false);
    const chatEndRef = useRef(null);


    const [stats, setStats] = useState({
        totalUsuarios: 0,
        totalPrestadores: 0,
        totalClientes: 0,
        totalServicios: 0,
        totalSolicitudes: 0,
        totalTransacciones: 0,
        montoTotalPendiente: 0,
        montoTotalLiberado: 0
    });

    // Estados para Prestadores
    const [prestadoresList, setPrestadoresList] = useState([]);
    const [loadingPrestadores, setLoadingPrestadores] = useState(false);
    const [prestadorSearch, setPrestadorSearch] = useState('');

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login');
                return;
            }

            // Verificar si es admin
            console.log(' Usuario Admin Actual:', user?.email); // DEBUG

            // Allow debugging for now, or add more emails here if you want frontend protection
            const allowedAdmins = [
                'admin@uniwork.com.ar',
                'ebersaldivia@gmail.com', 
                'waltertomassaldiviablasco@gmail.com', 
                'tomassaldiviawalter@gmail.com', 
                'prueba@test.com'
            ];

            if (!allowedAdmins.includes(user.email)) {
                console.warn('Usuario no autorizado en frontend:', user.email);
                alert('No tienes permisos de administrador');
                navigate('/');
                return;
            }

            setUser(user);
            await fetchData();
        } catch (error) {
            console.error('Error checking user:', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        await Promise.all([
            fetchPagosPendientes(),
            fetchStats(),
            fetchReportes(),
            fetchPrestadores(),
            fetchSupportTickets()
        ]);
    };

    const fetchSupportTickets = async () => {
        setLoadingSupport(true);
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select(`
                    ticket_id,
                    usuario_id,
                    estado,
                    tipo,
                    motivo,
                    created_at,
                    updated_at,
                    usuario:usuarios(
                        email,
                        telefono,
                        foto_perfil_url,
                        cliente:clientes(nombre_completo),
                        prestador:prestadores(nombre_completo)
                    )
                `)
                .eq('estado', 'ABIERTO')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            console.log('Tickets data raw:', data);

            // Calculate total unread messages across all tickets
            let totalUnread = 0;

            const processed = await Promise.all(data.map(async ticket => {
                // Handle different response shapes (Array vs Object)
                const clientData = ticket.usuario?.cliente;
                const providerData = ticket.usuario?.prestador;

                const clientObj = Array.isArray(clientData) ? clientData[0] : clientData;
                const providerObj = Array.isArray(providerData) ? providerData[0] : providerData;

                const clientName = clientObj?.nombre_completo;
                const providerName = providerObj?.nombre_completo;

                // Fetch unread count for this ticket
                const { count: unreadCount } = await supabase
                    .from('support_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('ticket_id', ticket.ticket_id)
                    .eq('es_admin', false)
                    .eq('leido', false);

                totalUnread += (unreadCount || 0);

                return {
                    ...ticket,
                    nombre_usuario: clientName || providerName || 'Usuario Desconocido',
                    email: ticket.usuario?.email || 'Sin Email', // Preservar email explicitamente
                    es_cliente: !!clientData, // Usar la data directa para determinar tipo
                    es_prestador: !!providerData,
                    unread_count: unreadCount || 0
                };
            }));

            console.log('Processed tickets:', processed);
            console.log('Total unread:', totalUnread);

            setUnreadMessages(totalUnread);
            setSupportTickets(processed || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoadingSupport(false);
        }
    };

    // Suscripción en tiempo real a nuevos tickets o cambios de estado
    useEffect(() => {
        const ticketSubscription = supabase
            .channel('public:support_tickets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, (payload) => {
                console.log('Cambio en tickets detectado:', payload);
                fetchSupportTickets(); // Recargar la lista completa para obtener los datos relacionales actualizados
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ticketSubscription);
        };
    }, []);

    const fetchTicketMessages = async (ticket) => {
        setSelectedTicket(ticket);
        try {
            const { data, error } = await supabase
                .from('support_messages')
                .select('*')
                .eq('ticket_id', ticket.ticket_id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setTicketMessages(data || []);

            await supabase
                .from('support_messages')
                .update({ leido: true })
                .eq('ticket_id', ticket.ticket_id)
                .eq('es_admin', false)
                .eq('leido', false);

            // Re-fetch tickets to update unread counts globally...
            // fetchSupportTickets(); 
            // OR optimize by just updating the local state count if we knew how many were read

            // For now, let's just decrement the global counter by the number of unread messages in THIS ticket
            // But we don't know the count here without fetching it first or passing it.
            // Safer to just re-fetch everything for consistency, though it's an extra network call.
            fetchSupportTickets();

        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const subscribeToMessages = (ticketId) => {
        const subscription = supabase
            .channel(`public:support_messages:ticket_id=eq.${ticketId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticketId}` }, payload => {
                setTicketMessages(prev => {
                    if (prev.some(msg => msg.message_id === payload.new.message_id)) return prev;
                    return [...prev, payload.new];
                });
                // Si el mensaje es del usuario, marcar como no leído en la lista de tickets o reproducir sonido (opcional)
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    };

    const handleSendAdminMessage = async (e) => {
        e.preventDefault();
        if (!adminMessage.trim() || !selectedTicket) return;
        setSendingAdminMessage(true);

        const messageToSend = adminMessage.trim();
        const tempId = 'temp-' + Date.now();

        // Optimistic UI
        const optimisticMsg = {
            message_id: tempId,
            message: messageToSend,
            created_at: new Date().toISOString(),
            es_admin: true,
            leido: false,
            ticket_id: selectedTicket.ticket_id
        };

        setTicketMessages(prev => [...prev, optimisticMsg]);
        setAdminMessage('');

        try {
            const { error } = await supabase
                .from('support_messages')
                .insert([{
                    ticket_id: selectedTicket.ticket_id,
                    message: messageToSend,
                    es_admin: true,
                    leido: false
                }]);

            if (error) throw error;

            fetchTicketMessages(selectedTicket);

            await supabase
                .from('support_tickets')
                .update({ updated_at: new Date().toISOString() })
                .eq('ticket_id', selectedTicket.ticket_id);

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error al enviar mensaje');
            setTicketMessages(prev => prev.filter(msg => msg.message_id !== tempId));
            setAdminMessage(messageToSend);
        } finally {
            setSendingAdminMessage(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;

        if (!confirm('¿Estás seguro de finalizar esta consulta? El ticket se cerrará.')) return;

        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ estado: 'CERRADO' })
                .eq('ticket_id', selectedTicket.ticket_id);

            if (error) throw error;

            alert('Consulta finalizada.');
            setSelectedTicket(null);

            // Wait slightly before refetching to ensure DB consistency
            setTimeout(() => {
                fetchSupportTickets();
            }, 500);

        } catch (error) {
            console.error('Error closing ticket:', error);
            alert('Error al cerrar ticket: ' + (error.message || 'Error desconocido'));
        }
    };

    useEffect(() => {
        if (selectedTicket) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ticketMessages, selectedTicket]);

    useEffect(() => {
        if (selectedTicket) {
            console.log('Admin subscribing to ticket:', selectedTicket.ticket_id);
            const unsubscribe = subscribeToMessages(selectedTicket.ticket_id);
            return () => {
                console.log('Admin unsubscribing');
                unsubscribe();
            };
        }
    }, [selectedTicket?.ticket_id]);

    const fetchPagosPendientes = async () => {
        setLoadingPagos(true);
        try {
            const { data, error } = await supabase
                .from('transacciones')
                .select(`
                transaccion_id,
                monto_retenido,
                fecha_liberacion_fondos,
                solicitud_id,
                solicitudes (
                solicitud_id,
                prestador_id,
                servicio_id,
                prestadores (
                nombre_completo,
                cuenta_bancaria_cbu,
                cuenta_bancaria_alias,
                cuenta_bancaria_titular,
                mercadopago_email
                ),
                servicios (
                titulo
                )
                )
                `)
                .eq('estado_garantia', 'PENDIENTE')
                .lte('fecha_liberacion_fondos', new Date().toISOString())
                .order('fecha_liberacion_fondos', { ascending: true });

            if (error) {
                console.error('Error completo:', error);
                throw error;
            }

            console.log('Datos recibidos:', data);
            setPagosPendientes(data || []);
        } catch (error) {
            console.error('Error fetching pagos pendientes:', error);
            alert('Error al cargar pagos: ' + error.message);
        } finally {
            setLoadingPagos(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Total Prestadores
            const { count: prestadores } = await supabase
                .from('prestadores')
                .select('*', { count: 'exact', head: true });

            // Total Clientes
            const { count: clientes } = await supabase
                .from('clientes')
                .select('*', { count: 'exact', head: true });

            setStats({
                totalUsuarios: (clientes || 0) + (prestadores || 0),
                totalPrestadores: prestadores || 0,
                totalClientes: clientes || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchPrestadores = async () => {
        setLoadingPrestadores(true);
        try {
            const { data, error } = await supabase
                .from('prestadores')
                .select(`
                *,
                usuario:usuarios!inner(email, foto_perfil_url, telefono)
                `);

            if (error) throw error;

            // Ordenamiento: 1. Calificación (Desc), 2. Nombre (Asc)
            const sorted = data.sort((a, b) => {
                const ratA = a.calificacion_promedio || 0;
                const ratB = b.calificacion_promedio || 0;
                if (ratB !== ratA) return ratB - ratA;
                return (a.nombre_completo || '').localeCompare(b.nombre_completo || '');
            });

            setPrestadoresList(sorted);
        } catch (error) {
            console.error('Error fetching prestadores:', error);
        } finally {
            setLoadingPrestadores(false);
        }
    };



    const fetchReportes = async () => {
        setLoadingReportes(true);
        try {
            const { data, error } = await supabase
                .from('reportes_servicios')
                .select(`
                *,
                cliente:clientes!reportes_servicios_cliente_id_fkey (
                nombre_completo,
                cliente_id
                ),
                prestador:prestadores!reportes_servicios_prestador_id_fkey (
                nombre_completo,
                prestador_id
                ),
                servicio:servicios!reportes_servicios_servicio_id_fkey (
                titulo
                )
                `)
                .order('fecha_reporte', { ascending: false });

            if (error) throw error;

            setReportes(data || []);
        } catch (error) {
            console.error('Error fetching reportes:', error);
        } finally {
            setLoadingReportes(false);
        }
    };

    const handleCambiarEstadoReporte = async (reporteId, nuevoEstado) => {
        try {
            const { error } = await supabase
                .from('reportes_servicios')
                .update({
                    estado: nuevoEstado,
                    fecha_resolucion: nuevoEstado === 'RESUELTO' ? new Date().toISOString() : null
                })
                .eq('reporte_id', reporteId);

            if (error) throw error;

            // Actualizar lista
            await fetchReportes();
            alert('Estado del reporte actualizado correctamente');
        } catch (error) {
            console.error('Error actualizando reporte:', error);
            alert('Error al actualizar el reporte');
        }
    };

    const handleAgregarNotasAdmin = async (reporteId) => {
        const notas = prompt('Agregar notas del administrador:');
        if (!notas) return;

        try {
            const { error } = await supabase
                .from('reportes_servicios')
                .update({ notas_admin: notas })
                .eq('reporte_id', reporteId);

            if (error) throw error;

            await fetchReportes();
            alert('Notas agregadas correctamente');
        } catch (error) {
            console.error('Error agregando notas:', error);
            alert('Error al agregar notas');
        }
    };

    const handleProcesarPago = async (transaccion) => {
        if (!confirm(`¿Confirmar transferencia de $${transaccion.monto_retenido} a ${transaccion.solicitudes.prestadores.nombre_completo}?`)) {
            return;
        }

        try {
            // Llamar a la función de Supabase para confirmar la transferencia
            const { error } = await supabase.rpc('confirmar_transferencia_realizada', {
                p_transaccion_id: transaccion.transaccion_id
            });

            if (error) throw error;

            alert('Pago procesado exitosamente');
            await fetchData(); // Refrescar datos
        } catch (error) {
            console.error('Error procesando pago:', error);
            alert('Error al procesar el pago: ' + error.message);
        }
    };

    const handleCopiarDatos = (pago) => {
        const prestador = pago.solicitudes.prestadores;
        const datos = `💰 DATOS DE TRANSFERENCIA
                ━━━━━━━━━━━━━━━━━━━━━━
                Monto: $${parseFloat(pago.monto_retenido).toFixed(2)}
                Titular: ${prestador.cuenta_bancaria_titular || 'N/A'}
                CBU: ${prestador.cuenta_bancaria_cbu || 'N/A'}
                Alias: ${prestador.cuenta_bancaria_alias || 'N/A'}
                Servicio: ${pago.solicitudes.servicios?.titulo || 'N/A'}
                ━━━━━━━━━━━━━━━━━━━━━━`;

        navigator.clipboard.writeText(datos).then(() => {
            alert('✅ Datos copiados al portapapeles');
        }).catch(err => {
            console.error('Error al copiar:', err);
            alert('❌ Error al copiar. Intenta manualmente.');
        });
    };

    const handleAbrirMercadoPago = () => {
        // Intenta abrir la app de Mercado Pago (Android/iOS)
        const appUrl = 'mercadopago://';
        const webUrl = 'https://www.mercadopago.com.ar/';

        // Intenta abrir la app primero
        window.location.href = appUrl;

        // Si no se abre la app en 1 segundo, abre la web
        setTimeout(() => {
            window.open(webUrl, '_blank');
        }, 1000);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Cargando...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#1a1a2e',
                color: 'white',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>🔧 Panel Administrativo - Uniwork</h1>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                {/* Tabs */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '2px solid #ddd' }}>
                    <button
                        onClick={() => setActiveTab('pagos-pendientes')}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: activeTab === 'pagos-pendientes' ? '#1a1a2e' : 'transparent',
                            color: activeTab === 'pagos-pendientes' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '5px 5px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            position: 'relative'
                        }}
                    >
                        💰 Pagos Pendientes
                        {pagosPendientes.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px'
                            }}>
                                {pagosPendientes.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('reportes')}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: activeTab === 'reportes' ? '#1a1a2e' : 'transparent',
                            color: activeTab === 'reportes' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '5px 5px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            position: 'relative'
                        }}
                    >
                        🚨 Reportes
                        {reportes.filter(r => r.estado === 'PENDIENTE').length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px'
                            }}>
                                {reportes.filter(r => r.estado === 'PENDIENTE').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('soporte')}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: activeTab === 'soporte' ? '#1a1a2e' : 'transparent',
                            color: activeTab === 'soporte' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '5px 5px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            position: 'relative'
                        }}
                    >
                        <MessageSquare size={18} /> Soporte
                        {unreadMessages > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px'
                            }}>
                                {unreadMessages}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('prestadores')}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: activeTab === 'prestadores' ? '#1a1a2e' : 'transparent',
                            color: activeTab === 'prestadores' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '5px 5px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Users size={18} /> Prestadores
                    </button>
                    <button
                        onClick={() => setActiveTab('estadisticas')}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: activeTab === 'estadisticas' ? '#1a1a2e' : 'transparent',
                            color: activeTab === 'estadisticas' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '5px 5px 0 0',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        📊 Estadísticas
                    </button>
                </div>

                {/* Contenido de Pagos Pendientes */}
                {activeTab === 'pagos-pendientes' && (
                    <div>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0 }}>Pagos Listos para Transferir</h2>
                                <button
                                    onClick={fetchPagosPendientes}
                                    disabled={loadingPagos}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: loadingPagos ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loadingPagos ? 'Actualizando...' : '🔄 Actualizar'}
                                </button>
                            </div>

                            {loadingPagos ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>Cargando...</div>
                            ) : pagosPendientes.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '10px'
                                }}>
                                    <p style={{ fontSize: '18px', color: '#666' }}>✅ No hay pagos pendientes de procesar</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {pagosPendientes.map((pago) => (
                                        <div
                                            key={pago.transaccion_id}
                                            style={{
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                padding: '20px',
                                                backgroundColor: '#fafafa',
                                                transition: 'all 0.3s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = '#3498db';
                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = '#e0e0e0';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{ margin: '0 0 10px 0', color: '#1a1a2e' }}>
                                                        {pago.solicitudes.prestadores.nombre_completo}
                                                    </h3>
                                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                                        <strong>Servicio:</strong> {pago.solicitudes.servicios?.titulo || 'N/A'}
                                                    </p>
                                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                                        <strong>CBU:</strong> {pago.solicitudes.prestadores.cuenta_bancaria_cbu || 'No disponible'}
                                                    </p>
                                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                                        <strong>Alias:</strong> {pago.solicitudes.prestadores.cuenta_bancaria_alias || 'No disponible'}
                                                    </p>
                                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                                        <strong>Titular:</strong> {pago.solicitudes.prestadores.cuenta_bancaria_titular || 'No disponible'}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{
                                                        fontSize: '32px',
                                                        fontWeight: 'bold',
                                                        color: '#27ae60',
                                                        marginBottom: '10px'
                                                    }}>
                                                        ${parseFloat(pago.monto_retenido).toFixed(2)}
                                                    </div>

                                                    {/* Botones de ayuda */}
                                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                                        <button
                                                            onClick={() => handleCopiarDatos(pago)}
                                                            style={{
                                                                padding: '8px 16px',
                                                                backgroundColor: '#3498db',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                flex: 1
                                                            }}
                                                        >
                                                            📋 Copiar Datos
                                                        </button>
                                                        <button
                                                            onClick={handleAbrirMercadoPago}
                                                            style={{
                                                                padding: '8px 16px',
                                                                backgroundColor: '#00a8e8',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer',
                                                                fontSize: '14px',
                                                                flex: 1
                                                            }}
                                                        >
                                                            💰 Abrir MP
                                                        </button>
                                                    </div>

                                                    {/* Botón principal */}
                                                    <button
                                                        onClick={() => handleProcesarPago(pago)}
                                                        style={{
                                                            padding: '12px 24px',
                                                            backgroundColor: '#27ae60',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '16px',
                                                            width: '100%'
                                                        }}
                                                    >
                                                        ✅ Confirmar Pago
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Contenido de Reportes */}
                {activeTab === 'reportes' && (
                    <div>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                <button
                                    onClick={() => setActiveReportTab('servicios')}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: activeReportTab === 'servicios' ? '#3498db' : '#f0f0f0',
                                        color: activeReportTab === 'servicios' ? 'white' : '#333',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    🛠️ Reportes Servicios
                                </button>
                                <button
                                    onClick={() => setActiveReportTab('antecedentes')}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: activeReportTab === 'antecedentes' ? '#3498db' : '#f0f0f0',
                                        color: activeReportTab === 'antecedentes' ? 'white' : '#333',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    📋 Reportes Antecedentes
                                </button>
                            </div>

                            {activeReportTab === 'servicios' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h2 style={{ margin: 0 }}>Gestión de Reportes</h2>
                                        <button
                                            onClick={fetchReportes}
                                            disabled={loadingReportes}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#3498db',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: loadingReportes ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {loadingReportes ? 'Actualizando...' : '🔄 Actualizar'}
                                        </button>
                                    </div>

                                    {loadingReportes ? (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>Cargando reportes...</div>
                                    ) : reportes.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f0f0f0', borderRadius: '10px' }}>
                                            <p style={{ fontSize: '18px', color: '#666' }}>✅ No hay reportes registrados</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {reportes.map((reporte) => (
                                                <div key={reporte.reporte_id} style={{
                                                    border: '2px solid',
                                                    borderColor: reporte.estado === 'PENDIENTE' ? '#e74c3c' : '#e0e0e0',
                                                    borderRadius: '10px',
                                                    padding: '20px',
                                                    backgroundColor: '#fafafa'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                        <div>
                                                            <span style={{
                                                                padding: '5px 10px',
                                                                borderRadius: '15px',
                                                                backgroundColor: reporte.estado === 'PENDIENTE' ? '#e74c3c' :
                                                                    reporte.estado === 'RESUELTO' ? '#27ae60' :
                                                                        reporte.estado === 'EN_REVISION' ? '#f39c12' : '#95a5a6',
                                                                color: 'white',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {reporte.estado}
                                                            </span>
                                                            <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                                                                📅 {new Date(reporte.fecha_reporte).toLocaleDateString()} {new Date(reporte.fecha_reporte).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontWeight: 'bold', color: '#666' }}>
                                                            ID: #{reporte.reporte_id}
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 10px 0', color: '#1a1a2e' }}>📝 Detalle del Reporte</h4>
                                                            <p><strong>Motivo:</strong> {reporte.motivo}</p>
                                                            <p><strong>Descripción:</strong> {reporte.descripcion || 'Sin descripción'}</p>
                                                            <p><strong>Servicio:</strong> {reporte.servicio?.titulo || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: '0 0 10px 0', color: '#1a1a2e' }}>👤 Involucrados</h4>
                                                            <p><strong>Reportante (Cliente):</strong> {reporte.cliente?.nombre_completo || 'N/A'}</p>
                                                            <p><strong>Reportado (Prestador):</strong> {reporte.prestador?.nombre_completo || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    {reporte.notas_admin && (
                                                        <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px', marginBottom: '15px', borderLeft: '4px solid #ffc107' }}>
                                                            <strong>👮 Notas Admin:</strong> {reporte.notas_admin}
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                                        <select
                                                            defaultValue=""
                                                            onChange={(e) => {
                                                                if (e.target.value) handleCambiarEstadoReporte(reporte.reporte_id, e.target.value);
                                                            }}
                                                            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                        >
                                                            <option value="" disabled>Cambiar Estado...</option>
                                                            <option value="PENDIENTE">Pendiente</option>
                                                            <option value="EN_REVISION">En Revisión</option>
                                                            <option value="RESUELTO">Resuelto</option>
                                                            <option value="RECHAZADO">Rechazado</option>
                                                        </select>

                                                        <button
                                                            onClick={() => handleAgregarNotasAdmin(reporte.reporte_id)}
                                                            style={{
                                                                padding: '8px 16px',
                                                                backgroundColor: '#f1c40f',
                                                                color: '#333',
                                                                border: 'none',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            📝 Notas
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeReportTab === 'antecedentes' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', height: '600px' }}>
                                    {/* Lista de Tickets Antecedentes */}
                                    <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0, fontSize: '16px' }}>Tickets Antecedentes</h3>
                                            <button onClick={fetchSupportTickets} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#3498db' }}>🔄</button>
                                        </div>
                                        <div style={{ flex: 1, overflowY: 'auto' }}>
                                            {loadingSupport ? (
                                                <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
                                            ) : supportTickets.filter(t => t.tipo === 'ANTECEDENTES').length === 0 ? (
                                                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No hay reportes de antecedentes.</div>
                                            ) : (
                                                supportTickets.filter(t => t.tipo === 'ANTECEDENTES').map(ticket => (
                                                    <div
                                                        key={ticket.ticket_id}
                                                        onClick={() => fetchTicketMessages(ticket)}
                                                        style={{
                                                            padding: '15px',
                                                            borderBottom: '1px solid #eee',
                                                            cursor: 'pointer',
                                                            backgroundColor: selectedTicket?.ticket_id === ticket.ticket_id ? '#e3f2fd' : 'white',
                                                            transition: 'background 0.2s',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
                                                            {ticket.nombre_usuario}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#e67e22', fontWeight: 'bold', marginBottom: '5px' }}>
                                                            ⚠️ {ticket.motivo}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{ticket.email}</div>
                                                        <div style={{ fontSize: '11px', color: '#999' }}>
                                                            {new Date(ticket.updated_at).toLocaleDateString()} {new Date(ticket.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        {ticket.unread_count > 0 && (
                                                            <span style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {ticket.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Vista de Chat (Reutilizada de soporte) */}
                                    <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        {selectedTicket && selectedTicket.tipo === 'ANTECEDENTES' ? (
                                            <>
                                                <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                                                    <div>
                                                        <h3 style={{ margin: 0 }}>{selectedTicket.nombre_usuario}</h3>
                                                        <span style={{ fontSize: '12px', color: '#e67e22', fontWeight: 'bold' }}>📋 Reporte Antecedentes</span>
                                                    </div>
                                                    <button
                                                        onClick={handleCloseTicket}
                                                        style={{
                                                            padding: '8px 16px',
                                                            backgroundColor: '#e74c3c',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Cerrar Reporte
                                                    </button>
                                                </div>

                                                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    {ticketMessages.map(msg => (
                                                        <div key={msg.message_id} style={{
                                                            alignSelf: msg.es_admin ? 'flex-end' : 'flex-start',
                                                            maxWidth: '70%',
                                                            backgroundColor: msg.es_admin ? '#3498db' : 'white',
                                                            color: msg.es_admin ? 'white' : '#333',
                                                            padding: '12px',
                                                            borderRadius: '10px',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                            borderBottomRightRadius: msg.es_admin ? '0' : '10px',
                                                            borderBottomLeftRadius: msg.es_admin ? '10px' : '0'
                                                        }}>
                                                            <div>{msg.message}</div>
                                                            <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.8, textAlign: 'right' }}>
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div ref={chatEndRef} />
                                                </div>

                                                <form onSubmit={handleSendAdminMessage} style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                                                    <input
                                                        type="text"
                                                        value={adminMessage}
                                                        onChange={(e) => setAdminMessage(e.target.value)}
                                                        placeholder="Responder al prestador..."
                                                        style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={sendingAdminMessage || !adminMessage.trim()}
                                                        style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                </form>
                                            </>
                                        ) : (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                                <AlertCircle size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                                <p>Selecciona un reporte de antecedentes para revisar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Contenido de Estadísticas */}

                {/* Contenido de Soporte */}
                {activeTab === 'soporte' && (
                    <div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <button
                                onClick={() => setActiveSupportTab('clientes')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: activeSupportTab === 'clientes' ? '#3498db' : '#f0f0f0',
                                    color: activeSupportTab === 'clientes' ? 'white' : '#333',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                👤 Clientes
                            </button>
                            <button
                                onClick={() => setActiveSupportTab('prestadores')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: activeSupportTab === 'prestadores' ? '#3498db' : '#f0f0f0',
                                    color: activeSupportTab === 'prestadores' ? 'white' : '#333',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                🔧 Prestadores
                            </button>
                        </div>

                        {activeSupportTab === 'clientes' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', height: '600px' }}>
                                {/* Lista de Tickets */}
                                <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: '16px' }}>Chats Activos (Clientes)</h3>
                                        <button onClick={fetchSupportTickets} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#3498db' }}>🔄</button>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        {loadingSupport ? (
                                            <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
                                        ) : supportTickets.filter(t => t.es_cliente && (t.tipo === 'SOPORTE' || !t.tipo)).length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No hay chats de clientes activos.</div>
                                        ) : (
                                            supportTickets.filter(t => t.es_cliente && (t.tipo === 'SOPORTE' || !t.tipo)).map(ticket => (
                                                <div
                                                    key={ticket.ticket_id}
                                                    onClick={() => fetchTicketMessages(ticket)}
                                                    style={{
                                                        padding: '15px',
                                                        borderBottom: '1px solid #eee',
                                                        cursor: 'pointer',
                                                        backgroundColor: selectedTicket?.ticket_id === ticket.ticket_id ? '#e3f2fd' : 'white',
                                                        transition: 'background 0.2s',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
                                                        {ticket.es_cliente ? ticket.email : ticket.nombre_usuario}
                                                    </div>
                                                    {ticket.es_prestador && (
                                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{ticket.email}</div>
                                                    )}
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        {new Date(ticket.updated_at).toLocaleDateString()} {new Date(ticket.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Vista de Chat */}
                                <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    {selectedTicket ? (
                                        <>
                                            <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                                                <div>
                                                    <h3 style={{ margin: 0 }}>{selectedTicket.nombre_usuario}</h3>
                                                    <span style={{ fontSize: '12px', color: '#27ae60' }}>● Chat Abierto</span>
                                                </div>
                                                <button
                                                    onClick={handleCloseTicket}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: '#e74c3c',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Finalizar Consulta
                                                </button>
                                            </div>

                                            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {ticketMessages.map(msg => (
                                                    <div key={msg.message_id} style={{
                                                        alignSelf: msg.es_admin ? 'flex-end' : 'flex-start',
                                                        maxWidth: '70%',
                                                        backgroundColor: msg.es_admin ? '#3498db' : 'white',
                                                        color: msg.es_admin ? 'white' : '#333',
                                                        padding: '12px',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                        borderBottomRightRadius: msg.es_admin ? '0' : '10px',
                                                        borderBottomLeftRadius: msg.es_admin ? '10px' : '0'
                                                    }}>
                                                        <div>{msg.message}</div>
                                                        <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.8, textAlign: 'right' }}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div ref={chatEndRef} />
                                            </div>

                                            <form onSubmit={handleSendAdminMessage} style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="text"
                                                    value={adminMessage}
                                                    onChange={(e) => setAdminMessage(e.target.value)}
                                                    placeholder="Escribe una respuesta..."
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        borderRadius: '5px',
                                                        border: '1px solid #ddd'
                                                    }}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={sendingAdminMessage || !adminMessage.trim()}
                                                    style={{
                                                        padding: '10px 20px',
                                                        backgroundColor: '#3498db',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                            <MessageSquare size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                            <p>Selecciona un chat para comenzar</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSupportTab === 'prestadores' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', height: '600px' }}>
                                {/* Lista de Tickets Prestadores */}
                                <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: '16px' }}>Chats Activos (Prestadores)</h3>
                                        <button onClick={fetchSupportTickets} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#3498db' }}>🔄</button>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto' }}>
                                        {loadingSupport ? (
                                            <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
                                        ) : supportTickets.filter(t => t.es_prestador && (t.tipo === 'SOPORTE' || !t.tipo)).length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No hay chats de prestadores activos.</div>
                                        ) : (
                                            supportTickets.filter(t => t.es_prestador && (t.tipo === 'SOPORTE' || !t.tipo)).map(ticket => (
                                                <div
                                                    key={ticket.ticket_id}
                                                    onClick={() => fetchTicketMessages(ticket)}
                                                    style={{
                                                        padding: '15px',
                                                        borderBottom: '1px solid #eee',
                                                        cursor: 'pointer',
                                                        backgroundColor: selectedTicket?.ticket_id === ticket.ticket_id ? '#e3f2fd' : 'white',
                                                        transition: 'background 0.2s',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>{ticket.nombre_usuario}</div>
                                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{ticket.email}</div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        {new Date(ticket.updated_at).toLocaleDateString()} {new Date(ticket.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Vista de Chat (Reutilizada) */}
                                <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    {selectedTicket ? (
                                        <>
                                            <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
                                                <div>
                                                    <h3 style={{ margin: 0 }}>{selectedTicket.nombre_usuario}</h3>
                                                    <span style={{ fontSize: '12px', color: '#27ae60' }}>● Chat Abierto</span>
                                                </div>
                                                <button
                                                    onClick={handleCloseTicket}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: '#e74c3c',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Finalizar Consulta
                                                </button>
                                            </div>

                                            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {ticketMessages.map(msg => (
                                                    <div key={msg.message_id} style={{
                                                        alignSelf: msg.es_admin ? 'flex-end' : 'flex-start',
                                                        maxWidth: '70%',
                                                        backgroundColor: msg.es_admin ? '#3498db' : 'white',
                                                        color: msg.es_admin ? 'white' : '#333',
                                                        padding: '12px',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                        borderBottomRightRadius: msg.es_admin ? '0' : '10px',
                                                        borderBottomLeftRadius: msg.es_admin ? '10px' : '0'
                                                    }}>
                                                        <div>{msg.message}</div>
                                                        <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.8, textAlign: 'right' }}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div ref={chatEndRef} />
                                            </div>

                                            <form onSubmit={handleSendAdminMessage} style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="text"
                                                    value={adminMessage}
                                                    onChange={(e) => setAdminMessage(e.target.value)}
                                                    placeholder="Escribe una respuesta..."
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px',
                                                        borderRadius: '5px',
                                                        border: '1px solid #ddd'
                                                    }}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={sendingAdminMessage || !adminMessage.trim()}
                                                    style={{
                                                        padding: '10px 20px',
                                                        backgroundColor: '#3498db',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                            <MessageSquare size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                            <p>Selecciona un chat para comenzar</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Contenido de Prestadores */}
                {activeTab === 'prestadores' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Directorio de Prestadores</h2>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar prestador..."
                                    value={prestadorSearch}
                                    onChange={(e) => setPrestadorSearch(e.target.value)}
                                    style={{
                                        padding: '10px 10px 10px 35px',
                                        borderRadius: '5px',
                                        border: '1px solid #ddd',
                                        width: '250px'
                                    }}
                                />
                            </div>
                        </div>

                        {loadingPrestadores ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>Cargando directorio...</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                            <th style={{ padding: '15px', color: '#666' }}>Prestador</th>
                                            <th style={{ padding: '15px', color: '#666' }}>Calificación</th>
                                            <th style={{ padding: '15px', color: '#666' }}>Contacto</th>
                                            <th style={{ padding: '15px', color: '#666' }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prestadoresList
                                            .filter(p => p.nombre_completo.toLowerCase().includes(prestadorSearch.toLowerCase()))
                                            .map((p, index) => (
                                                <tr key={p.prestador_id} style={{ borderBottom: '1px solid #eee', backgroundColor: index < 3 ? '#fffbeb' : 'transparent' }}>
                                                    <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        <div style={{
                                                            width: '40px', height: '40px', borderRadius: '50%',
                                                            backgroundColor: '#ddd', overflow: 'hidden',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#666', fontWeight: 'bold'
                                                        }}>
                                                            {p.usuario?.foto_perfil_url ? (
                                                                <img src={p.usuario.foto_perfil_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : p.nombre_completo[0]}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', color: '#333' }}>
                                                                {p.nombre_completo}
                                                                {index < 3 && <span style={{ marginLeft: '5px', fontSize: '12px' }}>👑</span>}
                                                            </div>
                                                            <div style={{ fontSize: '12px', color: '#999' }}>ID: ...{p.prestador_id.slice(-6)}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <Star size={16} fill="#f1c40f" color="#f1c40f" />
                                                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                                                {p.calificacion_promedio ? parseFloat(p.calificacion_promedio).toFixed(1) : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <Mail size={14} color="#666" /> {p.usuario?.email || 'No email'}
                                                            </div>
                                                            {p.usuario?.telefono && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                    <Phone size={14} color="#666" /> {p.usuario.telefono}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        {p.cuenta_verificada ? (
                                                            <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
                                                                Verificado
                                                            </span>
                                                        ) : (
                                                            <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
                                                                Pendiente
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'estadisticas' && (
                    <div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px'
                        }}>
                            <StatCard title="Total Usuarios" value={stats.totalUsuarios} icon="👥" color="#3498db" />
                            <StatCard title="Prestadores" value={stats.totalPrestadores} icon="🔧" color="#9b59b6" />
                            <StatCard title="Clientes" value={stats.totalClientes} icon="👤" color="#e67e22" />
                        </div>
                    </div>
                )}

                {activeTab === 'support_debug' && (
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                        <h3>Todos los Tickets (Sin Filtros)</h3>
                        {supportTickets.map(t => (
                            <div key={t.ticket_id} style={{ borderBottom: '1px solid #eee', padding: '10px' }}>
                                <strong>ID:</strong> {t.ticket_id} <br />
                                <strong>Usuario:</strong> {t.email} ({t.nombre_usuario}) <br />
                                <strong>Es Cliente:</strong> {t.es_cliente ? 'SI' : 'NO'} <br />
                                <strong>Es Prestador:</strong> {t.es_prestador ? 'SI' : 'NO'} <br />
                                <strong>Estado:</strong> {t.estado}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: `5px solid ${color}`
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>{title}</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{value}</p>
            </div>
            <div style={{ fontSize: '40px' }}>{icon}</div>
        </div>
    </div>
);

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Star, CheckCircle, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function PrestadorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const waId = searchParams.get('wa_id');
    const isExterno = searchParams.get('type') === 'externo';
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);

    // Hardcode of the bot number just like in PrestadoresList
    const botNumber = '5493435165239';

    useEffect(() => {
        const fetchService = async () => {
            try {
                if (isExterno) {
                    const { data, error } = await supabase
                        .from('prestadores_externos')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) throw error;
                    
                    // Map external provider to match `servicio` structure
                    setServicio({
                        servicio_id: data.id,
                        titulo: data.rubro,
                        descripcion: data.descripcion || 'Profesional verificado por el equipo de Uniwork.',
                        precio_estimado: data.precio_hora,
                        calificacion_promedio: 5.0, // Default for managed
                        ubicacion_servicio: data.zona || '',
                        fotos_urls: data.fotos_urls || [],
                        imagen_url: data.imagen_url,
                        esta_activo: data.activo,
                        categorias: { nombre: data.rubro },
                        prestador: {
                            prestador_id: data.id,
                            nombre_completo: `${data.nombre} ${data.apellido || ''}`.trim(),
                            calificacion_promedio: 5.0,
                            trabajos_realizados: data.anos_experiencia ? data.anos_experiencia * 10 : 25,
                            usuario: { foto_perfil_url: null }
                        }
                    });
                } else {
                    const { data, error } = await supabase
                        .from('servicios')
                        .select(`
                            servicio_id, 
                            titulo, 
                            descripcion, 
                            precio_estimado,
                            calificacion_promedio,
                            ubicacion_servicio,
                            fotos_urls,
                            imagen_url,
                            esta_activo,
                            categorias!inner(nombre),
                            prestador:prestadores (
                                prestador_id,
                                nombre_completo,
                                calificacion_promedio,
                                trabajos_realizados,
                                usuario:usuarios(foto_perfil_url)
                            )
                        `)
                        .eq('servicio_id', id)
                        .single();

                    if (error) throw error;
                    setServicio(data);
                }
            } catch (err) {
                console.error("Error fetching service:", err);
                setErrorMsg("No se pudo cargar el perfil del prestador.");
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id, isExterno]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    if (errorMsg || !servicio) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>{errorMsg || "Prestador no encontrado"}</h2>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6c63ff', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                >
                    Volver atrás
                </button>
            </div>
        );
    }

    const providerName = servicio?.prestador?.nombre_completo || 'Prestador Verificado';
    const categoriaName = servicio?.categorias?.nombre || 'Servicio';

    const handleRequest = async () => {
        if (!waId) {
            alert('Falta información de usuario de WhatsApp. Vuelve a abrir el enlace que te envió el bot.');
            return;
        }
        setIsSubmitting(true);
        try {
            if (isExterno) {
                let clienteData = null;
                const { data: cData } = await supabase.from('clientes_whatsapp').select('*').eq('id', waId).single();
                clienteData = cData;

                const { error } = await supabase.from('solicitudes_externas').insert({
                    prestador_externo_id: servicio.prestador.prestador_id,
                    cliente_id: waId,
                    nombre_cliente: clienteData ? `${clienteData.nombre || ''} ${clienteData.apellido || ''}`.trim() : null,
                    telefono_cliente: clienteData?.telefono || null,
                    categoria: servicio.titulo,
                    estado: 'pendiente_contacto'
                });
                if (error) throw error;
                
                // Llamar al backend para enviar WhatsApp
                try {
                    await fetch(`${API_BASE}/api/admin/notificar-nueva-solicitud-externa`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ waId })
                    });
                } catch (notifyErr) {
                    console.error("Error notificando por WA:", notifyErr);
                }
            } else {
                const { data, error } = await supabase.rpc('crear_solicitud_whatsapp', {
                    p_servicio_id: servicio.servicio_id,
                    p_prestador_id: servicio.prestador.prestador_id,
                    p_wa_id: waId,
                    p_metodo_pago: 'DIGITAL'
                });
                if (error) throw error;
            }
            setRequestSuccess(true);
        } catch (err) {
            console.error("Error creating request:", err);
            alert("Hubo un error al enviar tu solicitud. Intenta nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: '4rem' }}>
            {/* Header / Navbar simplificado */}
            <header style={{ backgroundColor: 'white', padding: '1rem', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: '500' }}
                    >
                        ← Volver
                    </button>
                    <h1 style={{ flex: 1, textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                        Perfil del Prestador
                    </h1>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 0 2rem 0' }}>
                {/* Cover Image */}
                <div style={{ width: '100%', height: '200px', backgroundColor: '#e5e7eb', backgroundImage: servicio.imagen_url ? `url(${servicio.imagen_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    {!servicio.imagen_url && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Sin imagen de portada</div>}
                </div>

                {/* Profile Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', margin: '-3rem 1rem 2rem 1rem', position: 'relative', zIndex: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {servicio.prestador?.usuario?.foto_perfil_url ? (
                            <img 
                                src={servicio.prestador.usuario.foto_perfil_url} 
                                alt={providerName}
                                style={{ width: '5rem', height: '5rem', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', backgroundColor: '#6c63ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                                {providerName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.25rem 0' }}>{providerName}</h2>
                            <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem' }}>Especialista en {categoriaName}</p>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b', fontWeight: '600' }}>
                                    <Star size={16} fill="currentColor" /> {servicio.prestador?.calificacion_promedio ? servicio.prestador.calificacion_promedio.toFixed(1) : 'Nuevo'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151' }}>
                                    <CheckCircle size={16} /> {servicio.prestador?.trabajos_realizados || 0} trabajos realizados
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Sobre el servicio</h3>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', margin: '0 0 1rem 0' }}>{servicio.titulo}</h4>
                        <p style={{ color: '#4b5563', lineHeight: '1.6', margin: '0 0 1.5rem 0', whiteSpace: 'pre-line' }}>
                            {servicio.descripcion}
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.75rem' }}>
                            <div>
                                <span style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem', lineHeight: '1.2' }}>Valor por hora de revisión</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>
                                    ${servicio.precio_estimado ? Number(servicio.precio_estimado).toLocaleString('es-AR') : 'A convenir'}
                                </span>
                            </div>
                            <div>
                                <span style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Modalidad</span>
                                <span style={{ fontSize: '1rem', fontWeight: '500', color: '#374151' }}>
                                    {servicio.ubicacion_servicio || 'A domicilio'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Bottom Action */}
                <div style={{ 
                    position: 'fixed', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    backgroundColor: 'white', 
                    padding: '1rem', 
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 10
                }}>
                    <button 
                        onClick={() => setShowModal(true)}
                        style={{
                            maxWidth: '800px',
                            width: '100%',
                            backgroundColor: '#25D366',
                            color: 'white',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(37, 211, 102, 0.4)',
                            cursor: 'pointer'
                        }}
                    >
                        Solicitar Servicio
                    </button>
                </div>
            </main>

            {/* Request Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '400px', width: '100%', position: 'relative'
                    }}>
                        {!requestSuccess && (
                            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        )}
                        
                        {requestSuccess ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '4rem', height: '4rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <Check size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>¡Solicitud enviada!</h3>
                                <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                    La solicitud se realizó con éxito. Te enviaremos un mensaje por WhatsApp una vez el prestador te acepte la solicitud.
                                </p>
                                <button 
                                    onClick={() => navigate('/prestadores')}
                                    style={{ width: '100%', backgroundColor: '#6c63ff', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Volver al catálogo
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Confirmar Solicitud</h3>
                                <p style={{ color: '#4b5563', marginBottom: '1rem', lineHeight: '1.5' }}>
                                    ¿Estás seguro de solicitar este servicio?
                                </p>
                                <div style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    Recordá que una vez que el prestador acepte, vas a tener que <strong>pagar 1 hora por adelantado</strong> del servicio. Si dura más de 1 hora se cobrará después de la revisión. Si después de la revisión aceptás el presupuesto, te reintegraremos el 100% del dinero de la revisión. ¡Muchas gracias por confiar en nosotros!
                                </div>
                                <button 
                                    onClick={handleRequest}
                                    disabled={isSubmitting}
                                    style={{ 
                                        width: '100%', backgroundColor: '#25D366', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isSubmitting ? 0.7 : 1
                                    }}
                                >
                                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Enviando...</> : 'Sí, solicitar servicio'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

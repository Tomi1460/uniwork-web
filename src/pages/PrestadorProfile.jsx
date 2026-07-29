import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function PrestadorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    // Hardcode of the bot number just like in PrestadoresList
    const botNumber = '5493435165239';

    useEffect(() => {
        const fetchService = async () => {
            try {
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
            } catch (err) {
                console.error("Error fetching service:", err);
                setErrorMsg("No se pudo cargar el perfil del prestador.");
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

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

    const providerName = servicio.prestador?.nombre_completo || 'Prestador Verificado';
    const categoriaName = servicio.categorias?.nombre || 'Servicio';
    const wsText = `Hola, quiero solicitar el servicio "${servicio.titulo}" de ${providerName} (${categoriaName}).`;
    const wsLink = `https://wa.me/${botNumber}?text=${encodeURIComponent(wsText)}`;

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

            <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
                {/* Profile Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: '600' }}>
                                    ⭐ {servicio.prestador?.calificacion_promedio ? servicio.prestador.calificacion_promedio.toFixed(1) : 'Nuevo'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#374151' }}>
                                    ✅ {servicio.prestador?.trabajos_realizados || 0} trabajos realizados
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
                                <span style={{ display: 'block', color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Costo Estimado</span>
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
                    <a 
                        href={wsLink}
                        style={{
                            maxWidth: '800px',
                            width: '100%',
                            backgroundColor: '#25D366',
                            color: 'white',
                            textDecoration: 'none',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(37, 211, 102, 0.4)'
                        }}
                    >
                        Solicitar por WhatsApp
                    </a>
                </div>
            </main>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SLUG_TO_CATEGORY = {
    'plomeria': 'Plomería',
    'electricidad': 'Electricidad',
    'gas': 'Gas',
    'refrigeracion': 'Refrigeración',
    'cerrajeria': 'Cerrajería'
};

export default function PrestadoresList() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const rubroSlug = searchParams.get('rubro');
    const waId = searchParams.get('wa_id');
    const categoria = SLUG_TO_CATEGORY[rubroSlug?.toLowerCase()] || rubroSlug;

    const [servicios, setServicios] = useState([]);
    const [externos, setExternos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [solicitandoExterno, setSolicitandoExterno] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                if (!categoria) { setServicios([]); setExternos([]); return; }

                // 1. Prestadores CON app
                const { data: srvData } = await supabase
                    .from('servicios')
                    .select(`
                        servicio_id,
                        titulo,
                        descripcion,
                        precio_estimado,
                        imagen_url,
                        categorias!inner(nombre),
                        prestadores(nombre_completo, usuario:usuarios(foto_perfil_url))
                    `)
                    .eq('esta_activo', true)
                    .ilike('categorias.nombre', categoria);

                // 2. Prestadores SIN app (externos)
                const { data: extData } = await supabase
                    .from('prestadores_externos')
                    .select('*')
                    .eq('activo', true)
                    .ilike('rubro', `%${categoria}%`);

                setServicios(srvData || []);
                setExternos(extData || []);
            } catch (err) {
                console.error('Error fetching prestadores:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [categoria]);

    const allEmpty = servicios.length === 0 && externos.length === 0;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%', marginTop: '60px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                    Prestadores de {categoria || 'este rubro'}
                </h1>
                <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                    Explora los prestadores disponibles y solicit\u00e1 el que m\u00e1s te convenza.
                </p>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ backgroundColor: '#e5e7eb', padding: '1.5rem', borderRadius: '1rem', height: '200px' }}></div>
                        ))}
                    </div>
                ) : allEmpty ? (
                    <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151' }}>No hay prestadores disponibles</h3>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Actualmente no contamos con prestadores activos en esta categor\u00eda.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>

                        {/* ── Prestadores CON App ── */}
                        {servicios.map((srv) => {
                            const providerName = srv.prestadores?.nombre_completo || 'Prestador Verificado';
                            const providerPhoto = srv.prestadores?.usuario?.foto_perfil_url;
                            return (
                                <div key={srv.servicio_id} style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ width: '100%', height: '160px', backgroundColor: '#e5e7eb', backgroundImage: srv.imagen_url ? `url(${srv.imagen_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                        {!srv.imagen_url && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Sin imagen</div>}
                                    </div>
                                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            {providerPhoto
                                                ? <img src={providerPhoto} alt={providerName} style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                : <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#6c63ff,#ff6584)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0 }}>{providerName.charAt(0).toUpperCase()}</div>
                                            }
                                            <div>
                                                <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.1rem' }}>{providerName}</h3>
                                                <p style={{ color: '#6c63ff', fontSize: '0.875rem', fontWeight: 500 }}>{srv.titulo}</p>
                                            </div>
                                        </div>
                                        <p style={{ color: '#4b5563', fontSize: '0.9rem', flex: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{srv.descripcion}</p>
                                        <div style={{ marginTop: 'auto' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                                                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Valor por hora</span>
                                                <span style={{ fontWeight: 'bold', color: '#111827' }}>${srv.precio_estimado ? Number(srv.precio_estimado).toLocaleString('es-AR') : 'A convenir'}</span>
                                            </div>
                                            <button onClick={() => navigate(`/servicio/${srv.servicio_id}${waId ? `?wa_id=${waId}` : ''}`)} style={{ width: '100%', backgroundColor: '#25D366', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                                Ver y Solicitar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* ── Prestadores SIN App (externos) ── */}
                        {externos.map((ext) => {
                            const providerName = `${ext.nombre} ${ext.apellido || ''}`.trim();
                            return (
                                <div key={ext.id} style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ width: '100%', height: '160px', backgroundColor: '#e5e7eb', backgroundImage: ext.imagen_url ? `url(${ext.imagen_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                        {!ext.imagen_url && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Sin imagen</div>}
                                    </div>
                                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#6c63ff,#ff6584)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', flexShrink: 0 }}>
                                                {providerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.1rem' }}>{providerName}</h3>
                                                <p style={{ color: '#6c63ff', fontSize: '0.875rem', fontWeight: 500 }}>{ext.rubro}</p>
                                            </div>
                                        </div>
                                        <p style={{ color: '#4b5563', fontSize: '0.9rem', flex: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {ext.descripcion || 'Profesional verificado por el equipo de Uniwork.'}
                                        </p>
                                        <div style={{ marginTop: 'auto' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                                                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Valor por hora</span>
                                                <span style={{ fontWeight: 'bold', color: '#111827' }}>${ext.precio_hora ? Number(ext.precio_hora).toLocaleString('es-AR') : 'A convenir'}</span>
                                            </div>
                                            <button onClick={() => navigate(`/servicio/${ext.id}?type=externo${waId ? `&wa_id=${waId}` : ''}`)} style={{ width: '100%', backgroundColor: '#25D366', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                                Ver y Solicitar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

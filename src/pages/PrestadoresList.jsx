import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    const rubroSlug = searchParams.get('rubro');
    const categoria = SLUG_TO_CATEGORY[rubroSlug?.toLowerCase()] || rubroSlug;

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrestadores = async () => {
            setLoading(true);
            try {
                if (!categoria) {
                    setServicios([]);
                    return;
                }

                const { data, error } = await supabase
                    .from('servicios')
                    .select(`
                        servicio_id, 
                        titulo, 
                        descripcion, 
                        precio_revision, 
                        prestadores(
                            usuarios:users(full_name)
                        )
                    `)
                    .eq('activo', true)
                    .ilike('categoria', categoria);

                if (error) throw error;
                setServicios(data || []);
            } catch (err) {
                console.error("Error fetching prestadores:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrestadores();
    }, [categoria]);

    const botNumber = '5493435105295';

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <Navbar />
            
            <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%', marginTop: '60px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                    Prestadores de {categoria || 'este rubro'}
                </h1>
                <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                    Explora los prestadores disponibles y solicítalos directamente por WhatsApp.
                </p>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', height: '200px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                        ))}
                    </div>
                ) : servicios.length === 0 ? (
                    <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151' }}>No hay prestadores disponibles</h3>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Actualmente no contamos con prestadores activos en esta categoría.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {servicios.map((srv) => {
                            const providerName = srv.prestadores?.usuarios?.full_name || 'Prestador Verificado';
                            const wsText = `Hola, quiero solicitar el servicio "${srv.titulo}" de ${providerName} (${categoria}).`;
                            const wsLink = `https://wa.me/${botNumber}?text=${encodeURIComponent(wsText)}`;

                            return (
                                <div key={srv.servicio_id} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundColor: '#6c63ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                            {providerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.1rem' }}>{providerName}</h3>
                                            <p style={{ color: '#6c63ff', fontSize: '0.875rem', fontWeight: '500' }}>{srv.titulo}</p>
                                        </div>
                                    </div>
                                    
                                    <p style={{ color: '#4b5563', fontSize: '0.9rem', flex: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {srv.descripcion}
                                    </p>

                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Valor de Revisión</span>
                                            <span style={{ fontWeight: 'bold', color: '#111827' }}>
                                                ${srv.precio_revision ? Number(srv.precio_revision).toLocaleString('es-AR') : 'A convenir'}
                                            </span>
                                        </div>

                                        <a 
                                            href={wsLink}
                                            style={{ 
                                                display: 'block', width: '100%', textAlign: 'center', 
                                                backgroundColor: '#25D366', color: 'white', padding: '0.75rem', 
                                                borderRadius: '0.75rem', fontWeight: 'bold', textDecoration: 'none',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseOver={(e) => e.target.style.backgroundColor = '#1ea952'}
                                            onMouseOut={(e) => e.target.style.backgroundColor = '#25D366'}
                                        >
                                            Solicitar por WhatsApp
                                        </a>
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

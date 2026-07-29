import React from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';

export default function WhatsAppRedirectPage() {
    const location = useLocation();
    const path = location.pathname;

    let status = 'success';
    let title = '¡Pago Exitoso!';
    let message = 'Hemos confirmado tu pago. Puedes volver a WhatsApp para continuar.';
    let Icon = CheckCircle;
    let iconColor = 'text-green-600';
    let bgColor = 'bg-green-100';

    if (path.includes('fallido')) {
        status = 'error';
        title = 'Pago Fallido';
        message = 'Hubo un problema al procesar tu pago. Vuelve a WhatsApp para intentarlo nuevamente.';
        Icon = AlertCircle;
        iconColor = 'text-red-600';
        bgColor = 'bg-red-100';
    } else if (path.includes('pendiente')) {
        status = 'pending';
        title = 'Pago Pendiente';
        message = 'Tu pago está en proceso. Te notificaremos por WhatsApp cuando se confirme.';
        Icon = Clock;
        iconColor = 'text-yellow-600';
        bgColor = 'bg-yellow-100';
    }

    // El número de WhatsApp del bot
    const botNumber = '5493435105295'; // Replace with actual bot number if known, or just deep link to WhatsApp
    const whatsappLink = `https://wa.me/${botNumber}`;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', maxWidth: '24rem', width: '100%' }}>
                
                <div style={{ width: '4rem', height: '4rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', backgroundColor: status === 'success' ? '#dcfce7' : status === 'error' ? '#fee2e2' : '#fef9c3' }}>
                    <Icon size={40} color={status === 'success' ? '#16a34a' : status === 'error' ? '#dc2626' : '#ca8a04'} />
                </div>
                
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>{title}</h2>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>{message}</p>
                
                <a
                    href={whatsappLink}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        width: '100%', backgroundColor: '#25D366', color: 'white', padding: '0.75rem',
                        borderRadius: '0.75rem', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s'
                    }}
                >
                    Volver a WhatsApp <ArrowRight size={20} />
                </a>
            </div>
        </div>
    );
}

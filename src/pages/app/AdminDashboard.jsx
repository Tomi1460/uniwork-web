import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  Users, Star, Mail, Phone, MapPin, Search, TrendingUp, AlertCircle,
  CheckCircle, MessageSquare, Send, X, Zap, Activity, Eye, RefreshCw,
  Clock, AlertTriangle, PhoneCall, UserX, RotateCcw, Plus, Edit2,
  Trash2, ChevronRight, Filter, Globe, Smartphone, Bot, BarChart3,
  DollarSign, Shield
} from 'lucide-react';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const ALLOWED_ADMINS = [
  'admin@uniwork.com.ar', 'ebersaldivia@gmail.com',
  'waltertomassaldiviablasco@gmail.com', 'tomassaldiviawalter@gmail.com', 'prueba@test.com'
];

const RUBROS = ['Plomería', 'Electricidad', 'Gas', 'Cerrajería', 'Refrigeración'];
const RUBRO_SLUGS = {
  'Plomería': 'plomeria', 'Electricidad': 'electricidad', 'Gas': 'gas',
  'Cerrajería': 'cerrajeria', 'Refrigeración': 'refrigeracion'
};
const ESTADO_LABELS = {
  'ESPERANDO_NOMBRE': '📝 Ingresando nombre',
  'ESPERANDO_APELLIDO': '📝 Ingresando apellido',
  'ESPERANDO_DOMICILIO': '📍 Ingresando domicilio',
  'ESPERANDO_EMAIL': '📧 Ingresando email',
  'COMPLETADO': '✅ Registrado',
  'ESPERANDO_DESCRIPCION': '🔧 Describiendo problema',
  'ESPERANDO_ACEPTACION': '⏳ Esperando prestador',
  'VALIDANDO_DATOS_ACEPTACION': '✔️ Validando datos',
  'MODIFICANDO_DATOS': '✏️ Modificando datos',
  'ELIGIENDO_FECHA': '📅 Eligiendo fecha',
  'PAGO_PENDIENTE': '💳 Pago pendiente',
};
const ESTADO_SOL_COLORS = {
  'pendiente': '#f5c518',
  'fechas_propuestas': '#6c63ff',
  'esperando_pago': '#ff9800',
  'pagada': '#43e97b',
  'rechazada': '#ff4d6d',
  'cancelada': '#aaa',
  'expirada': '#888',
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return '—';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  return `${Math.floor(diff / 86400)}d`;
}

function minutesAgo(date) {
  if (!date) return 0;
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
}

function SlaIndicator({ createdAt }) {
  const mins = minutesAgo(createdAt);
  if (mins < 30) return <span style={{ color: '#43e97b', fontSize: '0.75rem', fontWeight: 700 }}>✓ {mins}m</span>;
  if (mins < 60) return <span style={{ color: '#f5c518', fontSize: '0.75rem', fontWeight: 700, animation: 'pulse-glow 2s infinite' }}>⚠️ {mins}m</span>;
  return <span style={{ color: '#ff4d6d', fontSize: '0.75rem', fontWeight: 700, animation: 'pulse-urgent 1s infinite' }}>🚨 {mins}m</span>;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;700&display=swap');

  :root {
    --v: #6c63ff;
    --v2: #9b8fff;
    --v-dim: rgba(108,99,255,0.15);
    --v-border: rgba(108,99,255,0.3);
    --y: #f5c518;
    --y-dim: rgba(245,197,24,0.15);
    --y-border: rgba(245,197,24,0.3);
    --bg: #08080f;
    --bg2: #0d0d1a;
    --bg3: #12122a;
    --card: rgba(255,255,255,0.03);
    --card-hover: rgba(108,99,255,0.07);
    --border: rgba(255,255,255,0.07);
    --text: #f0f0ff;
    --text2: rgba(240,240,255,0.6);
    --text3: rgba(240,240,255,0.35);
    --green: #43e97b;
    --red: #ff4d6d;
    --orange: #f5c518;
  }

  .adm-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .adm-root { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }

  /* ── GRID LINES BACKGROUND ── */
  .adm-root::before {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* ── HEADER ── */
  .adm-header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(8,8,15,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--v-border);
    padding: 0 2rem;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 0 40px rgba(108,99,255,0.1);
  }
  .adm-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.4rem; font-weight: 700;
    background: linear-gradient(135deg, var(--v), var(--y));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .adm-live-badge {
    display: flex; align-items: center; gap: 0.4rem;
    background: rgba(67,233,123,0.1);
    border: 1px solid rgba(67,233,123,0.3);
    border-radius: 999px; padding: 0.25rem 0.75rem;
    font-size: 0.7rem; font-weight: 700; color: var(--green); letter-spacing: 0.08em;
  }
  .adm-live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: var(--green);
    animation: live-pulse 1.5s ease-in-out infinite;
  }
  @keyframes live-pulse {
    0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(67,233,123,0.4); }
    50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(67,233,123,0); }
  }
  .adm-user-info { display: flex; align-items: center; gap: 1rem; }
  .adm-logout-btn {
    background: rgba(255,77,109,0.1); border: 1px solid rgba(255,77,109,0.3);
    color: #ff4d6d; padding: 0.4rem 1rem; border-radius: 8px;
    cursor: pointer; font-size: 0.8rem; font-weight: 600;
    transition: all 0.2s;
  }
  .adm-logout-btn:hover { background: rgba(255,77,109,0.2); }

  /* ── LAYOUT ── */
  .adm-layout { display: flex; position: relative; z-index: 1; }

  /* ── SIDEBAR ── */
  .adm-sidebar {
    width: 220px; min-height: calc(100vh - 64px);
    background: var(--bg2);
    border-right: 1px solid var(--border);
    padding: 1.5rem 1rem;
    display: flex; flex-direction: column; gap: 0.35rem;
    position: sticky; top: 64px; height: calc(100vh - 64px);
    overflow-y: auto;
  }
  .adm-nav-item {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.7rem 1rem; border-radius: 10px;
    cursor: pointer; transition: all 0.2s;
    font-size: 0.82rem; font-weight: 500; color: var(--text2);
    position: relative; border: 1px solid transparent;
  }
  .adm-nav-item:hover { background: var(--card-hover); color: var(--text); }
  .adm-nav-item.active {
    background: linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.05));
    border-color: var(--v-border);
    color: var(--v2);
    box-shadow: inset 0 0 20px rgba(108,99,255,0.1);
  }
  .adm-nav-item.active::before {
    content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 60%; background: var(--v); border-radius: 0 3px 3px 0;
  }
  .adm-nav-badge {
    margin-left: auto;
    background: var(--red); color: white;
    border-radius: 999px; padding: 0.1rem 0.45rem;
    font-size: 0.65rem; font-weight: 800; min-width: 20px; text-align: center;
    animation: badge-pop 0.3s ease;
  }
  .adm-nav-badge.yellow { background: var(--y); color: #000; }
  @keyframes badge-pop { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
  .adm-nav-divider { height: 1px; background: var(--border); margin: 0.5rem 0; }
  .adm-nav-label { font-size: 0.65rem; font-weight: 700; color: var(--text3); letter-spacing: 0.1em; padding: 0 1rem; margin-top: 0.5rem; }

  /* ── MAIN CONTENT ── */
  .adm-main { flex: 1; padding: 2rem; overflow-y: auto; }

  /* ── STAT CARDS ── */
  .adm-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .adm-stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 1.25rem;
    position: relative; overflow: hidden;
    transition: all 0.3s;
    transform-style: preserve-3d;
  }
  .adm-stat-card:hover {
    transform: translateY(-4px) rotateX(3deg);
    border-color: var(--v-border);
    box-shadow: 0 20px 40px rgba(108,99,255,0.15), 0 0 0 1px var(--v-border);
  }
  .adm-stat-card::after {
    content: ''; position: absolute; inset: 0; border-radius: 16px;
    background: linear-gradient(135deg, rgba(108,99,255,0.05) 0%, transparent 60%);
    pointer-events: none;
  }
  .adm-stat-card .stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 0.75rem;
  }
  .adm-stat-card .stat-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2rem; font-weight: 700; line-height: 1;
    margin-bottom: 0.25rem;
  }
  .adm-stat-card .stat-label { font-size: 0.78rem; color: var(--text3); font-weight: 500; }

  /* ── SECTION HEADER ── */
  .adm-section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
  }
  .adm-section-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem; font-weight: 700; color: var(--text);
    display: flex; align-items: center; gap: 0.5rem;
  }

  /* ── GLASS CARDS ── */
  .adm-glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 1.5rem;
    backdrop-filter: blur(10px);
    transition: border-color 0.2s;
  }
  .adm-glass-card:hover { border-color: var(--v-border); }

  /* ── TABLE ── */
  .adm-table { width: 100%; border-collapse: separate; border-spacing: 0; }
  .adm-table th {
    text-align: left; font-size: 0.7rem; font-weight: 700;
    color: var(--text3); letter-spacing: 0.08em; padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  .adm-table td {
    padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.03);
    font-size: 0.82rem; color: var(--text2); vertical-align: middle;
  }
  .adm-table tr:hover td { background: var(--card-hover); color: var(--text); }

  /* ── BADGES ── */
  .adm-badge {
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.2rem 0.6rem; border-radius: 999px;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em;
    white-space: nowrap;
  }

  /* ── BUTTONS ── */
  .adm-btn {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.45rem 0.9rem; border-radius: 8px; border: none;
    font-size: 0.78rem; font-weight: 600; cursor: pointer;
    transition: all 0.2s; font-family: 'Inter', sans-serif;
  }
  .adm-btn-primary {
    background: linear-gradient(135deg, var(--v), #4a43cc);
    color: white; box-shadow: 0 4px 15px rgba(108,99,255,0.3);
  }
  .adm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(108,99,255,0.4); }
  .adm-btn-yellow {
    background: linear-gradient(135deg, var(--y), #d4a800);
    color: #000; box-shadow: 0 4px 15px rgba(245,197,24,0.25);
  }
  .adm-btn-yellow:hover { transform: translateY(-1px); }
  .adm-btn-ghost {
    background: var(--card); border: 1px solid var(--border);
    color: var(--text2);
  }
  .adm-btn-ghost:hover { background: var(--card-hover); border-color: var(--v-border); color: var(--text); }
  .adm-btn-danger { background: rgba(255,77,109,0.1); border: 1px solid rgba(255,77,109,0.3); color: var(--red); }
  .adm-btn-danger:hover { background: rgba(255,77,109,0.2); }

  /* ── INPUT ── */
  .adm-input {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1px solid var(--border); border-radius: 10px;
    padding: 0.65rem 1rem; color: var(--text);
    font-size: 0.85rem; font-family: 'Inter', sans-serif;
    outline: none; transition: all 0.2s;
  }
  .adm-input:focus { border-color: var(--v); box-shadow: 0 0 0 3px rgba(108,99,255,0.15); }
  .adm-input::placeholder { color: var(--text3); }
  .adm-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c63ff' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; padding-right: 2rem; cursor: pointer; }

  /* ── LABEL ── */
  .adm-label { font-size: 0.75rem; font-weight: 600; color: var(--text3); letter-spacing: 0.04em; margin-bottom: 0.35rem; display: block; }

  /* ── FORM GROUP ── */
  .adm-form-group { display: flex; flex-direction: column; gap: 0.35rem; }
  .adm-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

  /* ── MODAL ── */
  .adm-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px); z-index: 1000;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .adm-modal {
    background: var(--bg3); border: 1px solid var(--v-border);
    border-radius: 20px; padding: 2rem; max-width: 560px; width: 100%;
    box-shadow: 0 40px 80px rgba(108,99,255,0.2);
    animation: modal-in 0.25s ease;
  }
  @keyframes modal-in { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: none; } }
  .adm-modal-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; }

  /* ── CONVERSATION CARD ── */
  .adm-conv-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 1rem 1.25rem;
    display: flex; flex-direction: column; gap: 0.75rem;
    transition: all 0.2s;
  }
  .adm-conv-card:hover { border-color: var(--v-border); background: var(--card-hover); }

  /* ── SOLICITUD CARD ── */
  .adm-sol-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 14px; padding: 1.25rem;
    transition: all 0.2s; position: relative; overflow: hidden;
  }
  .adm-sol-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; border-radius: 3px 0 0 3px;
  }
  .adm-sol-card.sla-ok::before { background: var(--green); }
  .adm-sol-card.sla-warn::before { background: var(--orange); }
  .adm-sol-card.sla-crit::before { background: var(--red); box-shadow: 0 0 10px rgba(255,77,109,0.5); }
  .adm-sol-card:hover { border-color: var(--v-border); }

  /* ── LOADING ── */
  .adm-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--v-dim);
    border-top-color: var(--v);
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .adm-loading-center { display: flex; align-items: center; justify-content: center; padding: 3rem; }

  /* ── EMPTY STATE ── */
  .adm-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 3rem; gap: 1rem; color: var(--text3);
  }
  .adm-empty-icon { font-size: 3rem; opacity: 0.4; }

  /* ── FILTER PILLS ── */
  .adm-filter-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .adm-pill {
    padding: 0.3rem 0.9rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
    cursor: pointer; border: 1px solid var(--border); color: var(--text2);
    background: var(--card); transition: all 0.15s;
  }
  .adm-pill.active { background: var(--v-dim); border-color: var(--v); color: var(--v2); }
  .adm-pill:hover { border-color: var(--v-border); color: var(--text); }

  /* ── REALTIME FEED ── */
  .adm-feed {
    display: flex; flex-direction: column; gap: 0.5rem;
    max-height: 300px; overflow-y: auto;
  }
  .adm-feed-item {
    display: flex; align-items: flex-start; gap: 0.75rem;
    padding: 0.6rem 0.75rem; border-radius: 10px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
    font-size: 0.78rem; color: var(--text2);
    animation: feed-in 0.3s ease;
  }
  @keyframes feed-in { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
  .adm-feed-time { font-family: 'JetBrains Mono', monospace; color: var(--text3); font-size: 0.68rem; white-space: nowrap; }

  @keyframes pulse-glow { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
  @keyframes pulse-urgent { 0%,100% { opacity: 1; box-shadow: 0 0 8px rgba(255,77,109,0.5); } 50% { opacity: 0.8; box-shadow: 0 0 16px rgba(255,77,109,0.8); } }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .adm-sidebar { display: none; }
    .adm-form-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .adm-main { padding: 1rem; }
    .adm-stats-grid { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── INLINE TIMER HOOK ────────────────────────────────────────────────────────
function useTick(interval = 30000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), interval);
    return () => clearInterval(t);
  }, [interval]);
  return tick;
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const navigate = useNavigate();
  const tick = useTick(30000); // refresh SLA every 30s
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monitor');

  // ── Stats ──
  const [stats, setStats] = useState({ prestadores: 0, clientes: 0, solicitudesHoy: 0, pagosHoy: 0 });

  // ── Monitor Bot ──
  const [convActivas, setConvActivas] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);

  // ── Seguimiento CON App ──
  const [solicitudesApp, setSolicitudesApp] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [filtroRubro, setFiltroRubro] = useState('all');
  const [loadingSol, setLoadingSol] = useState(false);
  const [intervenirModal, setIntervenirModal] = useState(null);
  const [intervenirMsg, setIntervenirMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // ── Prestadores SIN App ──
  const [extTab, setExtTab] = useState('list');
  const [prestExtList, setPrestExtList] = useState([]);
  const [loadingExt, setLoadingExt] = useState(false);
  const [extForm, setExtForm] = useState({ nombre: '', apellido: '', rubro: 'Plomería', descripcion: '', precio_hora: '', telefono: '', email: '', zona: '', anos_experiencia: '', fotos_urls: [] });
  const [editingExt, setEditingExt] = useState(null);
  const [showExtForm, setShowExtForm] = useState(false);
  const [solicitudesExt, setSolicitudesExt] = useState([]);
  const [loadingSolExt, setLoadingSolExt] = useState(false);
  const [notaModal, setNotaModal] = useState(null);
  const [notaTexto, setNotaTexto] = useState('');

  // ── Imagen prestador externo ──
  const [extImagen, setExtImagen] = useState(null); // File object
  const [extImagenPreview, setExtImagenPreview] = useState(null); // URL preview
  const extImagenInputRef = useRef(null);
  const [extGaleriaFiles, setExtGaleriaFiles] = useState([]);
  const extGaleriaInputRef = useRef(null);

  // ── Pagos / Reportes (existing) ──
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [adminMessage, setAdminMessage] = useState('');
  const [sendingAdminMessage, setSendingAdminMessage] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState('servicios');
  const [prestadoresList, setPrestadoresList] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const chatEndRef = useRef(null);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      if (!ALLOWED_ADMINS.includes(user.email)) { alert('No tenés permisos de administrador'); navigate('/'); return; }
      setUser(user);
      await fetchAll();
    } catch { navigate('/login'); }
    finally { setLoading(false); }
  };

  const fetchAll = async () => {
    await Promise.all([fetchStats(), fetchConvActivas(), fetchSolicitudesApp(),
      fetchPrestExtList(), fetchSolicitudesExt(), fetchPagosPendientes(),
      fetchReportes(), fetchSupportTickets(), fetchPrestadores()]);
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    const [{ count: p }, { count: c }, { count: sw }] = await Promise.all([
      supabase.from('prestadores').select('*', { count: 'exact', head: true }),
      supabase.from('clientes').select('*', { count: 'exact', head: true }),
      supabase.from('solicitudes_whatsapp').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 86400000).toISOString()),
    ]);
    setStats({ prestadores: p || 0, clientes: c || 0, solicitudesHoy: sw || 0 });
  };

  // ── Monitor Bot ───────────────────────────────────────────────────────────
  const fetchConvActivas = async () => {
    setLoadingConv(true);
    const { data } = await supabase.from('clientes_whatsapp').select('*').neq('paso_conversacion', 'COMPLETADO').order('updated_at', { ascending: false });
    setConvActivas(data || []);
    setLoadingConv(false);
  };

  const addFeedItem = useCallback((msg, icon = '🔔') => {
    setActivityFeed(prev => [{ id: Date.now(), msg, icon, ts: new Date() }, ...prev].slice(0, 50));
  }, []);

  // Realtime: Monitor Bot
  useEffect(() => {
    const ch = supabase.channel('admin-bot-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes_whatsapp' }, (pl) => {
        fetchConvActivas();
        if (pl.eventType === 'UPDATE') addFeedItem(`${pl.new.nombre || 'Cliente'} — ${ESTADO_LABELS[pl.new.paso_conversacion] || pl.new.paso_conversacion}`, '💬');
        if (pl.eventType === 'INSERT') addFeedItem(`Nuevo cliente registrado: ${pl.new.telefono}`, '👋');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes_whatsapp' }, (pl) => {
        fetchSolicitudesApp();
        if (pl.eventType === 'INSERT') addFeedItem(`Nueva solicitud creada (${pl.new.categoria_identificada})`, '📋');
        if (pl.eventType === 'UPDATE') addFeedItem(`Solicitud ${pl.new.id?.slice(0,8)} → ${pl.new.estado}`, '🔄');
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [addFeedItem]);

  const handleResetConv = async (id) => {
    if (!confirm('¿Resetear la conversación de este cliente?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/reset-cliente/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error('Error al resetear en backend');
      addFeedItem('Conversación reseteada y notificada', '🔄');
      fetchConvActivas();
    } catch(e) {
      console.error(e);
      alert('Error reseteando conversación: ' + e.message);
    }
  };

  const handleEliminarSolicitud = async (id) => {
    if (!confirm('¿Estás seguro de ELIMINAR/CANCELAR la solicitud activa de este cliente para ambos? Se le notificará al cliente por WhatsApp y podrá pedir otra.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/eliminar-solicitud/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error('Error al eliminar en backend');
      addFeedItem('Solicitud eliminada y cliente notificado', '🗑️');
      fetchConvActivas();
    } catch(e) {
      console.error(e);
      alert('Error eliminando solicitud: ' + e.message);
    }
  };

  const handleBloquearCliente = async (id, nombre) => {
    if (!confirm(`¿Bloquear a ${nombre || 'este cliente'}? No podrá hacer nuevas solicitudes.`)) return;
    await supabase.from('clientes_whatsapp').update({ bloqueado_por_deuda: true }).eq('id', id);
    addFeedItem(`Cliente ${nombre || id.slice(0,8)} bloqueado`, '🚫');
    fetchConvActivas();
  };

  const handleDesbloquearCliente = async (id, nombre) => {
    if (!confirm(`¿Desbloquear a ${nombre || 'este cliente'}? Podrá volver a hacer solicitudes.`)) return;
    await supabase.from('clientes_whatsapp').update({ bloqueado_por_deuda: false }).eq('id', id);
    addFeedItem(`Cliente ${nombre || id.slice(0,8)} desbloqueado`, '🟢');
    fetchConvActivas();
  };

  // ── Solicitudes CON App ───────────────────────────────────────────────────
  const fetchSolicitudesApp = async () => {
    setLoadingSol(true);
    const { data } = await supabase.from('solicitudes_whatsapp')
      .select('*, clientes_whatsapp(nombre, apellido, telefono)')
      .in('estado', ['pendiente', 'fechas_propuestas', 'esperando_pago', 'pagada'])
      .order('created_at', { ascending: false });
    setSolicitudesApp(data || []);
    setLoadingSol(false);
  };

  const handleIntervenir = async () => {
    if (!intervenirMsg.trim() || !intervenirModal) return;
    setSendingMsg(true);
    try {
      await fetch(`${API_BASE}/api/admin/intervenir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono_cliente: intervenirModal.telefono, mensaje: intervenirMsg.trim() })
      });
      addFeedItem(`Intervención enviada a ${intervenirModal.nombre}`, '📤');
      setIntervenirMsg('');
      setIntervenirModal(null);
    } catch (e) { alert('Error al enviar: ' + e.message); }
    setSendingMsg(false);
  };

  const solFiltradas = solicitudesApp.filter(s => {
    if (filtroEstado !== 'all' && s.estado !== filtroEstado) return false;
    if (filtroRubro !== 'all' && s.categoria_identificada !== filtroRubro) return false;
    return true;
  });

  // ── Prestadores Externos ──────────────────────────────────────────────────
  const fetchPrestExtList = async () => {
    setLoadingExt(true);
    const { data } = await supabase.from('prestadores_externos').select('*').order('created_at', { ascending: false });
    setPrestExtList(data || []);
    setLoadingExt(false);
  };

  const fetchSolicitudesExt = async () => {
    setLoadingSolExt(true);
    const { data } = await supabase.from('solicitudes_externas')
      .select('*, prestador:prestadores_externos(nombre, apellido, rubro, telefono, email)')
      .order('created_at', { ascending: false });
    setSolicitudesExt(data || []);
    setLoadingSolExt(false);
  };

  const handleSaveExt = async () => {
    if (!extForm.nombre || !extForm.rubro) { alert('Nombre y rubro son obligatorios'); return; }

    // 1. Upload imagen si hay una nueva
    let imagenFinalUrl = extForm.imagen_url || null;
    if (extImagen) {
      const fileExt = extImagen.name.split('.').pop();
      const fileName = `externos/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage.from('servicios').upload(fileName, extImagen);
      if (uploadErr) { alert('Error al subir imagen: ' + uploadErr.message); return; }
      const { data: pubData } = supabase.storage.from('servicios').getPublicUrl(fileName);
      imagenFinalUrl = pubData.publicUrl;
    }
    // 2. Upload gallery images if any
    let finalFotosUrls = extForm.fotos_urls ? [...extForm.fotos_urls] : [];
    if (extGaleriaFiles.length > 0) {
      for (const file of extGaleriaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `externos_galeria/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage.from('servicios').upload(fileName, file);
        if (!uploadErr) {
          const { data: pubData } = supabase.storage.from('servicios').getPublicUrl(fileName);
          finalFotosUrls.push(pubData.publicUrl);
        }
      }
    }

    const payload = {
      ...extForm,
      imagen_url: imagenFinalUrl,
      fotos_urls: finalFotosUrls,
      rubro_slug: RUBRO_SLUGS[extForm.rubro] || extForm.rubro.toLowerCase(),
      precio_hora: extForm.precio_hora ? parseFloat(extForm.precio_hora) : null,
      anos_experiencia: extForm.anos_experiencia ? parseInt(extForm.anos_experiencia) : 0
    };

    if (editingExt) {
      await supabase.from('prestadores_externos').update(payload).eq('id', editingExt);
    } else {
      await supabase.from('prestadores_externos').insert(payload);
    }
    setShowExtForm(false); setEditingExt(null);
    setExtImagen(null); setExtImagenPreview(null);
    setExtGaleriaFiles([]);
    setExtForm({ nombre: '', apellido: '', rubro: 'Plomería', descripcion: '', precio_hora: '', telefono: '', email: '', zona: '', anos_experiencia: '', imagen_url: '', fotos_urls: [] });
    fetchPrestExtList();
  };

  const handleToggleExt = async (id, activo) => {
    await supabase.from('prestadores_externos').update({ activo: !activo }).eq('id', id);
    fetchPrestExtList();
  };

  const handleMarcarContactado = async () => {
    if (!notaModal) return;
    await supabase.from('solicitudes_externas').update({ estado: 'admin_contactado_prestador', notas_admin: notaTexto, updated_at: new Date().toISOString() }).eq('id', notaModal.id);
    setNotaModal(null); setNotaTexto('');
    fetchSolicitudesExt();
  };

  // ── Pagos / Soporte (existing logic simplified) ───────────────────────────
  const fetchPagosPendientes = async () => {
    setLoadingPagos(true);
    const { data } = await supabase.from('transacciones').select(`transaccion_id, monto_retenido, fecha_liberacion_fondos, solicitud_id, solicitudes(solicitud_id, prestador_id, servicio_id, prestadores(nombre_completo, cuenta_bancaria_cbu, cuenta_bancaria_alias, cuenta_bancaria_titular, mercadopago_email), servicios(titulo))`).eq('estado_garantia', 'PENDIENTE').lte('fecha_liberacion_fondos', new Date().toISOString()).order('fecha_liberacion_fondos', { ascending: true });
    setPagosPendientes(data || []);
    setLoadingPagos(false);
  };

  const fetchReportes = async () => {
    setLoadingReportes(true);
    const { data } = await supabase.from('reportes_servicios').select(`*, cliente:clientes!reportes_servicios_cliente_id_fkey(nombre_completo), prestador:prestadores!reportes_servicios_prestador_id_fkey(nombre_completo), servicio:servicios!reportes_servicios_servicio_id_fkey(titulo)`).order('fecha_reporte', { ascending: false });
    setReportes(data || []);
    setLoadingReportes(false);
  };

  const fetchSupportTickets = async () => {
    const { data } = await supabase.from('support_tickets').select(`ticket_id, usuario_id, estado, tipo, motivo, created_at, updated_at, usuario:usuarios(email, telefono, foto_perfil_url, cliente:clientes(nombre_completo), prestador:prestadores(nombre_completo))`).eq('estado', 'ABIERTO').order('updated_at', { ascending: false });
    if (!data) return;
    let totalUnread = 0;
    const processed = await Promise.all(data.map(async t => {
      const clientObj = Array.isArray(t.usuario?.cliente) ? t.usuario.cliente[0] : t.usuario?.cliente;
      const providerObj = Array.isArray(t.usuario?.prestador) ? t.usuario.prestador[0] : t.usuario?.prestador;
      const { count: uc } = await supabase.from('support_messages').select('*', { count: 'exact', head: true }).eq('ticket_id', t.ticket_id).eq('es_admin', false).eq('leido', false);
      totalUnread += (uc || 0);
      return { ...t, nombre_usuario: clientObj?.nombre_completo || providerObj?.nombre_completo || 'Desconocido', email: t.usuario?.email || '', es_cliente: !!t.usuario?.cliente, es_prestador: !!t.usuario?.prestador, unread_count: uc || 0 };
    }));
    setUnreadMessages(totalUnread);
    setSupportTickets(processed);
  };

  const fetchPrestadores = async () => {
    const { data } = await supabase.from('prestadores').select('*, usuario:usuarios!inner(email, foto_perfil_url, telefono)');
    const sorted = (data || []).sort((a, b) => (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0));
    setPrestadoresList(sorted);
  };

  const fetchTicketMessages = async (ticket) => {
    setSelectedTicket(ticket);
    const { data } = await supabase.from('support_messages').select('*').eq('ticket_id', ticket.ticket_id).order('created_at', { ascending: true });
    setTicketMessages(data || []);
    await supabase.from('support_messages').update({ leido: true }).eq('ticket_id', ticket.ticket_id).eq('es_admin', false).eq('leido', false);
    fetchSupportTickets();
  };

  const handleSendAdminMessage = async (e) => {
    e.preventDefault();
    if (!adminMessage.trim() || !selectedTicket) return;
    setSendingAdminMessage(true);
    const msg = adminMessage.trim();
    setTicketMessages(prev => [...prev, { message_id: 'temp-' + Date.now(), message: msg, created_at: new Date().toISOString(), es_admin: true, leido: false }]);
    setAdminMessage('');
    await supabase.from('support_messages').insert([{ ticket_id: selectedTicket.ticket_id, message: msg, es_admin: true, leido: false }]);
    await supabase.from('support_tickets').update({ updated_at: new Date().toISOString() }).eq('ticket_id', selectedTicket.ticket_id);
    fetchTicketMessages(selectedTicket);
    setSendingAdminMessage(false);
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket || !confirm('¿Cerrar este ticket?')) return;
    await supabase.from('support_tickets').update({ estado: 'CERRADO' }).eq('ticket_id', selectedTicket.ticket_id);
    setSelectedTicket(null);
    setTimeout(fetchSupportTickets, 500);
  };

  useEffect(() => {
    if (selectedTicket) {
      const sub = supabase.channel(`msgs-${selectedTicket.ticket_id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${selectedTicket.ticket_id}` }, pl => {
          setTicketMessages(prev => prev.some(m => m.message_id === pl.new.message_id) ? prev : [...prev, pl.new]);
        }).subscribe();
      return () => supabase.removeChannel(sub);
    }
  }, [selectedTicket?.ticket_id]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [ticketMessages, selectedTicket]);

  const handleProcesarPago = async (t) => {
    if (!confirm(`¿Confirmar transferencia de $${t.monto_retenido} a ${t.solicitudes.prestadores.nombre_completo}?`)) return;
    const { error } = await supabase.rpc('confirmar_transferencia_realizada', { p_transaccion_id: t.transaccion_id });
    if (error) { alert('Error: ' + error.message); return; }
    alert('Pago procesado ✅');
    fetchPagosPendientes();
  };

  const handleCambiarEstadoReporte = async (id, estado) => {
    await supabase.from('reportes_servicios').update({ estado, fecha_resolucion: estado === 'RESUELTO' ? new Date().toISOString() : null }).eq('reporte_id', id);
    fetchReportes();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{STYLES}</style>
      <div className="adm-spinner" style={{ width: 60, height: 60, borderWidth: 4 }}></div>
      <p style={{ color: 'rgba(240,240,255,0.5)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>Cargando Panel de Control...</p>
    </div>
  );

  // ─── NAV CONFIG ───────────────────────────────────────────────────────────
  const navItems = [
    { id: 'monitor', icon: Bot, label: 'Monitor Bot', badge: convActivas.length || null },
    { id: 'seguimiento', icon: Smartphone, label: 'Con App', badge: solicitudesApp.filter(s => minutesAgo(s.created_at) > 60 && s.estado === 'pendiente').length || null, badgeClass: 'yellow' },
    { id: 'externos', icon: Globe, label: 'Sin App', badge: solicitudesExt.filter(s => s.estado === 'pendiente_contacto').length || null },
    null, // divider
    { id: 'pagos-pendientes', icon: DollarSign, label: 'Pagos', badge: pagosPendientes.length || null },
    { id: 'reportes', icon: AlertTriangle, label: 'Reportes', badge: reportes.filter(r => r.estado === 'PENDIENTE').length || null },
    { id: 'soporte', icon: MessageSquare, label: 'Soporte', badge: unreadMessages || null },
    { id: 'prestadores', icon: Users, label: 'Prestadores' },
    { id: 'estadisticas', icon: BarChart3, label: 'Estadísticas' },
  ];

  return (
    <div className="adm-root">
      <style>{STYLES}</style>

      {/* HEADER */}
      <header className="adm-header">
        <div className="adm-logo">
          <Zap size={20} color="#f5c518" />
          Uni<span style={{ color: '#f5c518' }}>work</span>
          <span style={{ color: 'rgba(240,240,255,0.4)', fontWeight: 400, fontSize: '0.85rem', marginLeft: '0.25rem' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="adm-live-badge"><div className="adm-live-dot"></div>EN VIVO</div>
          <span style={{ color: 'rgba(240,240,255,0.4)', fontSize: '0.78rem' }}>{user?.email}</span>
          <button className="adm-logout-btn" onClick={handleLogout}>Salir</button>
        </div>
      </header>

      <div className="adm-layout">
        {/* SIDEBAR */}
        <aside className="adm-sidebar">
          <span className="adm-nav-label">OPERACIONES</span>
          {navItems.map((item, i) => {
            if (item === null) return <div key={i} className="adm-nav-divider" />;
            const Icon = item.icon;
            return (
              <div key={item.id} className={`adm-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
                <Icon size={16} />
                {item.label}
                {item.badge ? <span className={`adm-nav-badge ${item.badgeClass || ''}`}>{item.badge}</span> : null}
              </div>
            );
          })}
        </aside>

        {/* MAIN */}
        <main className="adm-main">

          {/* STATS ROW — siempre visible */}
          <div className="adm-stats-grid">
            {[
              { label: 'Prestadores', value: stats.prestadores, icon: <Users size={18} />, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
              { label: 'Clientes', value: stats.clientes, icon: <Users size={18} />, color: '#43e97b', bg: 'rgba(67,233,123,0.15)' },
              { label: 'Solicitudes hoy', value: stats.solicitudesHoy, icon: <Activity size={18} />, color: '#f5c518', bg: 'rgba(245,197,24,0.15)' },
              { label: 'Conversaciones activas', value: convActivas.length, icon: <Bot size={18} />, color: '#ff4d6d', bg: 'rgba(255,77,109,0.15)' },
              { label: 'Sin App pendientes', value: solicitudesExt.filter(s => s.estado === 'pendiente_contacto').length, icon: <Globe size={18} />, color: '#9b8fff', bg: 'rgba(155,143,255,0.15)' },
            ].map((s, i) => (
              <div key={i} className="adm-stat-card">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ════════ TAB: MONITOR BOT ════════ */}
          {activeTab === 'monitor' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
              {/* Left: conversaciones */}
              <div>
                <div className="adm-section-header">
                  <div className="adm-section-title"><Bot size={18} color="#6c63ff" /> Conversaciones Activas</div>
                  <button className="adm-btn adm-btn-ghost" onClick={fetchConvActivas}><RefreshCw size={14} />Actualizar</button>
                </div>
                {loadingConv ? <div className="adm-loading-center"><div className="adm-spinner"></div></div>
                  : convActivas.length === 0
                  ? <div className="adm-empty"><div className="adm-empty-icon">🤖</div><p>Sin conversaciones activas</p></div>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {convActivas.map(c => (
                      <div key={c.id} className="adm-conv-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #f5c518)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                              {(c.nombre || c.telefono || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.nombre ? `${c.nombre} ${c.apellido || ''}`.trim() : c.telefono}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{c.telefono}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--v2)', fontWeight: 600 }}>{ESTADO_LABELS[c.paso_conversacion] || c.paso_conversacion}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: 2 }}><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{timeAgo(c.updated_at)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            className="adm-btn adm-btn-ghost"
                            style={{ fontSize: '0.72rem' }}
                            title="Ver ficha completa del cliente y el estado de su conversación"
                            onClick={() => setSelectedConv(selectedConv?.id === c.id ? null : c)}
                          ><Eye size={12} />Detalle</button>
                          <button
                            className="adm-btn adm-btn-ghost"
                            style={{ fontSize: '0.72rem' }}
                            title="Resetear la conversación: vuelve al estado 'listo para pedir', útil si el cliente quedó atascado en un paso"
                            onClick={() => handleResetConv(c.id)}
                          ><RotateCcw size={12} />Resetear</button>
                          {(c.datos_temporales?.solicitud_activa_id || c.datos_temporales?.solicitud_id) && (
                            <button
                              className="adm-btn adm-btn-danger"
                              style={{ fontSize: '0.72rem', background: 'rgba(255,59,48,0.1)' }}
                              title="Eliminar solicitud: Cancela la solicitud actual, saca al prestador, y reinicia al cliente para que pida otra vez"
                              onClick={() => handleEliminarSolicitud(c.id)}
                            ><Trash2 size={12} />Eliminar Sol.</button>
                          )}
                          {c.bloqueado_por_deuda ? (
                            <button
                              className="adm-btn"
                              style={{ fontSize: '0.72rem', background: 'rgba(67,233,123,0.12)', border: '1px solid rgba(67,233,123,0.35)', color: '#43e97b' }}
                              title="Desbloquear: el cliente podrá volver a hacer solicitudes"
                              onClick={() => handleDesbloquearCliente(c.id, c.nombre)}
                            ><CheckCircle size={12} />Desbloquear</button>
                          ) : (
                            <button
                              className="adm-btn adm-btn-danger"
                              style={{ fontSize: '0.72rem' }}
                              title="Bloquear por deuda: el cliente no podrá hacer nuevas solicitudes hasta que regularice un pago pendiente"
                              onClick={() => handleBloquearCliente(c.id, c.nombre)}
                            ><UserX size={12} />Bloquear</button>
                          )}
                          {c.telefono && <a href={`https://wa.me/${c.telefono}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-yellow" style={{ fontSize: '0.72rem', textDecoration: 'none' }} title="Abrir chat de WhatsApp con este cliente"><Phone size={12} />WA</a>}
                        </div>
                        {selectedConv?.id === c.id && (() => {
                          const dt = c.datos_temporales || {};
                          const rows = [
                            { label: 'Nombre', value: `${c.nombre || '—'} ${c.apellido || ''}`.trim() },
                            { label: 'Teléfono', value: c.telefono || '—' },
                            { label: 'Email', value: c.email || dt.email || '—' },
                            { label: 'Domicilio', value: c.domicilio || dt.domicilio || '—' },
                            { label: 'Paso actual', value: ESTADO_LABELS[c.paso_conversacion] || c.paso_conversacion || '—' },
                            { label: 'Categoría en proceso', value: dt.categoria_detectada || '—' },
                            { label: 'Descripción del problema', value: dt.descripcion_problema || '—' },
                            { label: 'Prestador asignado', value: dt.prestador_nombre || '—' },
                            { label: 'Fecha elegida', value: dt.fecha_seleccionada || '—' },
                            { label: 'Monto reserva', value: dt.monto_reserva ? `$${dt.monto_reserva.toLocaleString('es-AR')}` : '—' },
                            { label: 'Solicitud ID', value: dt.solicitud_activa_id || dt.solicitud_id ? (dt.solicitud_activa_id || dt.solicitud_id).slice(0, 12) + '…' : '—' },
                            { label: 'Bloqueado por deuda', value: c.bloqueado_por_deuda ? '🔴 SÍ' : '🟢 No' },
                          ];
                          return (
                            <div style={{ background: 'rgba(108,99,255,0.05)', borderRadius: 10, padding: '0.9rem 1rem', border: '1px solid var(--v-border)' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--v2)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>📋 FICHA DE CONVERSACIÓN</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1.5rem' }}>
                                {rows.map(({ label, value }) => (
                                  <div key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.3rem' }}>
                                    <div style={{ fontSize: '0.62rem', color: 'var(--text3)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.1rem' }}>{label.toUpperCase()}</div>
                                    <div style={{ fontSize: '0.78rem', color: value === '—' ? 'var(--text3)' : 'var(--text)', fontWeight: value !== '—' ? 500 : 400 }}>{value}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                }
              </div>

              {/* Right: feed */}
              <div>
                <div className="adm-section-header">
                  <div className="adm-section-title"><Activity size={18} color="#43e97b" />Feed en Vivo</div>
                </div>
                <div className="adm-glass-card" style={{ padding: '1rem' }}>
                  {activityFeed.length === 0
                    ? <div className="adm-empty" style={{ padding: '2rem' }}><div className="adm-empty-icon">📡</div><p style={{ fontSize: '0.8rem' }}>Esperando actividad...</p></div>
                    : <div className="adm-feed">
                      {activityFeed.map(item => (
                        <div key={item.id} className="adm-feed-item">
                          <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div>{item.msg}</div>
                            <div className="adm-feed-time">{item.ts.toLocaleTimeString('es-AR')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB: SEGUIMIENTO CON APP ════════ */}
          {activeTab === 'seguimiento' && (
            <div>
              <div className="adm-section-header">
                <div className="adm-section-title"><Smartphone size={18} color="#6c63ff" />Solicitudes — Prestadores con App</div>
                <button className="adm-btn adm-btn-ghost" onClick={fetchSolicitudesApp}><RefreshCw size={14} />Actualizar</button>
              </div>

              {/* Filtros */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div className="adm-label" style={{ marginBottom: '0.4rem' }}>Estado</div>
                  <div className="adm-filter-pills">
                    {['all', 'pendiente', 'fechas_propuestas', 'esperando_pago', 'pagada'].map(s => (
                      <div key={s} className={`adm-pill ${filtroEstado === s ? 'active' : ''}`} onClick={() => setFiltroEstado(s)}>
                        {s === 'all' ? 'Todos' : s.replace('_', ' ')}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="adm-label" style={{ marginBottom: '0.4rem' }}>Rubro</div>
                  <div className="adm-filter-pills">
                    {['all', ...RUBROS].map(r => (
                      <div key={r} className={`adm-pill ${filtroRubro === r ? 'active' : ''}`} onClick={() => setFiltroRubro(r)}>
                        {r === 'all' ? 'Todos' : r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {loadingSol
                ? <div className="adm-loading-center"><div className="adm-spinner"></div></div>
                : solFiltradas.length === 0
                ? <div className="adm-empty"><div className="adm-empty-icon">📱</div><p>Sin solicitudes activas</p></div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {solFiltradas.map(s => {
                    const mins = minutesAgo(s.created_at);
                    const slaClass = mins < 30 ? 'sla-ok' : mins < 60 ? 'sla-warn' : 'sla-crit';
                    const cliente = s.clientes_whatsapp;
                    const estadoColor = ESTADO_SOL_COLORS[s.estado] || '#aaa';
                    return (
                      <div key={s.id} className={`adm-sol-card ${slaClass}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                              <span className="adm-badge" style={{ background: `${estadoColor}22`, border: `1px solid ${estadoColor}44`, color: estadoColor }}>
                                {s.estado?.replace(/_/g, ' ')}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--v2)', fontWeight: 600 }}>{s.categoria_identificada}</span>
                              <SlaIndicator createdAt={s.created_at} />
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                              {cliente ? `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Cliente WA' : 'Cliente'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '0.5rem' }}>
                              {s.descripcion_problema ? `"${s.descripcion_problema.slice(0, 120)}..."` : 'Sin descripción'}
                            </div>
                            {s.prestador_nombre && <div style={{ fontSize: '0.78rem', color: 'var(--v2)' }}>Prestador: <strong>{s.prestador_nombre}</strong></div>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            {cliente?.telefono && (
                              <>
                                <button className="adm-btn adm-btn-yellow" style={{ fontSize: '0.72rem' }} onClick={() => setIntervenirModal({ telefono: cliente.telefono, nombre: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() })}>
                                  <Send size={12} />Intervenir
                                </button>
                                <a href={`https://wa.me/${cliente.telefono}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost" style={{ fontSize: '0.72rem', textDecoration: 'none' }}>
                                  <Phone size={12} />WA Cliente
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '0.5rem' }}>
                          ID: {s.id?.slice(0, 8)} · Creada: {new Date(s.created_at).toLocaleString('es-AR')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            </div>
          )}

          {/* ════════ TAB: GESTIÓN SIN APP ════════ */}
          {activeTab === 'externos' && (
            <div>
              <div className="adm-section-header">
                <div className="adm-section-title"><Globe size={18} color="#9b8fff" />Prestadores Sin App</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="adm-filter-pills">
                    <div className={`adm-pill ${extTab === 'list' ? 'active' : ''}`} onClick={() => setExtTab('list')}>Prestadores</div>
                    <div className={`adm-pill ${extTab === 'solicitudes' ? 'active' : ''}`} onClick={() => setExtTab('solicitudes')}>
                      Solicitudes {solicitudesExt.filter(s => s.estado === 'pendiente_contacto').length > 0 && <span className="adm-nav-badge" style={{ marginLeft: 4 }}>{solicitudesExt.filter(s => s.estado === 'pendiente_contacto').length}</span>}
                    </div>
                  </div>
                  {extTab === 'list' && <button className="adm-btn adm-btn-primary" onClick={() => { setShowExtForm(true); setEditingExt(null); setExtForm({ nombre: '', apellido: '', rubro: 'Plomería', descripcion: '', precio_hora: '', telefono: '', email: '', zona: '', anos_experiencia: '' }); }}><Plus size={14} />Nuevo</button>}
                </div>
              </div>

              {/* SUB-TAB: LISTA */}
              {extTab === 'list' && (
                loadingExt
                  ? <div className="adm-loading-center"><div className="adm-spinner"></div></div>
                  : prestExtList.length === 0
                  ? <div className="adm-empty"><div className="adm-empty-icon">🌐</div><p>Sin prestadores externos. ¡Crea el primero!</p></div>
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {prestExtList.map(p => (
                      <div key={p.id} className="adm-glass-card" style={{ opacity: p.activo ? 1 : 0.5 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.nombre} {p.apellido || ''}</div>
                            <span className="adm-badge" style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', color: '#9b8fff', marginTop: 4 }}>{p.rubro}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="adm-btn adm-btn-ghost" style={{ padding: '0.3rem 0.6rem' }} onClick={() => { setEditingExt(p.id); setExtForm({ nombre: p.nombre, apellido: p.apellido || '', rubro: p.rubro, descripcion: p.descripcion || '', precio_hora: p.precio_hora || '', telefono: p.telefono || '', email: p.email || '', zona: p.zona || '', anos_experiencia: p.anos_experiencia || '', imagen_url: p.imagen_url || '', fotos_urls: p.fotos_urls || [] }); setShowExtForm(true); }}><Edit2 size={13} /></button>
                            <button className="adm-btn adm-btn-ghost" style={{ padding: '0.3rem 0.6rem', color: p.activo ? 'var(--red)' : 'var(--green)' }} onClick={() => handleToggleExt(p.id, p.activo)}>{p.activo ? <X size={13} /> : <CheckCircle size={13} />}</button>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>{p.descripcion?.slice(0, 100) || '—'}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text3)' }}>
                          {p.precio_hora && <span>💰 ${Number(p.precio_hora).toLocaleString('es-AR')}/h</span>}
                          {p.anos_experiencia > 0 && <span>⭐ {p.anos_experiencia} años exp.</span>}
                          {p.zona && <span>📍 {p.zona}</span>}
                          {p.telefono && <a href={`https://wa.me/${p.telefono}`} target="_blank" rel="noopener noreferrer" style={{ color: '#43e97b', textDecoration: 'none' }}>📱 WA</a>}
                        </div>
                      </div>
                    ))}
                  </div>
              )}

              {/* SUB-TAB: SOLICITUDES MANUALES */}
              {extTab === 'solicitudes' && (
                loadingSolExt
                  ? <div className="adm-loading-center"><div className="adm-spinner"></div></div>
                  : solicitudesExt.length === 0
                  ? <div className="adm-empty"><div className="adm-empty-icon">📬</div><p>Sin solicitudes manuales</p></div>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {solicitudesExt.map(s => {
                      const mins = minutesAgo(s.created_at);
                      const slaClass = mins < 30 ? 'sla-ok' : mins < 60 ? 'sla-warn' : 'sla-crit';
                      const prest = s.prestador;
                      const msgPrestador = prest ? encodeURIComponent(`Hola ${prest.nombre}, tenemos un cliente interesado en tu servicio de ${prest.rubro}. ¿Tenés disponibilidad?\n\nProblema del cliente: ${s.descripcion_problema || 'sin descripción'}\n\nContacto: ${s.nombre_cliente || ''} ${s.telefono_cliente ? `(${s.telefono_cliente})` : ''}`) : '';
                      const msgCliente = s.telefono_cliente ? encodeURIComponent(`Hola${s.nombre_cliente ? ` ${s.nombre_cliente}` : ''}, te avisamos que ya estamos en contacto con el prestador para tu solicitud de ${s.categoria || 'servicio'}. En breve te confirmamos.`) : '';
                      const estadoColors = { 'pendiente_contacto': '#f5c518', 'admin_contactado_prestador': '#6c63ff', 'prestador_confirmado': '#43e97b', 'cerrada': '#aaa', 'cancelada': '#888' };
                      const ec = estadoColors[s.estado] || '#aaa';
                      return (
                        <div key={s.id} className={`adm-sol-card ${slaClass}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                <span className="adm-badge" style={{ background: `${ec}22`, border: `1px solid ${ec}44`, color: ec }}>{s.estado?.replace(/_/g, ' ')}</span>
                                <SlaIndicator createdAt={s.created_at} />
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <div>
                                  <div style={{ color: 'var(--text3)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em' }}>CLIENTE</div>
                                  <div style={{ fontWeight: 600 }}>{s.nombre_cliente || 'Sin nombre'}</div>
                                  <div style={{ color: 'var(--text3)' }}>{s.telefono_cliente || '—'}</div>
                                </div>
                                <div>
                                  <div style={{ color: 'var(--text3)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em' }}>PRESTADOR</div>
                                  <div style={{ fontWeight: 600 }}>{prest?.nombre} {prest?.apellido || ''}</div>
                                  <div style={{ color: 'var(--text3)' }}>{prest?.rubro} · {prest?.telefono || '—'}</div>
                                </div>
                              </div>
                              {s.descripcion_problema && <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text2)', fontStyle: 'italic' }}>"{s.descripcion_problema.slice(0, 150)}"</div>}
                              {s.notas_admin && <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', background: 'rgba(108,99,255,0.08)', border: '1px solid var(--v-border)', borderRadius: 8, padding: '0.4rem 0.6rem', color: 'var(--v2)' }}>📝 {s.notas_admin}</div>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 160 }}>
                              {s.estado === 'pendiente_contacto' && <button className="adm-btn adm-btn-primary" style={{ fontSize: '0.72rem' }} onClick={() => { setNotaModal(s); setNotaTexto(''); }}><CheckCircle size={12} />Marcar Contactado</button>}
                              {prest?.telefono && <a href={`https://wa.me/${prest.telefono}?text=${msgPrestador}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-yellow" style={{ fontSize: '0.72rem', textDecoration: 'none', justifyContent: 'center' }}><Phone size={12} />WA Prestador</a>}
                              {s.telefono_cliente && <a href={`https://wa.me/${s.telefono_cliente}?text=${msgCliente}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost" style={{ fontSize: '0.72rem', textDecoration: 'none', justifyContent: 'center' }}><Phone size={12} />WA Cliente</a>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              )}
            </div>
          )}

          {/* ════════ TAB: PAGOS PENDIENTES ════════ */}
          {activeTab === 'pagos-pendientes' && (
            <div>
              <div className="adm-section-header">
                <div className="adm-section-title"><DollarSign size={18} color="#43e97b" />Pagos Listos para Transferir</div>
                <button className="adm-btn adm-btn-ghost" onClick={fetchPagosPendientes} disabled={loadingPagos}><RefreshCw size={14} />{loadingPagos ? 'Cargando...' : 'Actualizar'}</button>
              </div>
              {loadingPagos ? <div className="adm-loading-center"><div className="adm-spinner"></div></div>
                : pagosPendientes.length === 0
                ? <div className="adm-empty"><div className="adm-empty-icon">✅</div><p>Sin pagos pendientes</p></div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pagosPendientes.map(p => (
                    <div key={p.transaccion_id} className="adm-glass-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{p.solicitudes?.prestadores?.nombre_completo}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Servicio: {p.solicitudes?.servicios?.titulo || '—'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>CBU: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{p.solicitudes?.prestadores?.cuenta_bancaria_cbu || '—'}</span></div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Alias: {p.solicitudes?.prestadores?.cuenta_bancaria_alias || '—'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Titular: {p.solicitudes?.prestadores?.cuenta_bancaria_titular || '—'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#43e97b', fontFamily: 'Space Grotesk, sans-serif' }}>${parseFloat(p.monto_retenido).toFixed(2)}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button className="adm-btn adm-btn-ghost" onClick={() => { const d = p.solicitudes?.prestadores; navigator.clipboard.writeText(`Monto: $${p.monto_retenido}\nCBU: ${d?.cuenta_bancaria_cbu}\nAlias: ${d?.cuenta_bancaria_alias}\nTitular: ${d?.cuenta_bancaria_titular}`); }}><Copy size={13} />Copiar</button>
                            <button className="adm-btn adm-btn-primary" onClick={() => handleProcesarPago(p)}><CheckCircle size={13} />Confirmar Pago</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ════════ TAB: REPORTES ════════ */}
          {activeTab === 'reportes' && (
            <div>
              <div className="adm-section-header">
                <div className="adm-section-title"><AlertTriangle size={18} color="#f5c518" />Reportes</div>
                <button className="adm-btn adm-btn-ghost" onClick={fetchReportes}><RefreshCw size={14} />Actualizar</button>
              </div>
              <div className="adm-glass-card">
                <table className="adm-table">
                  <thead><tr><th>Servicio</th><th>Cliente</th><th>Prestador</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {reportes.map(r => (
                      <tr key={r.reporte_id}>
                        <td style={{ color: 'var(--text)' }}>{r.servicio?.titulo || '—'}</td>
                        <td>{r.cliente?.nombre_completo || '—'}</td>
                        <td>{r.prestador?.nombre_completo || '—'}</td>
                        <td style={{ maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.motivo || '—'}</div></td>
                        <td><span className="adm-badge" style={{ background: r.estado === 'PENDIENTE' ? 'rgba(245,197,24,0.15)' : 'rgba(67,233,123,0.15)', border: r.estado === 'PENDIENTE' ? '1px solid rgba(245,197,24,0.4)' : '1px solid rgba(67,233,123,0.4)', color: r.estado === 'PENDIENTE' ? '#f5c518' : '#43e97b' }}>{r.estado}</span></td>
                        <td>
                          {r.estado === 'PENDIENTE' && (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="adm-btn adm-btn-primary" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }} onClick={() => handleCambiarEstadoReporte(r.reporte_id, 'RESUELTO')}>Resolver</button>
                              <button className="adm-btn adm-btn-ghost" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }} onClick={() => handleCambiarEstadoReporte(r.reporte_id, 'RECHAZADO')}>Rechazar</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportes.length === 0 && <div className="adm-empty"><div className="adm-empty-icon">🚨</div><p>Sin reportes</p></div>}
              </div>
            </div>
          )}

          {/* ════════ TAB: SOPORTE ════════ */}
          {activeTab === 'soporte' && (
            <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
              <div>
                <div className="adm-section-header">
                  <div className="adm-section-title"><MessageSquare size={18} color="#6c63ff" />Tickets Abiertos</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {supportTickets.length === 0
                    ? <div className="adm-empty"><div className="adm-empty-icon">💬</div><p>Sin tickets abiertos</p></div>
                    : supportTickets.map(t => (
                      <div key={t.ticket_id} className="adm-glass-card" style={{ cursor: 'pointer', border: selectedTicket?.ticket_id === t.ticket_id ? '1px solid var(--v)' : undefined }} onClick={() => fetchTicketMessages(t)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.nombre_usuario}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{t.email}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: '0.3rem' }}>{t.motivo || t.tipo}</div>
                          </div>
                          {t.unread_count > 0 && <span className="adm-nav-badge">{t.unread_count}</span>}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              {selectedTicket && (
                <div className="adm-glass-card" style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedTicket.nombre_usuario}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="adm-btn adm-btn-danger" style={{ fontSize: '0.75rem' }} onClick={handleCloseTicket}>Cerrar Ticket</button>
                      <button className="adm-btn adm-btn-ghost" style={{ padding: '0.3rem 0.6rem' }} onClick={() => setSelectedTicket(null)}><X size={14} /></button>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                    {ticketMessages.map(msg => (
                      <div key={msg.message_id} style={{ display: 'flex', justifyContent: msg.es_admin ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '75%', padding: '0.6rem 0.9rem', borderRadius: msg.es_admin ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.es_admin ? 'linear-gradient(135deg, var(--v), #4a43cc)' : 'rgba(255,255,255,0.06)', fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5 }}>
                          {msg.message}
                          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem', textAlign: 'right' }}>{new Date(msg.created_at).toLocaleTimeString('es-AR')}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendAdminMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <input className="adm-input" value={adminMessage} onChange={e => setAdminMessage(e.target.value)} placeholder="Escribir respuesta..." />
                    <button type="submit" className="adm-btn adm-btn-primary" disabled={sendingAdminMessage}><Send size={14} /></button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ════════ TAB: PRESTADORES ════════ */}
          {activeTab === 'prestadores' && (
            <div>
              <div className="adm-section-header">
                <div className="adm-section-title"><Users size={18} color="#6c63ff" />Prestadores con App</div>
              </div>
              <div className="adm-glass-card">
                <table className="adm-table">
                  <thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Calificación</th><th>Estado</th></tr></thead>
                  <tbody>
                    {prestadoresList.map(p => (
                      <tr key={p.prestador_id}>
                        <td style={{ color: 'var(--text)', fontWeight: 600 }}>{p.nombre_completo}</td>
                        <td>{p.usuario?.email || '—'}</td>
                        <td>{p.usuario?.telefono || '—'}</td>
                        <td>
                          <span style={{ color: '#f5c518', fontWeight: 700 }}>★ {p.calificacion_promedio?.toFixed(1) || '—'}</span>
                        </td>
                        <td>
                          <span className="adm-badge" style={{ background: p.membresia_activa ? 'rgba(67,233,123,0.15)' : 'rgba(255,77,109,0.15)', border: p.membresia_activa ? '1px solid rgba(67,233,123,0.3)' : '1px solid rgba(255,77,109,0.3)', color: p.membresia_activa ? '#43e97b' : '#ff4d6d' }}>
                            {p.membresia_activa ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {prestadoresList.length === 0 && <div className="adm-empty"><div className="adm-empty-icon">🔧</div><p>Sin prestadores</p></div>}
              </div>
            </div>
          )}

          {/* ════════ TAB: ESTADÍSTICAS ════════ */}
          {activeTab === 'estadisticas' && (
            <div>
              <div className="adm-section-title" style={{ marginBottom: '1.5rem' }}><BarChart3 size={18} color="#6c63ff" />Estadísticas Generales</div>
              <div className="adm-stats-grid">
                {[
                  { label: 'Total Prestadores App', value: stats.prestadores, color: '#6c63ff' },
                  { label: 'Total Clientes', value: stats.clientes, color: '#43e97b' },
                  { label: 'Solicitudes hoy', value: stats.solicitudesHoy, color: '#f5c518' },
                  { label: 'Conversaciones activas', value: convActivas.length, color: '#ff4d6d' },
                  { label: 'Prestadores externos', value: prestExtList.length, color: '#9b8fff' },
                  { label: 'Solicitudes sin app', value: solicitudesExt.length, color: '#43e97b' },
                  { label: 'Pagos a liquidar', value: pagosPendientes.length, color: '#f5c518' },
                  { label: 'Tickets abiertos', value: supportTickets.length, color: '#ff4d6d' },
                ].map((s, i) => (
                  <div key={i} className="adm-stat-card">
                    <div className="stat-value" style={{ color: s.color, fontSize: '1.8rem' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── MODAL: INTERVENIR ── */}
      {intervenirModal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setIntervenirModal(null)}>
          <div className="adm-modal">
            <div className="adm-modal-title"><Send size={18} color="#6c63ff" style={{ marginRight: 8 }} />Intervenir en conversación</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '1rem' }}>Este mensaje llegará al cliente <strong>{intervenirModal.nombre}</strong> ({intervenirModal.telefono}) a través del bot de WhatsApp.</p>
            <div className="adm-form-group">
              <label className="adm-label">Mensaje</label>
              <textarea className="adm-input" rows={4} value={intervenirMsg} onChange={e => setIntervenirMsg(e.target.value)} placeholder="Escribe el mensaje para el cliente..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setIntervenirModal(null)}>Cancelar</button>
              <button className="adm-btn adm-btn-primary" disabled={sendingMsg || !intervenirMsg.trim()} onClick={handleIntervenir}><Send size={14} />{sendingMsg ? 'Enviando...' : 'Enviar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: FORMULARIO PRESTADOR EXTERNO ── */}
      {showExtForm && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setShowExtForm(false)}>
          <div className="adm-modal" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="adm-modal-title"><Globe size={18} color="#6c63ff" style={{ marginRight: 8 }} />{editingExt ? 'Editar' : 'Nuevo'} Prestador Externo</div>

            {/* ── Foto del servicio ── */}
            <div className="adm-form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="adm-label">Foto del servicio (portada)</label>
              <input
                ref={extImagenInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setExtImagen(file);
                  setExtImagenPreview(URL.createObjectURL(file));
                }}
              />
              <div
                onClick={() => extImagenInputRef.current?.click()}
                style={{
                  width: '100%', height: 160, borderRadius: 12,
                  border: '2px dashed var(--v-border)',
                  background: extImagenPreview || extForm.imagen_url
                    ? `url(${extImagenPreview || extForm.imagen_url}) center/cover no-repeat`
                    : 'rgba(108,99,255,0.05)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--v)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--v-border)'}
              >
                {!(extImagenPreview || extForm.imagen_url) ? (
                  <>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--v2)', fontWeight: 600 }}>Click para subir foto</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: '0.2rem' }}>JPG, PNG, WebP — recomendado 800×500px</div>
                  </>
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>🔄 Cambiar foto</span>
                  </div>
                )}
              </div>
              {(extImagenPreview || extForm.imagen_url) && (
                <button
                  className="adm-btn adm-btn-danger"
                  style={{ marginTop: '0.5rem', fontSize: '0.72rem' }}
                  onClick={() => { setExtImagen(null); setExtImagenPreview(null); setExtForm(p => ({ ...p, imagen_url: '' })); }}
                >
                  <X size={12} /> Quitar foto
                </button>
              )}
            </div>

            {/* ── Galería de fotos de trabajos ── */}
            <div className="adm-form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="adm-label">Galería de trabajos ({extForm.fotos_urls?.length || 0} subidas, {extGaleriaFiles.length} pendientes)</label>
              <input
                ref={extGaleriaInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const files = Array.from(e.target.files);
                  setExtGaleriaFiles(prev => [...prev, ...files]);
                }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                {(extForm.fotos_urls || []).map((url, idx) => (
                  <div key={'f-'+idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, background: `url(${url}) center/cover` }}>
                    <button type="button" onClick={() => setExtForm(p => ({ ...p, fotos_urls: p.fotos_urls.filter((_, i) => i !== idx) }))} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>X</button>
                  </div>
                ))}
                {extGaleriaFiles.map((file, idx) => (
                  <div key={'p-'+idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, background: `url(${URL.createObjectURL(file)}) center/cover` }}>
                    <button type="button" onClick={() => setExtGaleriaFiles(p => p.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>X</button>
                    <span style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.6rem', padding: '1px 3px', borderRadius: 4 }}>New</span>
                  </div>
                ))}
                <div onClick={() => extGaleriaInputRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 8, border: '2px dashed var(--v-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text3)' }}>
                  <Plus size={20} />
                  <span style={{ fontSize: '0.65rem', marginTop: 2 }}>Añadir</span>
                </div>
              </div>
            </div>

            <div className="adm-form-grid">
              {[
                { key: 'nombre', label: 'Nombre *', placeholder: 'Juan' },
                { key: 'apellido', label: 'Apellido', placeholder: 'Pérez' },
              ].map(f => (
                <div key={f.key} className="adm-form-group">
                  <label className="adm-label">{f.label}</label>
                  <input className="adm-input" value={extForm[f.key]} onChange={e => setExtForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                </div>
              ))}
              <div className="adm-form-group">
                <label className="adm-label">Rubro *</label>
                <select className="adm-input adm-select" value={extForm.rubro} onChange={e => setExtForm(p => ({ ...p, rubro: e.target.value }))}>
                  {RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {[
                { key: 'precio_hora', label: 'Precio/hora ($)', placeholder: '5000', type: 'number' },
                { key: 'anos_experiencia', label: 'Años experiencia', placeholder: '3', type: 'number' },
                { key: 'telefono', label: 'Teléfono WhatsApp', placeholder: '5493435...' },
                { key: 'email', label: 'Email', placeholder: 'juan@email.com', type: 'email' },
                { key: 'zona', label: 'Zona / Barrio', placeholder: 'Concordia, Entre Ríos' },
              ].map(f => (
                <div key={f.key} className="adm-form-group">
                  <label className="adm-label">{f.label}</label>
                  <input className="adm-input" type={f.type || 'text'} value={extForm[f.key]} onChange={e => setExtForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div className="adm-form-group" style={{ marginTop: '1rem' }}>
              <label className="adm-label">Descripción del servicio</label>
              <textarea className="adm-input" rows={3} value={extForm.descripcion} onChange={e => setExtForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción breve del servicio que ofrece..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => { setShowExtForm(false); setExtImagen(null); setExtImagenPreview(null); }}>Cancelar</button>
              <button className="adm-btn adm-btn-primary" onClick={handleSaveExt}><CheckCircle size={14} />Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MARCAR CONTACTADO ── */}
      {notaModal && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setNotaModal(null)}>
          <div className="adm-modal">
            <div className="adm-modal-title"><CheckCircle size={18} color="#43e97b" style={{ marginRight: 8 }} />Marcar como Contactado</div>
            <div className="adm-form-group">
              <label className="adm-label">Nota de gestión (opcional)</label>
              <textarea className="adm-input" rows={4} value={notaTexto} onChange={e => setNotaTexto(e.target.value)} placeholder="Ej: Llamé al prestador, confirmó disponibilidad para el martes..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setNotaModal(null)}>Cancelar</button>
              <button className="adm-btn adm-btn-primary" onClick={handleMarcarContactado}><CheckCircle size={14} />Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

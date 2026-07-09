import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './Dashboard.css';

const MetricCard = ({ label, value, trend, positive }) => (
  <div className="metric-card glass-panel">
    <div className="metric-header">
      <span className="metric-label">{label}</span>
      <span className={`metric-trend ${positive ? 'positive' : 'neutral'}`}>{trend}</span>
    </div>
    <div className="metric-value">{value}</div>
    <svg className="sparkline" viewBox="0 0 100 30">
      <polyline points="0,25 20,20 40,28 60,15 80,18 100,5" fill="none" stroke="#00D2FF" strokeWidth="2" />
    </svg>
  </div>
);

const ChatRow = ({ chat, onToggleBot }) => {
  const stateStyles = {
    'Curioso': 'grey-bg',
    'Interesado': 'blue-bg',
    'Comprador': 'purple-bg',
    'Humano': 'red-bg'
  };
  const badgeStyle = stateStyles[chat.estado] || 'grey-bg';
  
  const date = new Date(chat.fecha_actualizacion);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const initials = (chat.nombre || chat.telefono).substring(0, 2).toUpperCase();

  return (
    <div className="chat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <div className="avatar" style={{ backgroundColor: '#3A3A4C' }}>
          {initials}
        </div>
        <div className="chat-content">
          <div className="chat-header" style={{ marginBottom: '0.2rem' }}>
            <div className="name-badge-group">
              <span className="chat-name">{chat.nombre || chat.telefono}</span>
              <span className={`badge ${badgeStyle}`}>{chat.estado}</span>
            </div>
            <span className="chat-time">{timeString}</span>
          </div>
          <div className="chat-message">{chat.ultimo_mensaje || '(Sin mensajes recientes)'}</div>
        </div>
      </div>
      
      <div className="chat-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>Bot Chat</span>
          <button 
            onClick={() => onToggleBot(chat.id, !chat.bot_activo)}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              backgroundColor: chat.bot_activo ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: chat.bot_activo ? '#4ade80' : '#f87171',
              border: `1px solid ${chat.bot_activo ? '#4ade80' : '#f87171'}`
            }}
          >
            {chat.bot_activo ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard({ session }) {
  const [metrics, setMetrics] = useState({
    id: null,
    total_conversaciones: 0,
    total_interesados: 0,
    total_compradores: 0,
    total_ventas: 0,
    bot_global_activo: true
  });
  
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // 1. Cargar o crear métricas del usuario
      const { data: metricData, error: metricError } = await supabase
        .from('metricas')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (metricError) console.error(metricError);
        
      if (metricData) {
        setMetrics(metricData);
      } else {
        // Si no existen métricas para este nuevo usuario, creamos su fila
        const { data: newMetric, error: insertError } = await supabase
          .from('metricas')
          .insert([{ user_id: session.user.id }])
          .select()
          .single();
          
        if (!insertError && newMetric) setMetrics(newMetric);
      }

      // 2. Cargar Conversaciones del usuario
      const { data: chatsData, error: chatsError } = await supabase
        .from('conversaciones')
        .select('*')
        .order('fecha_actualizacion', { ascending: false })
        .limit(10);
        
      if (!chatsError && chatsData) {
        setConversaciones(chatsData);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGlobalBot = async () => {
    if (!metrics.id) return;
    const newState = !metrics.bot_global_activo;
    
    // Actualizar UI rápido (Optimistic UI)
    setMetrics({ ...metrics, bot_global_activo: newState });
    
    // Actualizar BD
    await supabase
      .from('metricas')
      .update({ bot_global_activo: newState })
      .eq('id', metrics.id);
  };

  const toggleChatBot = async (chatId, newState) => {
    // Actualizar UI rápido
    setConversaciones(conversaciones.map(c => 
      c.id === chatId ? { ...c, bot_activo: newState } : c
    ));
    
    // Actualizar BD
    await supabase
      .from('conversaciones')
      .update({ bot_activo: newState })
      .eq('id', chatId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="dashboard-container">
      {/* Header Onix */}
      <header className="header flex-row justify-between items-center" style={{ borderBottom: '1px solid #27272a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="logo-text" style={{ background: 'linear-gradient(90deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
            ONIX
          </div>
          <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>| Panel de Control</span>
        </div>
        
        <div className="icon-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Botón Global de Pausa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#18181b', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #27272a' }}>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Bot Global:</span>
            <button 
              onClick={toggleGlobalBot}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                backgroundColor: metrics.bot_global_activo ? '#4ade80' : '#ef4444',
                color: 'black',
                transition: 'all 0.2s'
              }}
            >
              {metrics.bot_global_activo ? 'ON' : 'APAGADO'}
            </button>
          </div>
          
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.9rem' }}>Salir</button>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="section metrics-section">
        <h2 className="section-title">Resumen de tu Diamond Bot</h2>
        <div className="metrics-grid">
          <MetricCard label="Conversaciones" value={metrics.total_conversaciones} trend="+0%" positive />
          <MetricCard label="Interesados" value={metrics.total_interesados} trend="+0%" positive />
          <MetricCard label="Compradores" value={metrics.total_compradores} trend="+0%" positive />
          <MetricCard label="Ventas cerradas" value={metrics.total_ventas} trend="+0%" positive />
        </div>
      </section>

      {/* Recent Conversations */}
      <section className="section conversations-section">
        <div className="flex-row justify-between items-center margin-b-16">
          <h2 className="section-title margin-0">Chats en vivo</h2>
          <button onClick={fetchData} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer' }}>↻ Recargar</button>
        </div>
        
        <div className="chat-list" style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '1rem' }}>
          {loading ? (
            <div className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>Sincronizando con Diamond Bot...</div>
          ) : conversaciones.length === 0 ? (
            <div className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>No hay chats de este usuario aún.</div>
          ) : (
            conversaciones.map(chat => (
              <ChatRow 
                key={chat.id} 
                chat={chat} 
                onToggleBot={toggleChatBot} 
              />
            ))
          )}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="bottom-nav" style={{ borderTop: '1px solid #27272a' }}>
        <div className="nav-item active">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Diamond</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">🤖</span>
          <span className="nav-label">Bots</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">👥</span>
          <span className="nav-label">Clientes</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Ajustes</span>
        </div>
      </nav>
    </div>
  );
}

import { useState } from 'react';
import { supabase } from '../supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage('¡Te hemos enviado un correo con el enlace para recuperar tu contraseña!');
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Correo o contraseña incorrectos.");
          }
          throw error;
        }
        setMessage('¡Sesión iniciada con éxito!');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            throw new Error("Ya existe una cuenta con este correo. Por favor, inicia sesión.");
          }
          if (error.message.includes("Password should be at least 6 characters")) {
            throw new Error("La contraseña debe tener al menos 6 caracteres.");
          }
          throw error;
        }
        
        // Supabase behavior check:
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("Ya existe una cuenta con este correo. Por favor, inicia sesión.");
        }
        
        setMessage('¡Registro exitoso! (Si no entras automáticamente, revisa tu correo para confirmar la cuenta).');
      }
    } catch (error) {
      setMessage(error.message || error.error_description);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Sección Izquierda - Diseño Onix */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(138,43,226,0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(65,105,225,0.1) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />

        <div style={{ zIndex: 1 }}>
          <h1 style={{ fontSize: '4rem', margin: '0 0 1rem 0', fontWeight: '800', background: 'linear-gradient(90deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Onix</h1>
          <h2 style={{ fontSize: '2rem', margin: '0 0 2rem 0', fontWeight: '300', color: '#a1a1aa' }}>Agentes Autónomos<br/>para tu Empresa.</h2>
          <p style={{ color: '#71717a', fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.6' }}>
            Escala tu negocio con inteligencia artificial. Gestiona tus clientes, automatiza tus ventas y analiza tus métricas en un solo lugar.
          </p>
        </div>
      </div>

      {/* Sección Derecha - Formulario */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111111'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2.5rem',
          backgroundColor: '#18181b',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #27272a'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
              {isForgotPassword ? 'Recuperar contraseña' : (isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta en Onix')}
            </h3>
            <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.9rem' }}>
              {isForgotPassword ? 'Ingresa tu correo y te enviaremos un enlace.' : (isLogin ? 'Ingresa tus credenciales para acceder a tu panel.' : 'Únete al futuro de la automatización.')}
            </p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
                placeholder="tu@empresa.com"
              />
            </div>
            
            {!isForgotPassword && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      paddingRight: '2.5rem',
                      backgroundColor: '#09090b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: 'white',
                      outline: 'none',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#a1a1aa',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem'
                    }}
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#a5b4fc',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {message && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: message.includes('éxito') || message.includes('enviado') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.includes('éxito') || message.includes('enviado') ? '#4ade80' : '#f87171',
                borderRadius: '8px',
                fontSize: '0.85rem',
                textAlign: 'center',
                border: `1px solid ${message.includes('éxito') || message.includes('enviado') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Cargando...' : (isForgotPassword ? 'Enviar enlace' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'))}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setIsLogin(true); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
              >
                Volver a Iniciar Sesión
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

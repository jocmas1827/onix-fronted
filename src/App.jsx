import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import './App.css'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escuchar cambios de autenticación (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', color: 'white' }}>Cargando Onix...</div>
  }

  return (
    <Router>
      <Routes>
        {/* Ruta principal: Si hay sesión, va al dashboard, si no, a login */}
        <Route 
          path="/" 
          element={session ? <Navigate to="/dashboard" replace /> : <Auth />} 
        />
        
        {/* Ruta protegida: El Dashboard */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard session={session} /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  )
}

export default App

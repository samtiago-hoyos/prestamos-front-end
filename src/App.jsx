// App.jsx — Layout principal + navegación
import { useState, useCallback } from 'react'
import FormularioPage from './pages/FormularioPage'
import ListaPage from './pages/ListaPage'
import Toast from './components/Toast'

const NAV = [
  {
    key: 'lista',
    label: 'Préstamos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'nuevo',
    label: 'Nuevo préstamo',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7"/>
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function App() {
  const [pagina, setPagina]   = useState('lista')
  const [toast, setToast]     = useState(null)
  const [sideOpen, setSide]   = useState(false)

  const mostrarToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  const handleSuccess = useCallback((msg, type) => {
    mostrarToast(msg, type)
    if (type !== 'error') setPagina('lista')
  }, [mostrarToast])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F2F5', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Overlay mobile */}
      {sideOpen && (
        <div
          onClick={() => setSide(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'none' }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#1B2B4B', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#3D7FFF', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H11v-2h2v2zm0-4H11V7h2v5z" fill="#fff"/>
              </svg>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0, letterSpacing: '-0.01em' }}>PréstamoApp</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>Panel de gestión</p>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 16px' }} />

        {/* Nav links */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '0 8px', marginBottom: 6,
          }}>Menú</p>
          {NAV.map(item => {
            const active = pagina === item.key
            return (
              <button
                key={item.key}
                onClick={() => setPagina(item.key)}
                style={{
                  width: '100%', padding: '10px 12px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  background: active ? 'rgba(61,127,255,0.2)' : 'transparent',
                  color: active ? '#93C5FD' : 'rgba(255,255,255,0.55)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14, textAlign: 'left',
                  marginBottom: 2, transition: 'all .15s',
                  borderLeft: active ? '3px solid #3D7FFF' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {item.icon}
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: 0 }}>
            API: localhost:3000
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Top bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #E5E7EB',
          padding: '16px 32px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>
              {pagina === 'lista' ? 'Listado de préstamos' : 'Formulario de registro'}
            </p>
          </div>
          {pagina === 'lista' && (
            <button
              onClick={() => setPagina('nuevo')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', background: '#3D7FFF', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 600,
                fontSize: 13, cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              Nuevo préstamo
            </button>
          )}
        </div>

        {/* Page content */}
        <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
          {pagina === 'lista' ? (
            <ListaPage onToast={mostrarToast} />
          ) : (
            <FormularioPage onSuccess={handleSuccess} />
          )}
        </div>
      </main>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input:focus { border-color: #3D7FFF !important; box-shadow: 0 0 0 3px rgba(61,127,255,0.15); }
        @media (max-width: 640px) {
          aside { display: none; }
        }
      `}</style>
    </div>
  )
}

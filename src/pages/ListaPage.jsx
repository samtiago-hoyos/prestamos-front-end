// pages/ListaPage.jsx
import { useState } from 'react'
import { usePrestamos } from '../hooks/usePrestamos'
import { api } from '../services/api'
import { formatCOP, formatFecha } from '../utils/format'
import EstadoBadge from '../components/EstadoBadge'
import DetallePrestamo from '../components/DetallePrestamo'
import ConfirmDialog from '../components/ConfirmDialog'

export default function ListaPage({ onToast }) {
  const { prestamos, loading, error, recargar } = usePrestamos()
  const [detalle, setDetalle]     = useState(null)
  const [confirmar, setConfirmar] = useState(null)
  const [filtro, setFiltro]       = useState('todos')
  const [busqueda, setBusqueda]   = useState('')

  const filtrados = prestamos
    .filter(p => filtro === 'todos' || p.estado === filtro)
    .filter(p => p.prestatario.toLowerCase().includes(busqueda.toLowerCase()))

  const eliminar = async (id) => {
    try {
      await api.eliminar(id)
      onToast('Préstamo eliminado.')
      recargar()
    } catch (e) {
      onToast(e.message, 'error')
    }
    setConfirmar(null)
  }

  const FILTROS = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'pagado', label: 'Pagados' },
    { key: 'vencido', label: 'Vencidos' },
  ]

  return (
    <div>
      {/* Cabecera + controles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Préstamos</h2>
          <p style={{ color: '#6B7280', marginTop: 4, fontSize: 14 }}>
            {loading ? 'Cargando…' : `${filtrados.length} registro${filtrados.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 280 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF',
          }}>
            <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar prestatario…"
            style={{
              width: '100%', padding: '9px 14px 9px 36px',
              border: '1.5px solid #E5E7EB', borderRadius: 8,
              fontSize: 14, outline: 'none', color: '#111827',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Filtros por estado */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 20,
              border: filtro === f.key ? 'none' : '1.5px solid #E5E7EB',
              background: filtro === f.key ? '#1B2B4B' : '#fff',
              color: filtro === f.key ? '#fff' : '#6B7280',
              fontWeight: filtro === f.key ? 600 : 400,
              fontSize: 13, cursor: 'pointer', transition: 'all .15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {error ? (
        <ErrorState mensaje={error} onRetry={recargar} />
      ) : loading ? (
        <LoadingState />
      ) : filtrados.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid #E5E7EB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['#', 'Prestatario', 'Monto', 'Total a devolver', 'Meses', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, color: '#6B7280',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: i < filtrados.length - 1 ? '1px solid #F3F4F6' : 'none',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>
                    {p.id}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#111827' }}>{p.prestatario}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{formatFecha(p.created_at)}</p>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {formatCOP(p.monto)}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: '#1B2B4B', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {formatCOP(p.total_devolver)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>
                    {p.meses}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <EstadoBadge estado={p.estado} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <IconBtn title="Ver detalle" onClick={() => setDetalle(p)} color="#3D7FFF">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          <path d="M20.188 10.934C21.33 11.524 21.33 12.476 20.188 13.066C18.02 14.182 15.258 15 12 15c-3.258 0-6.02-.818-8.188-1.934C2.67 12.476 2.67 11.524 3.812 10.934 5.98 9.818 8.742 9 12 9c3.258 0 6.02.818 8.188 1.934z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </IconBtn>
                      <IconBtn title="Eliminar" onClick={() => setConfirmar(p)} color="#EF4444">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <DetallePrestamo
          prestamo={detalle}
          onClose={() => setDetalle(null)}
          onActualizado={recargar}
          onToast={onToast}
        />
      )}
      {confirmar && (
        <ConfirmDialog
          mensaje={`¿Eliminar el préstamo de "${confirmar.prestatario}"? Esta acción no se puede deshacer.`}
          onConfirm={() => eliminar(confirmar.id)}
          onCancel={() => setConfirmar(null)}
        />
      )}
    </div>
  )
}

function IconBtn({ title, onClick, color, children }) {
  return (
    <button
      title={title} onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: 7, border: 'none',
        background: `${color}18`, color, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}30`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}18`}
    >
      {children}
    </button>
  )
}

function LoadingState() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: '#9CA3AF' }}>
      <div style={{
        width: 36, height: 36, border: '3px solid #E5E7EB',
        borderTopColor: '#3D7FFF', borderRadius: '50%',
        animation: 'spin .7s linear infinite', margin: '0 auto 12px',
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize: 14 }}>Cargando préstamos…</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: '#9CA3AF', border: '1.5px dashed #E5E7EB', borderRadius: 14 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>No hay préstamos</p>
      <p style={{ fontSize: 13, marginTop: 4 }}>Registra el primero usando el formulario.</p>
    </div>
  )
}

function ErrorState({ mensaje, onRetry }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', background: '#FEF2F2', borderRadius: 14 }}>
      <p style={{ color: '#DC2626', fontWeight: 600 }}>Error al cargar datos</p>
      <p style={{ color: '#6B7280', fontSize: 14 }}>{mensaje}</p>
      <button onClick={onRetry} style={{
        marginTop: 12, padding: '8px 20px', background: '#DC2626', color: '#fff',
        border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
      }}>Reintentar</button>
    </div>
  )
}

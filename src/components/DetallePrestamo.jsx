// components/DetallePrestamo.jsx
import { useState } from 'react'
import { formatCOP, formatFecha, ESTADO_CONFIG } from '../utils/format'
import EstadoBadge from './EstadoBadge'
import { api } from '../services/api'

const ESTADOS = ['pendiente', 'pagado', 'vencido']

export default function DetallePrestamo({ prestamo, onClose, onActualizado, onToast }) {
  const [estado, setEstado]   = useState(prestamo.estado)
  const [saving, setSaving]   = useState(false)

  const interesTotal = parseFloat(prestamo.total_devolver) - parseFloat(prestamo.monto)
  const porcentajeInteres = ((interesTotal / parseFloat(prestamo.monto)) * 100).toFixed(1)

  const guardarEstado = async () => {
    if (estado === prestamo.estado) return
    setSaving(true)
    try {
      await api.actualizarEstado(prestamo.id, estado)
      onToast('Estado actualizado correctamente.')
      onActualizado()
      onClose()
    } catch (e) {
      onToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const cfg = ESTADO_CONFIG[estado]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 7000, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500,
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          overflow: 'hidden',
          animation: 'fadeIn .2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1B2B4B 0%, #2B4080 100%)',
          padding: '24px 28px', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            color: '#fff', fontSize: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>×</button>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Préstamo #{prestamo.id}
          </p>
          <h2 style={{ color: '#fff', margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>
            {prestamo.prestatario}
          </h2>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <StatCard label="Monto prestado" value={formatCOP(prestamo.monto)} />
            <StatCard
              label="Total a devolver"
              value={formatCOP(prestamo.total_devolver)}
              accent="#93C5FD"
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          {/* Barra de interés — elemento firma */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Costo del crédito</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1B2B4B' }}>
                {formatCOP(interesTotal)} ({porcentajeInteres}%)
              </span>
            </div>
            <div style={{ height: 8, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${Math.min(parseFloat(porcentajeInteres), 100)}%`,
                background: 'linear-gradient(90deg, #3D7FFF, #6366F1)',
                transition: 'width .6s ease',
              }}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                Tasa {(parseFloat(prestamo.tasa_interes) * 100).toFixed(2)}% mensual
              </span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{prestamo.meses} meses</span>
            </div>
          </div>

          {/* Datos adicionales */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 10, marginBottom: 24,
          }}>
            <InfoRow label="Registrado" value={formatFecha(prestamo.created_at)} />
            <InfoRow label="Actualizado" value={formatFecha(prestamo.updated_at)} />
          </div>

          {/* Cambio de estado */}
          <div style={{
            background: '#F9FAFB', borderRadius: 12, padding: '16px 18px',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
              Estado del préstamo
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {ESTADOS.map((s) => {
                const c = ESTADO_CONFIG[s]
                const sel = estado === s
                return (
                  <button
                    key={s}
                    onClick={() => setEstado(s)}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                      border: sel ? `2px solid ${c.dot}` : '2px solid transparent',
                      background: sel ? c.bg : '#fff',
                      color: sel ? c.dot : '#6B7280',
                      fontWeight: sel ? 700 : 500,
                      fontSize: 12, transition: 'all .15s',
                      boxShadow: sel ? `0 0 0 3px ${c.bg}` : 'none',
                    }}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
            <button
              onClick={guardarEstado}
              disabled={saving || estado === prestamo.estado}
              style={{
                width: '100%', padding: '11px 0', border: 'none', borderRadius: 8,
                background: estado === prestamo.estado ? '#E5E7EB' : cfg.dot,
                color: estado === prestamo.estado ? '#9CA3AF' : '#fff',
                fontWeight: 600, fontSize: 14,
                cursor: (saving || estado === prestamo.estado) ? 'not-allowed' : 'pointer',
                transition: 'all .15s',
              }}
            >
              {saving ? 'Guardando…' : estado === prestamo.estado ? 'Sin cambios' : 'Guardar cambio de estado'}
            </button>
          </div>
        </div>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent = 'rgba(255,255,255,0.85)' }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px',
    }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ fontSize: 16, fontWeight: 700, color: accent, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 14, color: '#374151', fontWeight: 500, margin: 0 }}>{value}</p>
    </div>
  )
}

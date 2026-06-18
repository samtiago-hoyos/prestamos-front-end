// components/DetallePrestamo.jsx
import { useState, useEffect } from 'react'
import { formatCOP, formatFecha, ESTADO_CONFIG } from '../utils/format'
import { api } from '../services/api'

const ESTADOS = ['pendiente', 'pagado', 'vencido']

export default function DetallePrestamo({ prestamo, onClose, onActualizado, onToast }) {
  const [estado, setEstado]       = useState(prestamo.estado)
  const [saving, setSaving]       = useState(false)
  const [pagos, setPagos]         = useState([])
  const [loadingPagos, setLoadingPagos] = useState(true)
  const [cuota, setCuota]         = useState('')
  const [registrando, setRegistrando] = useState(false)
  const [tab, setTab]             = useState('detalle') // 'detalle' | 'pagos'

  const saldo = parseFloat(prestamo.saldo_restante ?? prestamo.monto)
  const monto = parseFloat(prestamo.monto)
  const interesTotal = parseFloat(prestamo.total_devolver) - monto
  const porcentajePagado = Math.min(((monto - saldo) / monto) * 100, 100).toFixed(1)

  // Vencimiento
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const fechaVenc = prestamo.fecha_vencimiento ? new Date(prestamo.fecha_vencimiento) : null
  const estaVencido = fechaVenc && fechaVenc < hoy && prestamo.estado === 'pendiente'
  const diasVencido = fechaVenc ? Math.floor((hoy - fechaVenc) / (1000*60*60*24)) : 0
  const diasRestantes = fechaVenc ? Math.floor((fechaVenc - hoy) / (1000*60*60*24)) : null
  const venceProximo = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 7 && prestamo.estado === 'pendiente'

  // Cargar historial de pagos
  useEffect(() => {
    api.listarPagos(prestamo.id)
      .then(res => setPagos(res.data ?? []))
      .catch(() => setPagos([]))
      .finally(() => setLoadingPagos(false))
  }, [prestamo.id])

  const guardarEstado = async () => {
    if (estado === prestamo.estado) return
    setSaving(true)
    try {
      await api.actualizarEstado(prestamo.id, estado)
      onToast('Estado actualizado correctamente.')
      onActualizado(); onClose()
    } catch (e) { onToast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const hacerPago = async () => {
    if (!cuota || Number(cuota) <= 0) {
      onToast('Ingresa un monto válido.', 'error'); return
    }
    if (Number(cuota) > saldo) {
      onToast('La cuota supera el saldo restante.', 'error'); return
    }
    setRegistrando(true)
    try {
      const res = await api.registrarPago(prestamo.id, Number(cuota))
      onToast(`Pago registrado. Saldo restante: ${formatCOP(res.data.saldo_restante)}`)
      setCuota('')
      // Recargar pagos
      const pagosRes = await api.listarPagos(prestamo.id)
      setPagos(pagosRes.data ?? [])
      onActualizado()
      if (res.data.estado === 'pagado') onClose()
    } catch (e) { onToast(e.message, 'error') }
    finally { setRegistrando(false) }
  }

  const cfg = ESTADO_CONFIG[estado]

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 7000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520,
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)', overflow: 'hidden',
        animation: 'fadeIn .2s ease', maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Advertencia vencido */}
        {estaVencido && (
          <div style={{ background: '#FEE2E2', borderBottom: '1px solid #FECACA', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#DC2626', fontSize: 14 }}>
                Préstamo vencido hace {diasVencido} día{diasVencido !== 1 ? 's' : ''}
              </p>
              <p style={{ margin: 0, color: '#EF4444', fontSize: 12 }}>
                Venció el {formatFecha(prestamo.fecha_vencimiento)} y aún está pendiente.
              </p>
            </div>
          </div>
        )}

        {/* Advertencia próximo a vencer */}
        {venceProximo && (
          <div style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🕐</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#B45309', fontSize: 14 }}>
                Vence en {diasRestantes} día{diasRestantes !== 1 ? 's' : ''}
              </p>
              <p style={{ margin: 0, color: '#D97706', fontSize: 12 }}>
                Fecha límite: {formatFecha(prestamo.fecha_vencimiento)}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1B2B4B 0%, #2B4080 100%)', padding: '24px 28px', position: 'relative' }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Préstamo #{prestamo.id}
          </p>
          <h2 style={{ color: '#fff', margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>
            {prestamo.prestatario}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <StatCard label="Monto" value={formatCOP(monto)} />
            <StatCard label="Total a devolver" value={formatCOP(prestamo.total_devolver)} accent="#93C5FD" />
            <StatCard label="Saldo restante" value={formatCOP(saldo)} accent={saldo === 0 ? '#86EFAC' : '#FCD34D'} />
          </div>

          {/* Barra de progreso de pago */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Progreso de pago</span>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{porcentajePagado}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${porcentajePagado}%`,
                background: 'linear-gradient(90deg, #22C55E, #86EFAC)',
                transition: 'width .6s ease',
              }}/>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
          {[['detalle', '📋 Detalle'], ['pagos', '💰 Cuotas']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
              background: 'none', fontWeight: tab === key ? 700 : 400,
              color: tab === key ? '#1B2B4B' : '#9CA3AF', fontSize: 14,
              borderBottom: tab === key ? '2px solid #3D7FFF' : '2px solid transparent',
              transition: 'all .15s',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ padding: '20px 24px' }}>

          {/* ── Tab Detalle ── */}
          {tab === 'detalle' && (
            <>
              {/* Info interés */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>Costo del crédito</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1B2B4B' }}>{formatCOP(interesTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>Tasa {(parseFloat(prestamo.tasa_interes)*100).toFixed(2)}% mensual</span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{prestamo.meses} meses</span>
                </div>
              </div>

              {/* Fechas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <InfoRow label="Fecha préstamo" value={prestamo.fecha_prestamo ? formatFecha(prestamo.fecha_prestamo) : '—'} />
                <InfoRow label="Fecha vencimiento" value={prestamo.fecha_vencimiento ? formatFecha(prestamo.fecha_vencimiento) : '—'} color={estaVencido ? '#DC2626' : venceProximo ? '#D97706' : undefined} />
              </div>

              {/* Cambio de estado */}
              <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Estado del préstamo</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {ESTADOS.map(s => {
                    const c = ESTADO_CONFIG[s]; const sel = estado === s
                    return (
                      <button key={s} onClick={() => setEstado(s)} style={{
                        flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                        border: sel ? `2px solid ${c.dot}` : '2px solid transparent',
                        background: sel ? c.bg : '#fff', color: sel ? c.dot : '#6B7280',
                        fontWeight: sel ? 700 : 500, fontSize: 12, transition: 'all .15s',
                      }}>{c.label}</button>
                    )
                  })}
                </div>
                <button onClick={guardarEstado} disabled={saving || estado === prestamo.estado} style={{
                  width: '100%', padding: '11px 0', border: 'none', borderRadius: 8,
                  background: estado === prestamo.estado ? '#E5E7EB' : cfg.dot,
                  color: estado === prestamo.estado ? '#9CA3AF' : '#fff',
                  fontWeight: 600, fontSize: 14,
                  cursor: (saving || estado === prestamo.estado) ? 'not-allowed' : 'pointer',
                }}>
                  {saving ? 'Guardando…' : estado === prestamo.estado ? 'Sin cambios' : 'Guardar cambio de estado'}
                </button>
              </div>
            </>
          )}

          {/* ── Tab Cuotas ── */}
          {tab === 'pagos' && (
            <>
              {/* Registrar cuota */}
              {prestamo.estado !== 'pagado' && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#15803D', marginBottom: 4 }}>💰 Registrar cuota</p>
                  <p style={{ fontSize: 12, color: '#16A34A', marginBottom: 12 }}>
                    Saldo restante: <strong>{formatCOP(saldo)}</strong> — Se cobrará el {(parseFloat(prestamo.tasa_interes)*100).toFixed(2)}% de interés sobre la cuota.
                  </p>
                  {/* Preview interés */}
                  {Number(cuota) > 0 && (
                    <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', marginBottom: 12, border: '1px solid #BBF7D0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>Capital cuota:</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{formatCOP(Number(cuota))}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>Interés ({(parseFloat(prestamo.tasa_interes)*100).toFixed(2)}%):</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#D97706' }}>
                          + {formatCOP(Number(cuota) * parseFloat(prestamo.tasa_interes))}
                        </span>
                      </div>
                      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Total a cobrar:</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                          {formatCOP(Number(cuota) + Number(cuota) * parseFloat(prestamo.tasa_interes))}
                        </span>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="number" placeholder="Monto de la cuota"
                      value={cuota} onChange={e => setCuota(e.target.value)}
                      min="1" max={saldo}
                      style={{
                        flex: 1, padding: '10px 14px', border: '1.5px solid #BBF7D0',
                        borderRadius: 8, fontSize: 14, outline: 'none',
                      }}
                    />
                    <button onClick={hacerPago} disabled={registrando} style={{
                      padding: '10px 18px', background: registrando ? '#86EFAC' : '#22C55E',
                      color: '#fff', border: 'none', borderRadius: 8,
                      fontWeight: 700, fontSize: 14, cursor: registrando ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                      {registrando ? '...' : 'Registrar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Historial */}
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
                📋 Historial de pagos {pagos.length > 0 && `(${pagos.length})`}
              </p>
              {loadingPagos ? (
                <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
              ) : pagos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', border: '1.5px dashed #E5E7EB', borderRadius: 10 }}>
                  <p style={{ fontSize: 14 }}>No hay pagos registrados aún.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pagos.map((p, i) => (
                    <div key={p.id} style={{
                      background: '#F9FAFB', borderRadius: 10, padding: '12px 14px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
                          Cuota #{i+1} — {formatFecha(p.fecha_pago)}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6B7280' }}>
                          Capital: {formatCOP(p.monto_cuota)} + Interés: {formatCOP(p.interes_cuota)}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#15803D' }}>
                          {formatCOP(p.total_cobrado)}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>cobrado</p>
                      </div>
                    </div>
                  ))}
                  {/* Total cobrado */}
                  <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Total cobrado:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                      {formatCOP(pagos.reduce((s, p) => s + parseFloat(p.total_cobrado), 0))}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent = 'rgba(255,255,255,0.85)' }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px' }}>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: accent, margin: 0, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
    </div>
  )
}

function InfoRow({ label, value, color }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 14, color: color || '#374151', fontWeight: color ? 700 : 500, margin: 0 }}>{value}</p>
    </div>
  )
}
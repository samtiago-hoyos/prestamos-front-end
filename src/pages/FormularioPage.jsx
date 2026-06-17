// pages/FormularioPage.jsx
import { useState } from 'react'
import { api } from '../services/api'
import { calcularTotal, formatCOP } from '../utils/format'

const hoy = new Date().toISOString().split('T')[0]
const INIT = { prestatario: '', monto: '', tasa_interes: '', meses: '', fecha_prestamo: hoy }

const FIELD_STYLE = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB',
  borderRadius: 8, fontSize: 15, outline: 'none', color: '#111827',
  background: '#FAFAFA', transition: 'border-color .15s',
  boxSizing: 'border-box',
}

export default function FormularioPage({ onSuccess }) {
  const [form, setForm]       = useState(INIT)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  const monto = parseFloat(form.monto) || 0
  const tasa  = parseFloat(form.tasa_interes) || 0
  const meses = parseInt(form.meses) || 0
  const total = (monto > 0 && tasa >= 0 && meses > 0) ? calcularTotal(monto, tasa, meses) : null
  const interes = total ? total - monto : 0

  // Calcular fecha de vencimiento para mostrar preview
  const fechaVencimiento = form.fecha_prestamo && meses > 0
    ? (() => {
        const f = new Date(form.fecha_prestamo)
        f.setMonth(f.getMonth() + meses)
        return f.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
      })()
    : null

  const cambiar = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!form.prestatario.trim()) e.prestatario = 'El nombre es obligatorio.'
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresa un monto válido.'
    if (form.tasa_interes === '' || Number(form.tasa_interes) < 0) e.tasa_interes = 'Ingresa una tasa >= 0.'
    if (!form.meses || !Number.isInteger(Number(form.meses)) || Number(form.meses) <= 0) e.meses = 'Ingresa un número de meses válido.'
    if (!form.fecha_prestamo) e.fecha_prestamo = 'La fecha de inicio es obligatoria.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setLoading(true)
    try {
      await api.crear({
        prestatario:   form.prestatario.trim(),
        monto:         Number(form.monto),
        tasa_interes:  Number(form.tasa_interes),
        meses:         Number(form.meses),
        fecha_prestamo: form.fecha_prestamo,
      })
      setForm(INIT)
      onSuccess('Préstamo registrado correctamente.')
    } catch (err) {
      onSuccess(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
          Registrar préstamo
        </h2>
        <p style={{ color: '#6B7280', marginTop: 4, fontSize: 14 }}>
          El total a devolver se calcula automáticamente con interés simple.
        </p>
      </div>

      {/* Preview total */}
      {total !== null && (
        <div style={{
          background: 'linear-gradient(135deg, #1B2B4B 0%, #2B4080 100%)',
          borderRadius: 16, padding: '20px 24px', marginBottom: 24,
          color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 12, opacity: 0.65, margin: 0, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Total a devolver
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {formatCOP(total)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, opacity: 0.65, margin: 0, marginBottom: 4 }}>Interés generado</p>
              <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#93C5FD', fontVariantNumeric: 'tabular-nums' }}>
                + {formatCOP(interes)}
              </p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, opacity: 0.6 }}>
              Capital: <strong style={{ opacity: 1 }}>{formatCOP(monto)}</strong>
            </span>
            <span style={{ fontSize: 12, opacity: 0.6 }}>
              Tasa: <strong style={{ opacity: 1 }}>{(tasa * 100).toFixed(2)}% × {meses} mes{meses !== 1 ? 'es' : ''}</strong>
            </span>
            {fechaVencimiento && (
              <span style={{ fontSize: 12, opacity: 0.6 }}>
                Vence: <strong style={{ opacity: 1, color: '#FCD34D' }}>{fechaVencimiento}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={enviar} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Nombre */}
          <Field label="Nombre del prestatario" error={errors.prestatario}>
            <input
              style={FIELD_STYLE} name="prestatario" type="text"
              placeholder="Ej: Carlos Ramírez"
              value={form.prestatario} onChange={cambiar}
            />
          </Field>

          {/* Monto */}
          <Field label="Monto prestado (COP)" error={errors.monto}>
            <input
              style={FIELD_STYLE} name="monto" type="number"
              placeholder="Ej: 5000000" min="0"
              value={form.monto} onChange={cambiar}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Tasa */}
            <Field label="Tasa mensual" hint="Ej: 0.05 = 5%" error={errors.tasa_interes}>
              <input
                style={FIELD_STYLE} name="tasa_interes" type="number"
                placeholder="0.05" step="0.001" min="0"
                value={form.tasa_interes} onChange={cambiar}
              />
            </Field>
            {/* Meses */}
            <Field label="Número de meses" error={errors.meses}>
              <input
                style={FIELD_STYLE} name="meses" type="number"
                placeholder="12" min="1" step="1"
                value={form.meses} onChange={cambiar}
              />
            </Field>
          </div>

          {/* Fecha de inicio */}
          <Field label="Fecha de inicio del préstamo" error={errors.fecha_prestamo}>
            <input
              style={FIELD_STYLE} name="fecha_prestamo" type="date"
              value={form.fecha_prestamo} onChange={cambiar}
            />
          </Field>

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 6, padding: '13px 0',
              background: loading ? '#93C5FD' : '#3D7FFF',
              color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .15s', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? <>
              <Spinner /> Guardando…
            </> : 'Registrar préstamo'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
      {error && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  )
}
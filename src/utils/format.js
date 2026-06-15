// utils/format.js

/** Formatea pesos colombianos */
export const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

/** Formatea fecha a texto legible */
export const formatFecha = (iso) =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(iso))

/** Calcula total con interés simple (espejo del back-end) */
export const calcularTotal = (monto, tasa, meses) =>
  parseFloat((Number(monto) + Number(monto) * Number(tasa) * Number(meses)).toFixed(2))

/** Config visual por estado */
export const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', color: '#F59E0B', bg: '#FEF3C7', dot: '#D97706' },
  pagado:    { label: 'Pagado',    color: '#22C55E', bg: '#DCFCE7', dot: '#16A34A' },
  vencido:   { label: 'Vencido',   color: '#EF4444', bg: '#FEE2E2', dot: '#DC2626' },
}

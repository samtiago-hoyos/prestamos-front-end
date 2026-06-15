// components/EstadoBadge.jsx
import { ESTADO_CONFIG } from '../utils/format'

export default function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: cfg.bg, color: cfg.dot,
      borderRadius: 20, padding: '3px 10px',
      fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.dot, display: 'inline-block', flexShrink: 0,
      }}/>
      {cfg.label}
    </span>
  )
}

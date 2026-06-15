// components/ConfirmDialog.jsx

export default function ConfirmDialog({ mensaje, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 8000, padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '28px 32px',
        maxWidth: 380, width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#FEE2E2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontWeight: 600, fontSize: 16, color: '#111827', marginBottom: 8 }}>
          ¿Estás seguro?
        </p>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          {mensaje}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px 0', border: '1px solid #E5E7EB',
            borderRadius: 8, background: '#fff', color: '#374151',
            fontWeight: 500, cursor: 'pointer', fontSize: 14,
          }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px 0', border: 'none',
            borderRadius: 8, background: '#EF4444', color: '#fff',
            fontWeight: 600, cursor: 'pointer', fontSize: 14,
          }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

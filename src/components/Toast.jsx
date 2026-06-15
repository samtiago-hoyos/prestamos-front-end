// components/Toast.jsx
import { useEffect } from 'react'

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#22C55E"/>
      <path d="M6 10.5l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#EF4444"/>
      <path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
}

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#fff', border: '1px solid #E5E7EB',
      borderRadius: 12, padding: '12px 18px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      animation: 'slideUp 0.3s ease',
      maxWidth: 340, fontSize: 14, color: '#111827', fontWeight: 500,
    }}>
      {ICONS[type]}
      <span>{message}</span>
      <button onClick={onClose} style={{
        marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer',
        color: '#9CA3AF', fontSize: 16, lineHeight: 1, padding: 0,
      }}>×</button>
      <style>{`@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  )
}

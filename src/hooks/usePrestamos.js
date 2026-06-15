// hooks/usePrestamos.js
import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export const usePrestamos = () => {
  const [prestamos, setPrestamos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.listar()
      setPrestamos(res.data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return { prestamos, loading, error, recargar: cargar }
}

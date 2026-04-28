'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      fontFamily: 'Inter, sans-serif',
      background: '#f0f4ff',
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#fee2e2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>⚕️</div>
      <h2 style={{ fontWeight: 800, fontSize: 22, color: '#0f172a', margin: 0 }}>
        Une erreur est survenue
      </h2>
      <p style={{ color: '#64748b', maxWidth: 400, margin: 0 }}>
        La page n'a pas pu se charger correctement. Veuillez réessayer.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#1641C8', color: 'white',
          border: 'none', borderRadius: 10,
          padding: '12px 28px', fontWeight: 700,
          fontSize: 15, cursor: 'pointer',
        }}
      >
        Réessayer
      </button>
    </div>
  )
}

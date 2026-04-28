'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        background: '#f0f4ff',
        textAlign: 'center',
        gap: 16,
        padding: 24,
      }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: '#0f172a', margin: 0 }}>
          Clinique de la Rebecca
        </h2>
        <p style={{ color: '#64748b', maxWidth: 400, margin: 0 }}>
          Une erreur critique est survenue. Veuillez actualiser la page.
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
          Actualiser
        </button>
      </body>
    </html>
  )
}

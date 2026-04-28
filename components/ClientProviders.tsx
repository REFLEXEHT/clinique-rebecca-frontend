'use client'
import { AuthProvider } from '@/context/AuthContext'
import { TranslationProvider } from '@/context/TranslationContext'
import dynamic from 'next/dynamic'
import { ReactNode, useState, useEffect } from 'react'

const Toaster = dynamic(
  () => import('react-hot-toast').then(m => m.Toaster),
  { ssr: false }
)

// Ce wrapper garantit que RIEN n'est rendu côté serveur pour les parties
// qui dépendent de localStorage (auth, langue) → élimine React #418
function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  // Côté serveur et premier rendu: div vide avec même structure
  // pour éviter "Only one element on document allowed"
  if (!mounted) return <div style={{ visibility: 'hidden' }} />
  return <>{children}</>
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TranslationProvider>
        <ClientOnly>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                padding: '12px 18px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </ClientOnly>
      </TranslationProvider>
    </AuthProvider>
  )
}

'use client'
import { AuthProvider } from '@/context/AuthContext'
import { TranslationProvider } from '@/context/TranslationContext'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Toaster chargé uniquement côté client — évite le crash SSR de react-hot-toast
const Toaster = dynamic(
  () => import('react-hot-toast').then(m => m.Toaster),
  { ssr: false }
)

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TranslationProvider>
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
      </TranslationProvider>
    </AuthProvider>
  )
}

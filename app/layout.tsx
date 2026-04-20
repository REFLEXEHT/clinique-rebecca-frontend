import type { Metadata } from 'next'
import { Nunito, Playfair_Display } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'Clinique de la Rebecca — Soins de Qualité',
  description:
    'La Clinique de la Rebecca offre des soins spécialisés, consultations en ligne et suivi personnalisé par WhatsApp en Haïti.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${nunito.variable} ${playfair.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f1e3d',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: '600',
            },
          }}
        />
      </body>
    </html>
  )
}

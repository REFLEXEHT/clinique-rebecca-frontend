// Build: 2026-04-28 01:04
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Clinique de la Rebecca — Soins médicaux à Delmas, Haïti',
  description: 'Clinique médicale spécialisée à Delmas. Médecins spécialistes, laboratoire, pharmacie, dentisterie, maternité. Prenez rendez-vous en ligne.',
  keywords: 'clinique, médecin, haïti, delmas, rendez-vous, spécialistes, santé',
  openGraph: {
    title: 'Clinique de la Rebecca',
    description: 'Soins médicaux complets à Delmas, Haïti',
    locale: 'fr_HT',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1641C8" />
      </head>
      <body className="font-sans antialiased bg-white text-slate-900">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}

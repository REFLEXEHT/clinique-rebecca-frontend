import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { LangProvider } from '@/context/LangContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clinique de la Rebecca',
  description: 'Soins spécialisés de qualité — Pétion-Ville, Haïti',
}


function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </LangProvider>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

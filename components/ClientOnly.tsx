'use client'
/**
 * ClientOnly — Prevents SSR entirely for wrapped children.
 * Eliminates React hydration error #418 for client-only apps.
 *
 * Server renders: empty <div> shell (no content = no mismatch possible)
 * Client renders: full children after mount
 */
import { useEffect, useState, ReactNode } from 'react'

export default function ClientOnly({ children, fallback }: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <>{fallback ?? null}</>
  return <>{children}</>
}

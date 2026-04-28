'use client'
import dynamic from 'next/dynamic'

const SpecialitesContent = dynamic(
  () => import('./SpecialitesContent'),
  { ssr: false, loading: () => <div style={{ minHeight: '60vh' }} /> }
)

export default function SpecialitesPage() {
  return <SpecialitesContent />
}

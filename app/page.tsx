import dynamic from 'next/dynamic'

const SpecialitesContent = dynamic(
  () => import('./SpecialitesContent'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #0a1628 0%, #1641C8 55%, #0d9488 100%)',
      }} />
    ),
  }
)

export default function SpecialitesPage() {
  return <SpecialitesContent />
}

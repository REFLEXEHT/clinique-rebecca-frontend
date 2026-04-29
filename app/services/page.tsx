import dynamic from 'next/dynamic'

const ServicesContent = dynamic(
  () => import('./ServicesContent'),
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

export default function ServicesPage() {
  return <ServicesContent />
}

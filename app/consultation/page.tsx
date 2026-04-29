import dynamic from 'next/dynamic'

const ConsultationContent = dynamic(
  () => import('./ConsultationContent'),
  {
    ssr: false,
    loading: () => <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f1e3d 0%,#1641C8 55%,#0d9488 100%)' }} />,
  }
)

export default function ConsultationPage() {
  return <ConsultationContent />
}

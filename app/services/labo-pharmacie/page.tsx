import dynamic from 'next/dynamic'

const LaboPharmacieContent = dynamic(
  () => import('./labo-pharmacie-page'),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f1e3d 0%,#0d9488 100%)' }} />
    ),
  }
)

export default function LaboPharmacieServicePage() {
  return <LaboPharmacieContent />
}

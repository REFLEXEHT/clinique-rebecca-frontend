'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function SpecialitePage() {
 const params = useParams()
 const router = useRouter()
 const slug = (params.slug as string) || ''
 const [specs, setSpecs] = useState<any[]>([])
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 setLoading(true)
 // Map slug to specialite name for the API
 const slugToSpec: Record<string,string> = {
 chirurgie: 'Chirurgie Générale', neurochirurgie: 'Neurochirurgie',
 neurologie: 'Neurologie', orthopedie: 'Orthopédie',
 pediatrie: 'Pédiatrie', dermatologie: 'Dermatologie',
 urologie: 'Urologie', orl: 'ORL', gynecologie: 'Gynécologie',
 'chir-ped': 'Chirurgie Pédiatrique', 'medecine-interne': 'Médecine interne',
 ophtalmologie: 'Ophtalmologie',
 }
 const specialite = slugToSpec[slug] || slug
 api.get(`/specialistes?specialite=${encodeURIComponent(specialite)}`)
 .then(r => setSpecs(r.data || []))
 .catch(() => setSpecs([]))
 .finally(() => setLoading(false))
 }, [slug])

 return (
 <>
 <Navbar />
 <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
 <div style={{ background: 'linear-gradient(135deg,#0f1e3d,#1641C8,#0d9488)', padding: '56px 20px 40px', textAlign: 'center' }}>
 <h1 style={{ color: 'white', fontWeight: 900, fontSize: '2rem', margin: '0 0 12px' }}>
 Nos spécialistes
 </h1>
 <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
 {loading ? 'Chargement...' : `${specs.length} spécialiste${specs.length > 1 ? 's' : ''} disponible${specs.length > 1 ? 's' : ''}`}
 </p>
 </div>
 <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
 {loading ? (
 <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}> Chargement...</div>
 ) : specs.length === 0 ? (
 <div style={{ textAlign: 'center', padding: 48 }}>
 <p style={{ color: '#64748b', marginBottom: 16 }}>Aucun spécialiste trouvé pour cette catégorie.</p>
 <Link href="/specialites" style={{ background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', textDecoration: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700 }}>
 Voir tous les spécialistes →
 </Link>
 </div>
 ) : (
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
 {specs.map((m: any) => (
 <div key={m.id} style={{ background: 'white', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0' }}>
 <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
 <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#1641C8,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
 {m.emoji || '‍'}
 </div>
 <div>
 <div style={{ fontWeight: 700, fontSize: 14 }}>{m.nom}</div>
 <div style={{ color: '#0d9488', fontSize: 12 }}>{m.specialite}</div>
 </div>
 </div>
 <div style={{ display: 'flex', gap: 8 }}>
 <Link href={`/specialistes/${m.id}`} style={{ flex: 1, textAlign: 'center', background: '#f0fdf4', color: '#0d9488', textDecoration: 'none', borderRadius: 8, padding: '7px 10px', fontWeight: 600, fontSize: 12 }}>
 Profil
 </Link>
 <Link href="/consultation" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg,#1641C8,#0d9488)', color: 'white', textDecoration: 'none', borderRadius: 8, padding: '7px 10px', fontWeight: 700, fontSize: 12 }}>
 Prendre RDV
 </Link>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 <Footer />
 </>
 )
}

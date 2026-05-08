'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useLang } from '@/context/LangContext'

const BACK_LABELS: Record<string, string> = {
 fr: 'Retour', ht: 'Retounen', en: 'Back', es: 'Volver', zh: '返回'
}

export default function BackBar() {
 const router = useRouter()
 const pathname = usePathname()
 const { lang } = useLang()

 // Don't show on homepage
 if (pathname === '/') return null

 return (
 <div style={{
 position: 'sticky', top: 0, zIndex: 100,
 background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
 borderBottom: '1px solid #f1f5f9', padding: '0 20px',
 display: 'flex', alignItems: 'center', gap: 12, height: 42,
 }}>
 <button
 onClick={() => router.back()}
 style={{
 display: 'flex', alignItems: 'center', gap: 6,
 background: 'none', border: 'none', cursor: 'pointer',
 color: '#1641C8', fontWeight: 700, fontSize: 13,
 padding: '6px 10px', borderRadius: 8,
 }}
 onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
 onMouseLeave={e => (e.currentTarget.style.background = 'none')}
 >
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
 <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 {BACK_LABELS[lang] || 'Retour'}
 </button>
 </div>
 )
}

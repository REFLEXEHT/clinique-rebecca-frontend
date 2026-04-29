'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RdvModal from '@/components/ui/RdvModal'
import { api } from '@/lib/api'

interface TarifDentiste { code: string; libelle: string; montant: number; devise: string }

const MEDECINS_DENTISTE = [
  { nom:'Dr Wolf Charlie Cajuste', specialite:'Dentisterie', emoji:'🦷', telephone:'3810-7562', prix_consultation: 2500 },
]

export default function DentisterieService() {
  const [rdvOpen, setRdvOpen] = useState(false)
  const [tarifs, setTarifs] = useState<TarifDentiste[]>([])

  useEffect(() => {
    api.get('/dentiste/tarifs').then(r => setTarifs(r.data || [])).catch(() => {})
  }, [])

  return (
    <>
      <Navbar onRdvClick={() => setRdvOpen(true)} />
      <RdvModal open={rdvOpen} onClose={() => setRdvOpen(false)} />
      <div style={{ background:'linear-gradient(135deg,#0f1e3d,#6366f1)', padding:'120px 5% 64px', textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🦷</div>
        <h1 style={{ color:'white', fontWeight:900, fontSize:'clamp(2rem,4vw,3rem)', margin:'0 0 12px' }}>Dentisterie</h1>
        <p style={{ color:'rgba(255,255,255,0.78)', fontSize:'1.05rem', maxWidth:540, margin:'0 auto 28px' }}>
          Soins dentaires complets : consultation, extraction, prophylaxie, orthodontie et prothèses.
        </p>
        <button onClick={() => setRdvOpen(true)} style={{ background:'#6366f1', color:'white', border:'2px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'12px 28px', fontWeight:700, cursor:'pointer' }}>
          Prendre RDV
        </button>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'56px 5%' }}>
        {/* Médecin */}
        <h2 style={{ fontWeight:900, fontSize:'1.4rem', color:'#0f172a', marginBottom:20 }}>Notre dentiste</h2>
        <div style={{ display:'flex', gap:16, marginBottom:48, flexWrap:'wrap' }}>
          {MEDECINS_DENTISTE.map(m => (
            <div key={m.nom} style={{ background:'white', borderRadius:18, padding:24, border:'1px solid #e2e8f0', minWidth:260 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>{m.emoji}</div>
              <div style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>{m.nom}</div>
              <div style={{ color:'#6366f1', fontWeight:600, fontSize:13, marginTop:4 }}>{m.specialite}</div>
              <div style={{ color:'#64748b', fontSize:12, marginTop:6 }}>📞 {m.telephone}</div>
              <div style={{ marginTop:10, background:'#f5f3ff', borderRadius:8, padding:'6px 12px', fontSize:13, fontWeight:600, color:'#6366f1' }}>
                Consultation : {m.prix_consultation.toLocaleString()} HTG
              </div>
            </div>
          ))}
        </div>

        {/* Tarifs */}
        <h2 style={{ fontWeight:900, fontSize:'1.4rem', color:'#0f172a', marginBottom:20 }}>Liste des prix</h2>
        <div style={{ background:'white', borderRadius:18, border:'1px solid #e2e8f0', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                <th style={{ padding:'12px 20px', textAlign:'left', color:'#64748b', fontWeight:600 }}>Service</th>
                <th style={{ padding:'12px 20px', textAlign:'right', color:'#64748b', fontWeight:600 }}>Prix</th>
                <th style={{ padding:'12px 20px', textAlign:'center', color:'#64748b', fontWeight:600 }}>Devise</th>
              </tr>
            </thead>
            <tbody>
              {tarifs.map(t => (
                <tr key={t.code} style={{ borderBottom:'1px solid #f8fafc' }}>
                  <td style={{ padding:'11px 20px', fontWeight:600, color:'#0f172a' }}>{t.libelle}</td>
                  <td style={{ padding:'11px 20px', textAlign:'right', fontWeight:700, color:'#6366f1' }}>
                    {t.montant > 0 ? t.montant.toLocaleString() : 'Sur devis'}
                  </td>
                  <td style={{ padding:'11px 20px', textAlign:'center' }}>
                    <span style={{ background: t.devise==='USD' ? '#fef3c7':'#f5f3ff', color: t.devise==='USD'?'#d97706':'#6366f1', borderRadius:50, padding:'3px 10px', fontSize:11, fontWeight:700 }}>
                      {t.devise}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  )
}

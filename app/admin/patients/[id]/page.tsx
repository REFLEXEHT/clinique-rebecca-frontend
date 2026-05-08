'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function AdminPatientDossier() {
  const { id } = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [dossiers, setDossiers] = useState<any[]>([])
  const [rdvs,    setRdvs]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.get(`/admin/patients/${id}`).catch(() => ({ data: null })),
      api.get(`/admin/patients/${id}/dossiers`).catch(() => ({ data: [] })),
      api.get(`/admin/rendez-vous?patient_id=${id}`).catch(() => ({ data: [] })),
    ]).then(([p, d, r]) => {
      setPatient(p.data)
      setDossiers(Array.isArray(d.data) ? d.data : d.data?.dossiers || [])
      setRdvs(Array.isArray(r.data) ? r.data : r.data?.rdvs || [])
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid #e2e8f0', borderTopColor:'#1641C8', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
        <div style={{ color:'#94a3b8', fontSize:13 }}>Chargement du dossier...</div>
      </div>
    </div>
  )

  if (!patient) return (
    <div style={{ padding:32, textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:12, opacity:0.3 }}>
        <i className="fa-solid fa-user-slash" />
      </div>
      <div style={{ fontWeight:700, color:'#374151', marginBottom:8 }}>Patient introuvable</div>
      <button onClick={() => router.back()} style={{ background:'#1641C8', color:'white', border:'none', borderRadius:8, padding:'8px 18px', cursor:'pointer', fontWeight:600 }}>
        Retour
      </button>
    </div>
  )

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—'

  return (
    <div style={{ padding:'20px', maxWidth:1000, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <button onClick={() => router.back()} style={{ background:'#f1f5f9', border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontWeight:600, fontSize:13, color:'#374151' }}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight:6 }} />Retour
        </button>
        <div>
          <h1 style={{ fontWeight:900, fontSize:'1.3rem', color:'#0f172a', margin:0 }}>
            {patient.prenom} {patient.nom}
          </h1>
          <div style={{ fontFamily:'monospace', color:'#1641C8', fontSize:14, marginTop:2 }}>{patient.numero}</div>
        </div>
      </div>

      {/* Patient info */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ background:'white', borderRadius:12, padding:16, border:'1px solid #e2e8f0' }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#64748b', marginBottom:12, textTransform:'uppercase', letterSpacing:.5 }}>Informations patient</div>
          {[
            ['Numéro dossier', patient.numero],
            ['Age', patient.age ? `${patient.age} ans` : '—'],
            ['Téléphone', patient.telephone || '—'],
            ['Email', patient.email || '—'],
            ['Adresse', patient.adresse || '—'],
            ['Contact urgence', patient.contact_urgence || '—'],
            ['Enregistré le', fmtDate(patient.created_at)],
          ].map(([k, v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f8fafc', fontSize:13 }}>
              <span style={{ color:'#94a3b8' }}>{k}</span>
              <span style={{ fontWeight:600, color:'#0f172a', maxWidth:'60%', textAlign:'right' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* RDV */}
        <div style={{ background:'white', borderRadius:12, padding:16, border:'1px solid #e2e8f0' }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#64748b', marginBottom:12, textTransform:'uppercase', letterSpacing:.5 }}>
            Rendez-vous ({rdvs.length})
          </div>
          {rdvs.length === 0 ? (
            <div style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'20px 0' }}>Aucun rendez-vous</div>
          ) : rdvs.slice(0, 6).map((r: any) => (
            <div key={r.id} style={{ padding:'7px 0', borderBottom:'1px solid #f8fafc', fontSize:12 }}>
              <div style={{ fontWeight:600 }}>{r.specialite || r.service}</div>
              <div style={{ color:'#94a3b8', display:'flex', justifyContent:'space-between' }}>
                <span>{fmtDate(r.date_rdv)}</span>
                <span style={{ background:'#f0fdf4', color:'#16a34a', padding:'1px 8px', borderRadius:99, fontSize:10, fontWeight:700 }}>{r.statut}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dossiers médicaux */}
      <div style={{ background:'white', borderRadius:12, padding:16, border:'1px solid #e2e8f0' }}>
        <div style={{ fontWeight:700, fontSize:13, color:'#64748b', marginBottom:12, textTransform:'uppercase', letterSpacing:.5 }}>
          Dossiers médicaux ({dossiers.length})
        </div>
        {dossiers.length === 0 ? (
          <div style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'30px 0' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize:32, display:'block', marginBottom:8, opacity:0.3 }} />
            Aucun dossier médical enregistré
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Date', 'Service', 'Médecin', 'Statut'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:700, color:'#374151', fontSize:11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dossiers.map((d: any) => (
                <tr key={d.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'9px 12px', color:'#94a3b8' }}>{fmtDate(d.date_visite || d.created_at)}</td>
                  <td style={{ padding:'9px 12px', fontWeight:600 }}>{d.service || d.specialite || '—'}</td>
                  <td style={{ padding:'9px 12px', color:'#64748b' }}>{d.medecin_nom || '—'}</td>
                  <td style={{ padding:'9px 12px' }}>
                    <span style={{ background:'#f0fdf4', color:'#16a34a', padding:'2px 10px', borderRadius:99, fontSize:10, fontWeight:700 }}>
                      {d.statut || 'Complété'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

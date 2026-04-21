'use client'
// app/patient/dashboard/page.tsx — Espace patient
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { rdvApi, laboApi } from '@/lib/api'
import { RendezVous, ResultatLabo } from '@/types'
import RdvModal from '@/components/ui/RdvModal'

export default function PatientDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [rdvs, setRdvs]         = useState<RendezVous[]>([])
  const [resultats, setResultats] = useState<ResultatLabo[]>([])
  const [rdvOpen, setRdvOpen]   = useState(false)
  const [activeTab, setActiveTab] = useState<'rdv'|'resultats'>('rdv')

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'patient')) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'patient') {
      rdvApi.patientList().then(r=>setRdvs(r.data)).catch(()=>{})
    }
  }, [isAuthenticated, user])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>

  const demoRdvs: RendezVous[] = [
    { id:1, patient_nom:user?.nom||'Patient', patient_telephone:'+509 3456-7890', patient_email:null, specialite:'Gynécologie', date_rdv: new Date(Date.now()+7*24*3600*1000).toISOString(), type_rdv:'presentiel', statut:'confirme', motif:'Suivi annuel', notes_admin:null, mode_paiement:'À la clinique', rappel_envoye:false, created_at: new Date().toISOString() },
  ]
  const displayRdvs = rdvs.length > 0 ? rdvs : demoRdvs

  const upcoming = displayRdvs.filter(r=>r.statut==='confirme'&&new Date(r.date_rdv)>new Date())
  const past     = displayRdvs.filter(r=>r.statut==='termine'||new Date(r.date_rdv)<new Date())

  return (
    <div className="min-h-screen bg-slate-50">
      <RdvModal open={rdvOpen} onClose={()=>setRdvOpen(false)} />

      {/* Header */}
      <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4">
        <Link href="/" className="text-white/60 hover:text-white text-sm no-underline transition-colors">
          <i className="fa-solid fa-arrow-left mr-2"/>Accueil
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1641C8]/40 rounded-lg flex items-center justify-center text-white/80 text-sm font-bold">
            {user?.nom?.[0]?.toUpperCase()}
          </div>
          <span className="text-white font-semibold text-sm">{user?.nom}</span>
        </div>
      </div>

      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold">Mon espace patient</h1>
            <p className="text-slate-500 text-[13px] mt-0.5">Gérez vos rendez-vous et consultez vos résultats</p>
          </div>
          <button className="btn-primary" onClick={()=>setRdvOpen(true)}>
            <i className="fa-regular fa-calendar-check"/> Prendre RDV
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="kpi-card">
            <div className="text-2xl font-black text-[#1641C8] mb-1">{upcoming.length}</div>
            <div className="text-xs text-slate-500 font-semibold">RDV à venir</div>
          </div>
          <div className="kpi-card">
            <div className="text-2xl font-black text-green-600 mb-1">{past.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Consultations passées</div>
          </div>
          <div className="kpi-card">
            <div className="text-2xl font-black text-[#d97706] mb-1">{resultats.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Résultats de labo</div>
          </div>
        </div>

        {/* Prochain RDV banner */}
        {upcoming[0] && (
          <div className="bg-gradient-to-r from-[#1641C8] to-[#0f2fa3] rounded-2xl p-5 mb-6 text-white flex items-center justify-between">
            <div>
              <div className="text-white/70 text-xs font-bold uppercase tracking-wide mb-1">Prochain rendez-vous</div>
              <div className="text-xl font-extrabold mb-0.5">
                {new Date(upcoming[0].date_rdv).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
              </div>
              <div className="text-white/80 text-sm">
                {new Date(upcoming[0].date_rdv).toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'})} ·
                {upcoming[0].specialite} ·
                {upcoming[0].type_rdv==='video'?' En ligne 🎥':' En personne 🏥'}
              </div>
            </div>
            <div className="badge bg-green-500/20 text-green-300 text-sm px-3 py-1.5">
              <i className="fa-solid fa-circle text-[8px]"/> Confirmé
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['rdv','resultats'] as const).map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              className={`px-5 py-2 rounded-full font-bold text-sm border cursor-pointer transition-all
              ${activeTab===t?'bg-[#1641C8] text-white border-[#1641C8]':'bg-white text-slate-600 border-slate-200'}`}>
              {t==='rdv'?'📅 Mes rendez-vous':'🔬 Mes résultats de labo'}
            </button>
          ))}
        </div>

        {activeTab==='rdv' && (
          <div className="card overflow-hidden">
            <table className="tbl w-full">
              <thead><tr><th>Date</th><th>Spécialité</th><th>Type</th><th>Motif</th><th>Statut</th></tr></thead>
              <tbody>
                {displayRdvs.map(r=>(
                  <tr key={r.id}>
                    <td>
                      <div className="font-bold text-[13px]">{new Date(r.date_rdv).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})}</div>
                      <div className="text-slate-400 text-xs">{new Date(r.date_rdv).toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'})}</div>
                    </td>
                    <td className="font-semibold text-[13px]">{r.specialite}</td>
                    <td><span className={`badge ${r.type_rdv==='video'?'badge-blue':'badge-gray'}`}>{r.type_rdv==='video'?'Vidéo':'Présentiel'}</span></td>
                    <td className="text-[12.5px] text-slate-500">{r.motif||'—'}</td>
                    <td><span className={`badge ${r.statut==='confirme'?'badge-green':r.statut==='en_attente'?'badge-yellow':'badge-gray'}`}>{r.statut==='confirme'?'Confirmé':r.statut==='en_attente'?'En attente':'Terminé'}</span></td>
                  </tr>
                ))}
                {displayRdvs.length===0&&<tr><td colSpan={5} className="text-center text-slate-400 py-8 text-sm">Aucun rendez-vous</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab==='resultats' && (
          <div className="card p-6">
            {resultats.length===0 ? (
              <div className="text-center py-10 text-slate-400">
                <i className="fa-solid fa-flask-vial text-4xl mb-3 block opacity-20"/>
                <p className="text-sm">Aucun résultat disponible. Vos résultats de laboratoire apparaîtront ici dès qu'ils seront disponibles.</p>
                <p className="text-xs mt-2">Ils vous sont également envoyés automatiquement par WhatsApp et email.</p>
              </div>
            ) : (
              <table className="tbl w-full">
                <thead><tr><th>Date</th><th>Examen</th><th>Résultats</th><th>Notes</th><th>Statut</th></tr></thead>
                <tbody>
                  {resultats.map(r=>(
                    <tr key={r.id}>
                      <td className="text-xs text-slate-500">{new Date(r.date_examen).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})}</td>
                      <td className="font-semibold text-[13px]">{r.type_examen}</td>
                      <td className="text-[12.5px] text-slate-600 max-w-[250px]">{r.resultats}</td>
                      <td className="text-[12px] text-slate-400">{r.notes||'—'}</td>
                      <td><span className={`badge ${r.status==='envoye'?'badge-green':r.status==='disponible'?'badge-blue':'badge-yellow'}`}>{r.status==='envoye'?'Envoyé':r.status==='disponible'?'Disponible':'En attente'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

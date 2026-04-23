'use client'
// app/patient/dashboard/page.tsx — Espace patient : RDV, résultats labo, consultation vidéo
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { rdvApi, laboApi } from '@/lib/api'
import { RendezVous, ResultatLabo } from '@/types'
import { Video, FlaskConical, Calendar, LogOut } from 'lucide-react'

const STATUS_RDV: Record<string, {label:string; cls:string}> = {
  en_attente: { label:'En attente', cls:'badge-yellow' },
  confirme: { label:'Confirmé ✓', cls:'badge-green' },
  annule: { label:'Annulé', cls:'badge-red' },
  termine: { label:'Terminé', cls:'badge-gray' },
}

export default function PatientDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [rdvs, setRdvs] = useState<RendezVous[]>([])
  const [resultats, setResultats] = useState<ResultatLabo[]>([])
  const [activeTab, setActiveTab] = useState<'rdv'|'labo'|'video'>('rdv')

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'patient')) router.push('/login')
  }, [isAuthenticated, user, loading])

  useEffect(() => {
    if (!isAuthenticated) return
    rdvApi.patientList().then(r => setRdvs(r.data)).catch(() => {})
    if (user?.id) {
      laboApi.patientResultats(String(user.id)).then(r => setResultats(r.data)).catch(() => {})
    }
  }, [isAuthenticated, user])

  const rdvVideo = rdvs.filter(r => (r as any).type_rdv === 'video' && (r as any).lien_video)
  const rdvNormal = rdvs.filter(r => (r as any).type_rdv !== 'video')

  const prochainRdv = rdvs.find(r => new Date(r.date_rdv) > new Date() && r.statut !== 'annule')

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/></div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0f172a] h-[70px] flex items-center px-6 gap-4">
        <Link href="/" className="text-white/60 hover:text-white text-sm no-underline">
          <i className="fa-solid fa-plus mr-2 text-[#1641C8]"/>Clinique de la Rebecca
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-white/70 text-sm"><i className="fa-regular fa-user mr-1.5"/>{user?.nom}</span>
          <button onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/60 hover:text-red-400 text-xs font-medium border-none bg-transparent cursor-pointer transition-colors">
            <LogOut size={13}/> Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto py-10 px-5">
        {/* Bonjour */}
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-slate-800">Bonjour, {user?.nom?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Votre espace santé personnel</p>
        </div>

        {/* Prochain RDV */}
        {prochainRdv && (
          <div className="card p-5 mb-7 border-2 border-[#1641C8]/20 bg-blue-50/30">
            <div className="text-[11px] font-extrabold text-[#1641C8] uppercase tracking-widest mb-2">Prochain rendez-vous</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-extrabold text-lg text-slate-800">{prochainRdv.specialite}</div>
                <div className="text-slate-500 text-sm mt-1">
                  <i className="fa-regular fa-calendar mr-1.5"/>
                  {new Date(prochainRdv.date_rdv).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={STATUS_RDV[prochainRdv.statut]?.cls || 'badge-gray'}>
                  {STATUS_RDV[prochainRdv.statut]?.label || prochainRdv.statut}
                </span>
                {(prochainRdv as any).lien_video && (
                  <a href={(prochainRdv as any).lien_video} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1641C8] text-white text-sm font-bold rounded-xl no-underline hover:bg-[#0f2fa3] transition-colors">
                    <Video size={14}/> Rejoindre la vidéo
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="flex gap-2 mb-6">
          {([
            { key:'rdv', icon:<Calendar size={14}/>, label:'Mes rendez-vous' },
            { key:'labo', icon:<FlaskConical size={14}/>, label:'Résultats labo' },
            { key:'video', icon:<Video size={14}/>, label:'Consultations vidéo' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border-2 cursor-pointer transition-all
              ${activeTab===t.key ? 'bg-[#1641C8] text-white border-[#1641C8]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1641C8]'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Mes RDV */}
        {activeTab === 'rdv' && (
          <div className="space-y-3">
            {rdvs.length === 0 ? (
              <div className="card p-10 text-center">
                <Calendar size={32} className="text-slate-200 mx-auto mb-3"/>
                <p className="text-slate-400 text-sm">Vous n'avez pas encore de rendez-vous</p>
                <Link href="/consultation" className="btn-primary inline-flex mt-4 text-sm no-underline">
                  Prendre un rendez-vous
                </Link>
              </div>
            ) : rdvs.map(r => (
              <div key={r.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-[#1641C8]">
                  {(r as any).type_rdv === 'video' ? <Video size={18}/> : <Calendar size={18}/>}
                </div>
                <div className="flex-1">
                  <div className="font-extrabold text-slate-800">{r.specialite}</div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    {new Date(r.date_rdv).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                    {(r as any).type_rdv === 'video' && <span className="ml-2 badge-blue">Vidéo</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={STATUS_RDV[r.statut]?.cls || 'badge-gray'}>{STATUS_RDV[r.statut]?.label || r.statut}</span>
                  {(r as any).lien_video && (
                    <a href={(r as any).lien_video} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1641C8] text-white text-xs font-bold rounded-lg no-underline hover:bg-[#0f2fa3]">
                      <Video size={11}/> Rejoindre
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Résultats labo */}
        {activeTab === 'labo' && (
          <div className="space-y-3">
            {resultats.length === 0 ? (
              <div className="card p-10 text-center">
                <FlaskConical size={32} className="text-slate-200 mx-auto mb-3"/>
                <p className="text-slate-400 text-sm">Aucun résultat de laboratoire disponible</p>
              </div>
            ) : resultats.map(r => (
              <div key={r.id} className="card p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-extrabold text-slate-800 text-[15px]">{r.type_examen}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {new Date(r.date_examen).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
                    </div>
                  </div>
                  <span className={r.status==='envoye' ? 'badge-green' : r.status==='disponible' ? 'badge-blue' : 'badge-yellow'}>
                    {r.status==='envoye' ? 'Envoyé ✓' : r.status==='disponible' ? 'Disponible' : 'En attente'}
                  </span>
                </div>
                {r.resultats && (
                  <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 font-medium">
                    {r.resultats}
                  </div>
                )}
                {r.notes && <p className="text-xs text-slate-400 italic mt-2">{r.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Consultations vidéo */}
        {activeTab === 'video' && (
          <div>
            {rdvVideo.length === 0 ? (
              <div className="card p-10 text-center">
                <Video size={32} className="text-slate-200 mx-auto mb-3"/>
                <p className="text-slate-400 text-sm mb-4">Vous n'avez pas de consultation vidéo programmée</p>
                <Link href="/consultation" className="btn-primary inline-flex text-sm no-underline">
                  <Video size={14}/> Réserver une consultation vidéo
                </Link>
              </div>
            ) : rdvVideo.map(r => (
              <div key={r.id} className="card p-5 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-lg">{r.specialite}</div>
                    <div className="text-slate-400 text-sm mt-0.5">
                      {new Date(r.date_rdv).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                  <a href={(r as any).lien_video} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-[#1641C8] text-white font-bold rounded-xl no-underline hover:bg-[#0f2fa3] transition-colors">
                    <Video size={16}/> Rejoindre la consultation
                  </a>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-[#1641C8] font-medium">
                  <i className="fa-solid fa-link mr-1.5"/>{(r as any).lien_video}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Link href="/consultation" className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all no-underline">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1641C8] text-xl">
              <i className="fa-regular fa-calendar-plus"/>
            </div>
            <div>
              <div className="font-extrabold text-slate-800">Nouveau rendez-vous</div>
              <div className="text-slate-400 text-xs">En personne ou en vidéo</div>
            </div>
          </Link>
          <a href="https://wa.me/50938880000" target="_blank" rel="noreferrer"
            className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all no-underline">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-xl">
              <i className="fa-brands fa-whatsapp"/>
            </div>
            <div>
              <div className="font-extrabold text-slate-800">Contacter la clinique</div>
              <div className="text-slate-400 text-xs">WhatsApp · +509 3888 0000</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { stocksApi, chatApi } from '@/lib/api'
import { StockItem } from '@/types'
import RebeccaAI from '@/components/ui/RebeccaAI'
import { AlertTriangle, Package, LogOut, Megaphone } from 'lucide-react'

const STOCKS_DEMO: StockItem[] = [
  { id:1,  nom:'Amoxicilline 500mg',    categorie:'Antibiotique',        quantite:245, seuil_min:50,  prix_unitaire:45,  unite:'comprimé' },
  { id:2,  nom:'Paracétamol 500mg',     categorie:'Analgésique',         quantite:12,  seuil_min:100, prix_unitaire:15,  unite:'comprimé' },
  { id:3,  nom:'Ibuprofène 400mg',      categorie:'Anti-inflammatoire',  quantite:380, seuil_min:100, prix_unitaire:25,  unite:'comprimé' },
  { id:4,  nom:'Metformine 500mg',      categorie:'Antidiabétique',      quantite:89,  seuil_min:50,  prix_unitaire:30,  unite:'comprimé' },
  { id:5,  nom:'Amlodipine 5mg',        categorie:'Antihypertenseur',    quantite:156, seuil_min:50,  prix_unitaire:40,  unite:'comprimé' },
  { id:6,  nom:'Oméprazole 20mg',       categorie:'Antiulcéreux',        quantite:203, seuil_min:60,  prix_unitaire:35,  unite:'comprimé' },
  { id:7,  nom:'Seringues 10ml',        categorie:'Matériel',            quantite:380, seuil_min:200, prix_unitaire:8,   unite:'unité' },
  { id:8,  nom:'Masques chirurgicaux',  categorie:'Protection',          quantite:8,   seuil_min:50,  prix_unitaire:5,   unite:'unité' },
  { id:9,  nom:'Solution IV 500ml',     categorie:'Perfusion',           quantite:92,  seuil_min:30,  prix_unitaire:180, unite:'flacon' },
  { id:10, nom:'Cotrimoxazole 480mg',   categorie:'Antibiotique',        quantite:167, seuil_min:50,  prix_unitaire:20,  unite:'comprimé' },
  { id:11, nom:'Atorvastatine 20mg',    categorie:'Hypolipémiant',       quantite:0,   seuil_min:40,  prix_unitaire:55,  unite:'comprimé' },
  { id:12, nom:'Vitamine C 500mg',      categorie:'Vitamines',           quantite:320, seuil_min:80,  prix_unitaire:12,  unite:'comprimé' },
]

// Expiration fictive pour les démos
const EXPIRATIONS: Record<string, string> = {
  'Amoxicilline 500mg': '2026-12', 'Paracétamol 500mg': '2027-03',
  'Metformine 500mg': '2026-09', 'Amlodipine 5mg': '2027-01',
  'Oméprazole 20mg': '2026-11', 'Ibuprofène 400mg': '2027-06',
  'Cotrimoxazole 480mg': '2026-08', 'Vitamine C 500mg': '2027-04',
}

// ── Carrousel défilant ────────────────────────────────────────────────────────
function ScrollingDisplay({ stocks }: { stocks: StockItem[] }) {
  const [idx, setIdx]             = useState(0)
  const [aiMessages, setAiMessages] = useState<string[]>([])
  const [genLoading, setGenLoading] = useState(false)


  const disponibles  = stocks.filter(s => s.quantite > 0)
  const critiques    = stocks.filter(s => s.quantite > 0 && s.quantite < s.seuil_min)
  const ruptures     = stocks.filter(s => s.quantite === 0)

  // Auto-avancer le carrousel
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % disponibles.length), 3000)
    return () => clearInterval(timer)
  }, [disponibles.length])

  // Générer les messages publicitaires via AI
  const generateMessages = async () => {
    setGenLoading(true)
    try {
      const prompt = `Génère 5 messages publicitaires courts (max 15 mots chacun) pour une pharmacie clinicale haïtienne.
Produits disponibles : ${disponibles.slice(0,6).map(s => s.nom).join(', ')}.
Produits en alerte stock : ${critiques.map(s => s.nom).join(', ')}.
Format : un message par ligne, sans numérotation, style informatif et positif.`
      const { data } = await chatApi.send(prompt, [])
      const msgs = data.response.split('\n').filter((l: string) => l.trim().length > 5).slice(0, 5)
      setAiMessages(msgs)
    } catch { setAiMessages(['Nos produits essentiels sont disponibles — Consultez notre pharmacie']) }
    finally { setGenLoading(false) }
  }

  const current = disponibles[idx]

  return (
    <div style={{ background: 'linear-gradient(135deg,#0f172a,#dc2626)', borderRadius: 20, padding: '24px 28px', color: 'white', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>Fenêtre d'affichage pharmacie</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.1rem', margin: 0 }}>Produits disponibles à la pharmacie</h2>
        </div>
        <button onClick={generateMessages} disabled={genLoading} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
          borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.1)', color: 'white',
          cursor: genLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 12,
        }}>
          <i className="fa-solid fa-wand-magic-sparkles" />
          {genLoading ? 'Génération…' : 'Générer messages AI'}
        </button>
      </div>

      {/* Carte produit défilante */}
      {current && (
        <div key={idx} style={{ animation: 'fadeSlideIn 0.4s ease both' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Produit</div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{current.nom}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{current.categorie}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Disponibilité</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontWeight: 800, fontSize: 15, color: '#4ade80' }}>En stock</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{current.quantite} {current.unite}(s)</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Expiration</div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{EXPIRATIONS[current.nom] || '—'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Date d'expiration</div>
            </div>
          </div>

          {/* Indicateurs de navigation */}
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
            {disponibles.slice(0, 10).map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 20 : 6, height: 6, borderRadius: 3, border: 'none',
                background: i === idx ? 'white' : 'rgba(255,255,255,0.3)',
                cursor: 'pointer', padding: 0, transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Messages AI générés */}
      {aiMessages.length > 0 && (
        <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 9 }} />
            Messages générés par IA — Copiez pour votre écran d'affichage
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {aiMessages.map((msg, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fa-solid fa-circle-dot" style={{ fontSize: 8, color: '#fbbf24' }} />
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertes rapides */}
      {(critiques.length > 0 || ruptures.length > 0) && (
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {ruptures.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fca5a5' }}>
              <i className="fa-solid fa-circle-xmark" style={{ marginRight: 6 }} />
              {ruptures.length} rupture(s) : {ruptures.map(s => s.nom).join(', ')}
            </div>
          )}
          {critiques.length > 0 && (
            <div style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fde68a' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
              {critiques.length} stock(s) critique(s) : {critiques.map(s => s.nom).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function PharmaciePage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router   = useRouter()
  const [stocks, setStocks]   = useState<StockItem[]>(STOCKS_DEMO)
  const [search, setSearch]   = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [showAI, setShowAI]   = useState(false)

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'pharmacie')) router.push('/login')
  }, [isAuthenticated, user, loading, router])

  useEffect(() => {
    stocksApi.list().then(r => setStocks(r.data.length ? r.data : STOCKS_DEMO)).catch(() => setStocks(STOCKS_DEMO))
  }, [isAuthenticated])

  const categories = [...new Set(stocks.map(s => s.categorie))]
  const filtered   = stocks.filter(s =>
    s.nom.toLowerCase().includes(search.toLowerCase()) &&
    (!catFilter || s.categorie === catFilter)
  )

  const getStatus = (s: StockItem) => {
    if (s.quantite === 0)                         return { label: 'Rupture',   cls: 'badge-red' }
    if (s.quantite < s.seuil_min)                 return { label: 'Critique',  cls: 'badge-red' }
    if (s.quantite < s.seuil_min * 1.5)           return { label: 'Faible',    cls: 'badge-yellow' }
    return                                               { label: 'Disponible', cls: 'badge-green' }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" /></div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div style={{ background: '#0f172a', height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>
          <i className="fa-solid fa-plus mr-2 text-red-500" />Clinique de la Rebecca
        </Link>
        <div style={{ fontWeight: 800, color: 'white', marginLeft: 8 }}>Espace Pharmacie</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setShowAI(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px',
            borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
            background: showAI ? '#dc2626' : 'rgba(255,255,255,0.1)', color: 'white',
          }}>
            <i className="fa-solid fa-wand-magic-sparkles" />
            Rebecca AI
          </button>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{user?.nom}</span>
          <button onClick={() => { logout(); router.push('/') }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 12 }}>
            <LogOut size={13} /> Sortir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>

        {/* AI Panel */}
        {showAI && (
          <div style={{ marginBottom: 24, borderRadius: 20, overflow: 'hidden', border: '1px solid #fecaca', boxShadow: '0 4px 24px rgba(220,38,38,0.1)' }}>
            <RebeccaAI
              mode="pharmacie"
              context={{
                total_produits: stocks.length,
                disponibles: stocks.filter(s => s.quantite > 0).length,
                ruptures: stocks.filter(s => s.quantite === 0).map(s => s.nom),
                critiques: stocks.filter(s => s.quantite > 0 && s.quantite < s.seuil_min).map(s => ({ nom: s.nom, quantite: s.quantite, seuil: s.seuil_min })),
                expirations_proches: Object.entries(EXPIRATIONS).filter(([, exp]) => exp <= '2026-09').map(([nom, exp]) => ({ nom, expiration: exp })),
                top_produits: stocks.filter(s => s.quantite > 100).slice(0, 5).map(s => s.nom),
              }}
              initialPrompt="Analyse mon stock et génère 3 messages publicitaires pour l'écran d'affichage de la pharmacie."
            />
          </div>
        )}

        {/* Carrousel défilant */}
        <ScrollingDisplay stocks={stocks} />

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', background: 'white' }} />
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 14, background: 'white', cursor: 'pointer' }}>
            <option value="">Toutes catégories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table stocks */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>Seuil min</th>
                <th>Prix unit.</th>
                <th>Expiration</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const st = getStatus(s)
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{s.nom}</td>
                    <td><span className="badge-gray badge">{s.categorie}</span></td>
                    <td style={{ fontWeight: 700, color: s.quantite < s.seuil_min ? '#dc2626' : '#16a34a' }}>
                      {s.quantite} {s.unite}(s)
                    </td>
                    <td style={{ color: '#94a3b8' }}>{s.seuil_min}</td>
                    <td style={{ fontWeight: 600 }}>{s.prix_unitaire} HTG</td>
                    <td data-no-translate style={{ color: EXPIRATIONS[s.nom] && EXPIRATIONS[s.nom] <= '2026-09' ? '#dc2626' : '#64748b', fontSize: 13 }}>
                      {EXPIRATIONS[s.nom] || '—'}
                      {EXPIRATIONS[s.nom] && EXPIRATIONS[s.nom] <= '2026-09' && (
                        <span style={{ marginLeft: 6, fontSize: 10 }}>⚠️</span>
                      )}
                    </td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

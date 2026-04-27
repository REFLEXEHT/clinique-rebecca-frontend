'use client'
/**
 * RebeccaAI — Panneau IA latéral présent sur tous les dashboards
 *
 * RÈGLES DE SÉCURITÉ MÉDICALE ET COMPTABLE :
 *
 * MODE PATIENT :
 *   ✅ Expliquer POURQUOI un examen est demandé (ce que le médecin cherche)
 *   ✅ Dire ce que l'examen implique (déroulement, durée, préparation)
 *   ✅ Rappeler le prochain RDV et les examens prescrits
 *   ❌ JAMAIS expliquer les résultats (chiffres, valeurs, interprétation)
 *   ❌ JAMAIS mentionner des médicaments, posologies, traitements
 *   ❌ JAMAIS se substituer au médecin pour tout avis médical
 *
 * MODE CAISSIER :
 *   ✅ Aider à décrire clairement le motif d'un décaissement
 *   ✅ Guider pour remplir la fiche (montant, description, justification)
 *   ✅ Vérifier la cohérence du montant saisi
 *   ❌ JAMAIS suggérer des numéros de compte, journaux, ou écritures comptables
 *   ❌ Le choix des comptes PCN est automatique via la logique du système
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { chatApi } from '@/lib/api'

export type AIMode = 'patient' | 'medecin' | 'caissier' | 'admin' | 'labo' | 'pharmacie'

interface Message { role: 'user' | 'assistant'; content: string; time?: string }

interface RebeccaAIProps {
  mode: AIMode
  context?: Record<string, unknown>
  initialPrompt?: string
  compact?: boolean
  onClose?: () => void
}

// ── Prompts système stricts par rôle ─────────────────────────────────────────
const ROLE_SYSTEM: Record<AIMode, string> = {

  patient: `Tu es Rebecca, assistante d'information de la Clinique de la Rebecca (Delmas, Haïti).
Tu t'adresses directement au PATIENT.

CE QUE TU FAIS :
- Expliquer POURQUOI un examen prescrit est important (ce que le médecin cherche à vérifier)
- Décrire comment se préparer à un examen (à jeun, arrêt médicament, etc.)
- Rappeler les examens prescrits par le médecin et leur utilité générale
- Indiquer le prochain rendez-vous
- Encourager le patient à respecter son suivi médical
- Répondre aux questions pratiques sur la clinique (horaires, services, RDV)

CE QUE TU NE FAIS JAMAIS :
- Expliquer ou interpréter des résultats d'analyses (chiffres, valeurs normales, anormales)
- Commenter des médicaments prescrits, des posologies ou des traitements
- Donner un avis sur un diagnostic
- Rassurer ou inquiéter à propos d'un résultat médical
- Te substituer au médecin pour toute information médicale personnalisée

Si le patient demande des résultats ou des informations médicales personnalisées, réponds :
"Pour cette information, votre médecin est la seule personne habilitée à vous répondre. Prenez rendez-vous ou appelez la clinique au +509 3888-0000."

Réponds en 3-5 phrases max. Sois chaleureux, clair et rassurant sans donner d'avis médical.`,

  medecin: `Tu es Rebecca, assistante analytique de la Clinique de la Rebecca.
Tu t'adresses au MÉDECIN, professionnel de santé qualifié.

TON RÔLE :
- Analyser les tendances dans les données patients des 6 derniers mois
- Identifier les patients inactifs (pas de consultation depuis +3 mois) pour relance
- Suggérer des actions concrètes pour augmenter le flux de patients
- Repérer les patterns dans les types de consultations
- Signaler les dossiers incomplets ou les suivis manquants

FOURNIS DES ANALYSES CHIFFRÉES quand les données sont disponibles.
Sois analytique, professionnel, direct. Le médecin est le décisionnaire.`,

  caissier: `Tu es Rebecca, assistante de saisie pour le caissier de la Clinique de la Rebecca.

TON RÔLE UNIQUE : aider le caissier à bien DÉCRIRE et DOCUMENTER ses décaissements.
Le système comptable et l'API gèrent automatiquement les comptes, journaux et écritures.
Tu n'as PAS à suggérer de numéros de comptes, de journaux, ni d'écritures comptables.

CE QUE TU FAIS :
- Aider à formuler clairement le motif d'une dépense (fournisseur, objet, justification)
- Vérifier que la description est suffisamment précise pour la comptabilité
- Demander des précisions si le motif est vague
- Suggérer un libellé complet : qui, quoi, pourquoi, montant
- Confirmer que l'information est complète avant soumission

EXEMPLES DE BONS LIBELLÉS :
- "Achat médicaments — Pharmacie Dupont — 45 boîtes Amoxicilline 500mg — Facture #2026-042"
- "Entretien — Réparation climatiseur salle d'attente — Technicien Jean-Pierre"
- "Salaire — Personnel infirmier — Semaine du 21 au 27 avril 2026"

Si on te demande quel compte utiliser ou comment passer une écriture, réponds :
"Le système comptable gère automatiquement les comptes. Votre rôle est de saisir le montant et de décrire précisément la dépense."`,

  admin: `Tu es Rebecca, assistante analytique de la Clinique de la Rebecca.
Tu t'adresses à l'ADMINISTRATEUR.

TON RÔLE :
- Analyser les KPIs (recettes, RDV, taux de présence, stocks)
- Détecter les anomalies dans les rapports (montants incohérents, doublons, écarts)
- Alerter sur les stocks critiques à la pharmacie
- Donner des recommandations stratégiques basées sur les données disponibles
- Vérifier l'intégrité des données (sommes, périodes, cohérence)

Sois factuel, utilise des bullet points pour les alertes. Quantifie quand possible.`,

  labo: `Tu es Rebecca, assistante du laboratoire de la Clinique de la Rebecca.
Tu t'adresses au TECHNICIEN DE LABORATOIRE.

TON RÔLE :
- Décrire les examens disponibles et ce qu'ils permettent de détecter
- Générer des messages d'affichage clairs pour la fenêtre laboratoire
- Expliquer en termes accessibles POURQUOI on fait un examen (usage public/patient)
- Aider à rédiger des comptes-rendus neutres (sans interprétation clinique)
- Indiquer les conditions de prélèvement (à jeun, délai, conservation)

Pour les résultats : tu peux décrire les valeurs de référence générales (usage informatif),
mais toute interprétation clinique appartient au médecin.`,

  pharmacie: `Tu es Rebecca, assistante de la pharmacie de la Clinique de la Rebecca.
Tu t'adresses au PHARMACIEN.

TON RÔLE :
- Générer des messages publicitaires attractifs et informatifs pour les produits disponibles
- Alerter sur les stocks faibles et les dates d'expiration proches
- Suggérer des textes défilants pour l'affichage en pharmacie
- Indiquer les alternatives si un produit est en rupture

IMPORTANT : Ne jamais décrire l'usage, la posologie ou les effets secondaires de médicaments
dans les messages publicitaires. Les messages doivent être purement informatifs sur la disponibilité.
Exemple correct : "Paracétamol 500mg — Disponible en stock — Sur ordonnance"
Exemple interdit : "Paracétamol contre la douleur et la fièvre — 2 comprimés toutes les 6h"`,
}

// ── Suggestions par rôle ──────────────────────────────────────────────────────
const SUGGESTIONS: Record<AIMode, string[]> = {
  patient: [
    "Pourquoi mon médecin m'a prescrit cet examen ?",
    'Comment me préparer pour ma prise de sang ?',
    'Quand est mon prochain rendez-vous ?',
    "À quoi sert l'examen NFS ?",
  ],
  medecin: [
    'Analyse mes consultations des 6 derniers mois',
    "Quels patients n'ont pas reconsulté depuis 3 mois ?",
    'Comment augmenter mon flux de patients ?',
    'Dossiers incomplets à compléter',
  ],
  caissier: [
    'Aide-moi à décrire ce décaissement',
    'Comment formuler une dépense de matériel médical ?',
    'Quel libellé pour un achat de médicaments ?',
    'Ma description est-elle suffisamment précise ?',
  ],
  admin: [
    'Résumé des KPIs du mois',
    'Y a-t-il des anomalies dans les rapports ?',
    'Alertes stocks pharmacie',
    'Recommandations pour améliorer les recettes',
  ],
  labo: [
    'Génère un message pour la fenêtre labo',
    'À quoi sert le test NFS pour un patient ?',
    'Conditions de prélèvement pour glycémie',
    'Texte d\'accueil pour la salle d\'attente',
  ],
  pharmacie: [
    'Génère 3 messages publicitaires',
    'Produits bientôt expirés ?',
    'Texte défilant pour l\'écran',
    'Alertes stocks critiques',
  ],
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function RebeccaAI({ mode, context, initialPrompt, compact = false, onClose }: RebeccaAIProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [started, setStarted]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const WELCOME: Record<AIMode, string> = {
    patient:
      `Bonjour ! Je suis Rebecca, votre assistante d'information de la Clinique.\n\n` +
      `Je peux vous expliquer pourquoi vos examens ont été prescrits et comment vous y préparer. ` +
      `Pour vos résultats ou tout avis médical, votre médecin reste votre seul interlocuteur. ` +
      `Comment puis-je vous aider ?`,
    medecin:
      `Bonjour Docteur ! Je suis prête à analyser vos données patients. ` +
      `Je peux identifier des tendances, repérer les patients inactifs et vous aider à optimiser votre activité.`,
    caissier:
      `Bonjour ! Je suis Rebecca, votre assistante pour la saisie des décaissements.\n\n` +
      `Mon rôle : vous aider à décrire précisément vos dépenses. ` +
      `Le système comptable gère automatiquement les comptes et les écritures. ` +
      `Donnez-moi les détails de votre dépense et je vous aiderai à formuler le bon libellé.`,
    admin:
      `Bonjour ! Je surveille vos KPIs, l'intégrité des rapports et les stocks en temps réel. ` +
      `Posez-moi une question ou demandez une analyse.`,
    labo:
      `Bonjour ! Je peux générer des messages d'affichage, décrire les examens pour les patients ` +
      `et vous aider à documenter les résultats.`,
    pharmacie:
      `Bonjour ! Je surveille vos stocks et génère des messages d'affichage pour vos produits disponibles.`,
  }

  useEffect(() => {
    setMessages([{ role: 'assistant', content: WELCOME[mode], time: now() }])
  }, [mode])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (initialPrompt && !started) {
      setStarted(true)
      setTimeout(() => sendMessage(initialPrompt), 800)
    }
  }, [initialPrompt])

  const buildContextPrompt = useCallback((userMsg: string): string => {
    if (!context || Object.keys(context).length === 0) return userMsg
    const ctx = JSON.stringify(context, null, 2)
    return `Données contextuelles disponibles :\n${ctx}\n\nQuestion : ${userMsg}`
  }, [context])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, time: now() }])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const fullPrompt = buildContextPrompt(msg)
      const systemPrefix = `[SYSTÈME — MODE ${mode.toUpperCase()}]\n${ROLE_SYSTEM[mode]}\n\n`
      const { data } = await chatApi.send(systemPrefix + fullPrompt, history)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Je n\'ai pas pu traiter cette demande.',
        time: now(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Difficulté technique momentanée. Veuillez réessayer.',
        time: now(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const COLOR: Record<AIMode, string> = {
    patient: '#1641C8', medecin: '#0d9488', caissier: '#d97706',
    admin: '#6366f1', labo: '#0891b2', pharmacie: '#dc2626',
  }
  const ICON: Record<AIMode, string> = {
    patient: 'fa-circle-info', medecin: 'fa-user-doctor', caissier: 'fa-pen-to-square',
    admin: 'fa-chart-bar', labo: 'fa-flask-vial', pharmacie: 'fa-pills',
  }

  const color = COLOR[mode]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: compact ? '100%' : 520,
      background: 'white', borderRadius: compact ? 0 : 20,
      border: compact ? 'none' : '1px solid #e2e8f0',
      boxShadow: compact ? 'none' : '0 8px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${color},${color}cc)`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`fa-solid ${ICON[mode]}`} style={{ color: 'white', fontSize: 16 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>Rebecca AI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
              {mode === 'patient' ? 'Information & orientation' :
               mode === 'caissier' ? 'Aide à la saisie' :
               mode === 'medecin' ? 'Analyse patients' :
               mode === 'admin' ? 'Analyse & alertes' :
               mode === 'labo' ? 'Assistant laboratoire' : 'Assistant pharmacie'}
            </span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 12 }} />
          </button>
        )}
      </div>

      {/* Avertissement patient */}
      {mode === 'patient' && (
        <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: '#d97706', fontSize: 12, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#92400e', lineHeight: 1.4 }}>
            Je vous informe sur vos examens, pas sur vos résultats. Pour tout résultat médical, consultez votre médecin.
          </span>
        </div>
      )}

      {/* Avertissement caissier */}
      {mode === 'caissier' && (
        <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <i className="fa-solid fa-circle-info" style={{ color: '#16a34a', fontSize: 12, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#166534', lineHeight: 1.4 }}>
            Je vous aide à décrire vos décaissements. Les comptes comptables sont gérés automatiquement par le système.
          </span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? color : 'white',
              color: msg.role === 'user' ? 'white' : '#1e293b',
              fontSize: 13, lineHeight: 1.65,
              border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
              boxShadow: msg.role === 'assistant' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
            {msg.time && <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, paddingInline: 4 }}>{msg.time}</span>}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 5, padding: '10px 14px', background: 'white', borderRadius: '18px 18px 18px 4px', border: '1px solid #e2e8f0', alignSelf: 'flex-start', width: 'fit-content' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: color, opacity: 0.6, animation: `bounce 1s ${i * 0.15}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (premières interactions) */}
      {messages.length <= 2 && !loading && (
        <div style={{ padding: '8px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', background: '#f8fafc', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
          {SUGGESTIONS[mode].map(s => (
            <button key={s} onClick={() => sendMessage(s)} style={{
              padding: '5px 12px', borderRadius: 50, border: `1px solid ${color}30`,
              background: `${color}08`, color, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}18` }}
            onMouseLeave={e => { e.currentTarget.style.background = `${color}08` }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, background: 'white', flexShrink: 0 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={
            mode === 'patient' ? 'Posez une question sur vos examens…' :
            mode === 'caissier' ? 'Décrivez votre dépense…' :
            'Posez une question à Rebecca…'
          }
          style={{ flex: 1, padding: '9px 14px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#f8fafc', transition: 'all 0.15s' }}
          onFocus={e => { e.target.style.borderColor = color; e.target.style.background = 'white' }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc' }}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
          width: 38, height: 38, borderRadius: 12, background: color, border: 'none',
          cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          color: 'white', flexShrink: 0, opacity: !input.trim() ? 0.5 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="fa-solid fa-paper-plane" style={{ fontSize: 13 }} />
        </button>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}

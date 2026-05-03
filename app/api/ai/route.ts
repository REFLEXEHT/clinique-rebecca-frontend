import { NextRequest, NextResponse } from 'next/server'

// La clé Anthropic reste UNIQUEMENT côté serveur — jamais exposée au navigateur
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    console.error('[AI Route] ANTHROPIC_API_KEY manquante dans les variables d\'environnement')
    return NextResponse.json(
      { error: 'Service IA non configuré. Contactez l\'administrateur.' },
      { status: 503 }
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { model, max_tokens, messages, system } = body

  // Validation basique
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Paramètre messages requis' }, { status: 400 })
  }

  try {
    const payload: any = {
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: Math.min(max_tokens || 800, 2000), // Limite max pour éviter abus
      messages,
    }
    if (system) payload.system = system

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[AI Route] Erreur Anthropic:', res.status, data)
      return NextResponse.json(
        { error: 'Erreur du service IA', detail: data?.error?.message },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[AI Route] Exception:', error?.message)
    return NextResponse.json(
      { error: 'Délai d\'attente ou erreur réseau' },
      { status: 503 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// URL du backend côté serveur uniquement
const BACKEND = process.env.BACKEND_API_URL || 'https://clinique-rebecca-api.onrender.com'

async function proxy(req: NextRequest, method: string) {
  // Strip le préfixe /api pour éviter la duplication si le backend n'a pas de préfixe
  // Ex: /api/auth/register → /api/auth/register (conservé si backend a /api)
  const backendUrl = `${BACKEND}${req.nextUrl.pathname}${req.nextUrl.search}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  const fetchOptions: RequestInit = {
    method,
    headers,
    redirect: 'follow',
  }

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const body = await req.text()
      if (body) fetchOptions.body = body
    } catch { /* empty body */ }
  }

  try {
    const res = await fetch(backendUrl, {
      ...fetchOptions,
      signal: AbortSignal.timeout(25000),
    })

    const ct = res.headers.get('content-type') || ''

    if (ct.includes('application/json')) {
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    } else {
      const text = await res.text()
      console.error(`[Proxy] Non-JSON response from backend (${res.status}):`, text.slice(0, 200))
      return new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': ct || 'text/plain' },
      })
    }
  } catch (error: any) {
    console.error(`[Proxy] ${method} ${backendUrl} ->`, error?.message)
    return NextResponse.json(
      {
        detail: 'Erreur de connexion au serveur',
        error: error?.name === 'TimeoutError' ? 'timeout' : 'connection_error',
      },
      { status: 503 }
    )
  }
}

export async function GET(req: NextRequest)    { return proxy(req, 'GET')    }
export async function POST(req: NextRequest)   { return proxy(req, 'POST')   }
export async function PUT(req: NextRequest)    { return proxy(req, 'PUT')    }
export async function DELETE(req: NextRequest) { return proxy(req, 'DELETE') }
export async function PATCH(req: NextRequest)  { return proxy(req, 'PATCH')  }

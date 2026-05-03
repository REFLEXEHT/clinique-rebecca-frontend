import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || 'https://clinique-rebecca-api.onrender.com'

async function proxy(req: NextRequest, method: string) {
  const url = req.nextUrl
  // Reconstruct the backend URL: /api/[...path] → backend/api/[...path]
  const backendUrl = `${BACKEND}${url.pathname}${url.search}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  const fetchOptions: RequestInit = { method, headers }

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const body = await req.text()
      if (body) fetchOptions.body = body
    } catch {}
  }

  try {
    const res = await fetch(backendUrl, fetchOptions)
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const data = await res.json()
      return NextResponse.json(data, { status: res.status })
    } else {
      const text = await res.text()
      return new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': contentType },
      })
    }
  } catch (e: any) {
    console.error('Proxy error:', e.message)
    return NextResponse.json(
      { detail: 'Erreur de connexion au serveur backend' },
      { status: 503 }
    )
  }
}

export async function GET(req: NextRequest)    { return proxy(req, 'GET') }
export async function POST(req: NextRequest)   { return proxy(req, 'POST') }
export async function PUT(req: NextRequest)    { return proxy(req, 'PUT') }
export async function DELETE(req: NextRequest) { return proxy(req, 'DELETE') }
export async function PATCH(req: NextRequest)  { return proxy(req, 'PATCH') }

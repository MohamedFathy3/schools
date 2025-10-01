import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'https://back.professionalacademyedu.com'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PATCH')
}

async function handleRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const backendPath = path.join('/')
    
    // 🔥 الإصلاح: إزالة الـ api المكرر من الـ URL
    const url = `${BACKEND_URL}/${backendPath}`
    
    console.log(`🌐 [GATEWAY] ${method} /${backendPath}`)
    console.log(`🔗 [GATEWAY] Forwarding to: ${url}`)

    const headers = new Headers()
    const contentType = request.headers.get('content-type')
    
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers.set('Authorization', authHeader)
    }
    
    headers.set('Accept', 'application/json')
    
    if (contentType?.includes('application/json')) {
      headers.set('Content-Type', 'application/json')
    }

    let body: any = null
    if (method !== 'GET' && method !== 'HEAD') {
      body = await request.text()
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    console.log(`📡 [GATEWAY] Response: ${response.status}`)

    const responseHeaders = new Headers()
    const responseContentType = response.headers.get('content-type')
    if (responseContentType) {
      responseHeaders.set('Content-Type', responseContentType)
    }

    let responseData
    if (responseContentType?.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers: responseHeaders,
    })

  } catch (error) {
    console.error('🔥 [GATEWAY] Error:', error)
    return NextResponse.json(
      { error: 'Gateway error' },
      { status: 500 }
    )
  }
}
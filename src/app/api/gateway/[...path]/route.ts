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
    const url = `${BACKEND_URL}/${backendPath}`
    
    console.log(`🌐 [GATEWAY] ${method} /${backendPath}`)
    console.log(`🔗 [GATEWAY] Forwarding to: ${url}`)

    // 🔥 الإصلاح: نسخ جميع الـ headers من الطلب الأصلي
    const headers = new Headers()
    
    // نسخ جميع headers من الطلب الأصلي
    request.headers.forEach((value, key) => {
      // استثناء بعض headers التي تسبب مشاكل
      if (!['host', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value)
      }
    })

    // 🔥 الإصلاح الهام: إضافة headers للتعامل مع CORS و CSRF
    headers.set('Accept', 'application/json')
    headers.set('X-Requested-With', 'XMLHttpRequest')
    
    // إذا كان هناك referrer، أضفه
    const referrer = request.headers.get('referer')
    if (referrer) {
      headers.set('Referer', referrer)
    }

    // 🔥 الإصلاح: التعامل مع الـ cookies
    const cookie = request.headers.get('cookie')
    if (cookie) {
      headers.set('Cookie', cookie)
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = null
    if (method !== 'GET' && method !== 'HEAD') {
      body = await request.text()
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
      credentials: 'include', // 🔥 مهم للغاية
    })

    console.log(`📡 [GATEWAY] Response: ${response.status}`)

    // 🔥 نسخ جميع headers من الاستجابة
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      // استثناء headers التي تسبب مشاكل
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })

    // 🔥 الإصلاح: التعامل مع set-cookie header
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      responseHeaders.set('set-cookie', setCookie)
    }

    let responseData
    const responseContentType = response.headers.get('content-type')
    
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
      { error: 'Gateway error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
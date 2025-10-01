import { NextResponse } from 'next/server'

const BACKEND_URL = 'https://back.professionalacademyedu.com/api'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔐 Forwarding login request to backend...')

    // أولاً: الحصول على CSRF token
    const csrfResponse = await fetch(`${BACKEND_URL}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('🛡️ CSRF response status:', csrfResponse.status)

    // ثم: إرسال طلب تسجيل الدخول
    const loginResponse = await fetch(`${BACKEND_URL}/teachers/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    console.log('📡 Backend login response status:', loginResponse.status)

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.error('❌ Backend login failed:', {
        status: loginResponse.status,
        statusText: loginResponse.statusText,
        error: errorText
      })
      
      return NextResponse.json(
        { error: 'Login failed' },
        { status: loginResponse.status }
      )
    }

    const data = await loginResponse.json()
    console.log('✅ Backend login success:', data)

    // نسخ cookies من الـ backend response
    const setCookieHeader = loginResponse.headers.get('set-cookie')
    const headers = new Headers()

    if (setCookieHeader) {
      console.log('🍪 Setting cookies from backend:', setCookieHeader)
      headers.set('Set-Cookie', setCookieHeader)
    }

    return NextResponse.json(data, { headers })

  } catch (error) {
    console.error('🔥 Login API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
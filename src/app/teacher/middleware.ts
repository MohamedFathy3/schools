// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Cookies from 'js-cookie'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('teacher_token')?.value
  
  // إذا لم يكن هناك توكن ويحاول الوصول إلى صفحات المعلم
  if (!token && request.nextUrl.pathname.startsWith('/teacher')) {
    return NextResponse.redirect(new URL('/teacher/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/teacher/:path*'
}
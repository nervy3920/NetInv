import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const auth = request.cookies.get('auth')
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isPublicFile = request.nextUrl.pathname.startsWith('/_next') || 
                       request.nextUrl.pathname.includes('.')

  if (isPublicFile) return NextResponse.next()

  if (!auth && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (auth && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
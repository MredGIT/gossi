import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VALID_CAMPUSES = ['anu', 'uon', 'strath', 'ku']

export function middleware(request: NextRequest) {
  const hostname  = request.headers.get('host') ?? ''
  // Works for both anu.gossi.co.ke and localhost:3000
  const subdomain = hostname.split('.')[0].toLowerCase().replace(':3000', '')

  if (VALID_CAMPUSES.includes(subdomain)) {
    const response = NextResponse.next()
    // Forward campus as a cookie so server components can read it
    response.cookies.set('gossi_campus', subdomain, {
      maxAge:   60 * 60 * 24 * 30,
      path:     '/',
      sameSite: 'lax',
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}

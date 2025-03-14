// file generated by the Paraglide-Next init command
import { type NextRequest, NextResponse } from 'next/server'

import { middleware as paraglide } from '@/lib/i18n'

export function middleware(request: NextRequest) {
  // feel free to edit the request / response
  // and chain in other middlewares
  const response = paraglide(request)

  const protectedRoutes = ['/optimize']
  if (
    protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    const sessionId = request.cookies.get('sessionid')?.value

    if (!sessionId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

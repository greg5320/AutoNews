import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  let userId = request.cookies.get('user_id')?.value
  const response = NextResponse.next()
  
  if (!userId) {
    userId = crypto.randomUUID()
    response.cookies.set('user_id', userId, {
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 лет
      path: '/',
    })
    // Передаем также в кастомный заголовок, чтобы Server Components могли прочитать при самом первом заходе
    response.headers.set('x-user-id', userId)
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

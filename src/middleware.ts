import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their required roles
const PROTECTED_ROUTES = [
  { path: '/api/admin', roles: ['Admin'] },
  { path: '/api/transaction', roles: ['Admin', 'Member'] },
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if route is protected
  const protectedRoute = PROTECTED_ROUTES.find(route => path.startsWith(route.path))
  
  if (protectedRoute) {
    // In a real app, this would verify a JWT or session cookie using Better Auth or NextAuth.
    // Here we simulate it by reading a "simulate-role" header or cookie for assignment purposes.
    const role = request.cookies.get('simulate-role')?.value || request.headers.get('x-simulate-role')

    if (!role) {
      return NextResponse.json(
        { error: 'Unauthorized: No session found' },
        { status: 401 }
      )
    }

    if (!protectedRoute.roles.includes(role)) {
      return NextResponse.json(
        { error: `Forbidden: Requires one of roles: ${protectedRoute.roles.join(', ')}` },
        { status: 403 }
      )
    }

    // Role is valid, proceed
    // We can also pass the user context downstream by setting custom headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-role', role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

// Configure matcher to run middleware only on specific paths
export const config = {
  matcher: ['/api/:path*'],
}

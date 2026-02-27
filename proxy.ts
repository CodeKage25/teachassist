import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — always do this first
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Static assets and API routes pass through
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path === '/favicon.ico' ||
    path.startsWith('/icons') ||
    path.startsWith('/screenshots')
  ) {
    return supabaseResponse
  }

  // Public routes
  const publicPaths = ['/', '/login', '/signup']
  const isPublic = publicPaths.includes(path)

  if (!user) {
    if (isPublic) return supabaseResponse
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // User is authenticated — fetch their profile
  const { data: profile } = await supabase
    .from('users')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  // Authenticated user on public route → redirect to dashboard
  if (isPublic) {
    const url = request.nextUrl.clone()
    if (profile?.role === 'admin' && !profile.school_id) {
      url.pathname = '/setup'
    } else if (profile?.role === 'admin') {
      url.pathname = '/admin'
    } else {
      url.pathname = '/teacher'
    }
    return NextResponse.redirect(url)
  }

  // Admin without school_id must complete setup first
  if (
    profile?.role === 'admin' &&
    !profile.school_id &&
    path !== '/setup'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/setup'
    return NextResponse.redirect(url)
  }

  // Role-based route guards
  if (path.startsWith('/admin') && profile?.role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/teacher'
    return NextResponse.redirect(url)
  }

  if (path.startsWith('/teacher') && profile?.role !== 'teacher') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

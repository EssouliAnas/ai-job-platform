import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // This updates the session if it exists, refreshing it
  await supabase.auth.getSession();

  // Get current session state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is logged in and trying to access auth pages, redirect to appropriate dashboard
  if (session && (
    req.nextUrl.pathname.startsWith('/auth/sign-in') ||
    req.nextUrl.pathname.startsWith('/auth/sign-up') ||
    req.nextUrl.pathname.startsWith('/auth/company-sign-up')
  )) {
    // Check user type from database instead of metadata
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
    
    const userType = userData?.user_type || 'individual';
    return NextResponse.redirect(new URL(userType === 'company' ? '/company/dashboard' : '/dashboard', req.url));
  }

  // Redirect if not authenticated and trying to access protected routes
  if (!session && (
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/company/') ||
    req.nextUrl.pathname.startsWith('/resume-builder') ||
    req.nextUrl.pathname.startsWith('/resume-upload') ||
    req.nextUrl.pathname.startsWith('/cover-letter') ||
    req.nextUrl.pathname.startsWith('/templates') ||
    req.nextUrl.pathname.startsWith('/profile') ||
    req.nextUrl.pathname.startsWith('/employer')
  )) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  // For authenticated users accessing company or individual routes, check user type from database
  if (session && (
    req.nextUrl.pathname.startsWith('/company/') || 
    req.nextUrl.pathname.startsWith('/employer/') ||
    req.nextUrl.pathname === '/dashboard' || 
    req.nextUrl.pathname.startsWith('/resume-builder') ||
    req.nextUrl.pathname.startsWith('/resume-upload') ||
    req.nextUrl.pathname.startsWith('/cover-letter') ||
    req.nextUrl.pathname.startsWith('/templates') ||
    req.nextUrl.pathname.startsWith('/profile')
  )) {
    // Get user type from database
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
    
    const userType = userData?.user_type || 'individual';
    
    // Protect company routes - only allow access if user is a company
    if ((req.nextUrl.pathname.startsWith('/company/') || req.nextUrl.pathname.startsWith('/employer/')) && 
        userType !== 'company') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Protect individual user routes - redirect company users to their dashboard ONLY for these specific routes
    if (userType === 'company' &&
        (req.nextUrl.pathname === '/dashboard' || 
         req.nextUrl.pathname.startsWith('/resume-builder') ||
         req.nextUrl.pathname.startsWith('/resume-upload') ||
         req.nextUrl.pathname.startsWith('/cover-letter') ||
         req.nextUrl.pathname.startsWith('/templates') ||
         req.nextUrl.pathname.startsWith('/profile'))) {
      return NextResponse.redirect(new URL('/company/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|api/auth/callback).*)',
  ],
}; 
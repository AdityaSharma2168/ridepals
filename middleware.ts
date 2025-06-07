import { NextRequest } from "next/server";
import { createClient } from '@/lib/supabase/server'

// Define routes that require authentication
const PROTECTED_ROUTES = [
  "/my-rides",
  "/offer",
  "/profile",
  "/recurring",
  "/restaurants",
];

// Define routes that should redirect to home if already authenticated
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

// For debugging purposes - will be visible in server logs
function logAuthInfo(req: NextRequest, message: string) {
  console.log(`[Auth Middleware] ${message} - Path: ${req.nextUrl.pathname}`);
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Log all cookies for debugging
  const allCookies = req.cookies.getAll();
  const cookieNames = allCookies.map(c => c.name).join(', ');
  logAuthInfo(req, `All cookies: ${cookieNames}`);
  
  // Create Supabase client with proper SSR cookie handling
  const { supabase, response } = createClient(req);
  
  // Check user authentication using proper SSR client
  let isAuthenticated = false;
  let user = null;
  
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    user = authUser;
    isAuthenticated = !!authUser && !error;
    
    logAuthInfo(req, `✅ SSR Auth check - Authenticated: ${isAuthenticated}, User: ${user?.email || 'none'}, Error: ${error?.message || 'none'}`);
  } catch (err: any) {
    logAuthInfo(req, `❌ SSR Auth check failed: ${err.message}`);
    isAuthenticated = false;
  }
  
  // No authentication check for homepage, auth callback, and non-protected routes
  if (pathname === "/" || 
      pathname.startsWith("/auth/callback") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")) { // Static files
    logAuthInfo(req, "Public route - proceeding without auth check");
    return response;
  }

  // Check if the route is a protected route and user is not authenticated
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    logAuthInfo(req, `🔒 Protected route accessed without authentication - redirecting to login`);
    // Redirect to login page with the current URL as callback URL
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }

  // Check if the route is an auth route and user is already authenticated
  if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    logAuthInfo(req, `🏠 Auth route accessed while authenticated - redirecting to ${callbackUrl || "home"}`);
    
    // Redirect to home page or the callbackUrl if present
    if (callbackUrl) {
      return Response.redirect(new URL(callbackUrl, req.url));
    }
    return Response.redirect(new URL("/", req.url));
  }

  // Continue with the request
  logAuthInfo(req, "✅ Proceeding with request");
  return response;
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (starts with /api/)
     * - static files (/_next/, /images/, /fonts/, /favicon.ico, etc.)
     */
    "/((?!api|_next|images|fonts|favicon.ico|.*\\.).*)",
  ],
}; 
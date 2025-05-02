import { NextRequest, NextResponse } from "next/server";

// Define routes that require authentication
const PROTECTED_ROUTES = [
  "/my-rides",
  "/offer",
  "/profile",
  "/recurring",
  "/pitstops",
];

// Define routes that should redirect to home if already authenticated
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

// For debugging purposes - will be visible in server logs
function logAuthInfo(req: NextRequest, message: string) {
  console.log(`[Auth Middleware] ${message} - Path: ${req.nextUrl.pathname}`);
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Get the Firebase session cookie
  const session = req.cookies.get("__session")?.value;
  const isAuthenticated = !!session;
  
  // Log authentication status for debugging
  logAuthInfo(req, `Auth status: ${isAuthenticated ? "Authenticated" : "Not authenticated"}`);
  logAuthInfo(req, `Cookie: ${session ? "Present" : "Not present"}`);
  
  // No authentication check for homepage and non-protected routes
  if (pathname === "/" || (!PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !AUTH_ROUTES.includes(pathname))) {
    logAuthInfo(req, "Public route - proceeding without auth check");
    return NextResponse.next();
  }

  // Check if the route is a protected route and user is not authenticated
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    logAuthInfo(req, `Protected route accessed without authentication - redirecting to login`);
    // Redirect to login page with the current URL as callback URL
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Check if the route is an auth route and user is already authenticated
  if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    logAuthInfo(req, `Auth route accessed while authenticated - redirecting to ${callbackUrl || "home"}`);
    
    // Redirect to home page or the callbackUrl if present
    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Continue with the request
  logAuthInfo(req, "Proceeding with request");
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (starts with /api/)
     * - static files (/_next/, /images/, /fonts/, /favicon.ico, etc.)
     */
    "/((?!api|_next|images|fonts|favicon.ico).*)",
  ],
}; 
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth as adminAuth } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;
    
    console.log(`[Auth Check API] Session cookie: ${sessionCookie ? "Present" : "Not present"}`);
    
    if (!sessionCookie) {
      console.log("[Auth Check API] No session cookie found");
      return NextResponse.json(
        { authenticated: false, reason: "No session cookie found" },
        { status: 200 }
      );
    }
    
    try {
      // Verify the session cookie
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      console.log(`[Auth Check API] Session verified for user: ${decodedClaims.email}`);
      
      return NextResponse.json({
        authenticated: true,
        user: {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
          emailVerified: decodedClaims.email_verified,
        }
      });
    } catch (verifyError) {
      console.error("[Auth Check API] Session verification error:", verifyError);
      return NextResponse.json(
        { authenticated: false, reason: "Invalid session cookie" },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("[Auth Check API] Error in auth check API:", error.message);
    
    return NextResponse.json(
      { authenticated: false, error: "Authentication check failed", reason: error.message },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth as adminAuth } from "@/lib/firebase/admin";

function isEducationalEmail(email: string): boolean {
  return email.toLowerCase().endsWith('.edu');
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'No ID token provided' },
        { status: 400 }
      );
    }

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if the email is verified
    if (!decodedToken.email_verified) {
      return NextResponse.json(
        { error: 'Email not verified' },
        { status: 403 }
      );
    }

    // Check if email exists and is .edu
    if (!decodedToken.email || !isEducationalEmail(decodedToken.email)) {
      return NextResponse.json(
        { error: 'Only .edu email addresses are allowed' },
        { status: 403 }
      );
    }

    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set the cookie
    const cookieStore = await cookies();
    cookieStore.set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });

    return NextResponse.json({ 
      success: true,
      message: 'Logged in successfully'
    });
  } catch (error: any) {
    console.error('Firebase authentication error:', error);
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 403 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 
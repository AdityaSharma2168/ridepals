import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth as adminAuth } from "@/lib/firebase/admin";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = cookies().get("__session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Get user data from the database
    const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();
    
    if (!userDoc.exists) {
      cookies().delete("__session"); // Clear invalid session
      return NextResponse.json(
        { authenticated: false, error: "User not found" },
        { status: 401 }
      );
    }
    
    const userData = userDoc.data();
    
    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: userData?.email,
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        college_id: userData?.college_id,
        profile_image_url: userData?.profile_image_url,
        college_email_verified: userData?.college_email_verified,
        average_rating: userData?.average_rating,
      }
    });
    
  } catch (error: any) {
    console.error("Error in session verification:", error.message);
    
    // Clear the invalid session cookie
    cookies().delete("__session");
    
    return NextResponse.json(
      { authenticated: false, error: "Invalid session" },
      { status: 401 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 
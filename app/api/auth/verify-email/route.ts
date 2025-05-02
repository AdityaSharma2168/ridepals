import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth as adminAuth } from "@/lib/firebase/admin";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    // Get authorization token from header
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }
    
    // Extract the token
    const idToken = authHeader.split("Bearer ")[1];
    
    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if the email is already verified
    if (!decodedToken.email_verified) {
      return NextResponse.json(
        { error: "Email not verified by Firebase yet." },
        { status: 400 }
      );
    }
    
    // Get user from the database
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found in the database." },
        { status: 404 }
      );
    }
    
    // Update the user's college_email_verified status in the database
    await adminDb.collection("users").doc(decodedToken.uid).update({
      college_email_verified: true,
      updated_at: new Date()
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Email verified successfully"
    });
    
  } catch (error: any) {
    console.error("Error in email verification:", error.message);
    
    return NextResponse.json(
      { error: "Email verification failed: " + error.message },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 
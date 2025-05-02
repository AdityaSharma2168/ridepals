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
    
    // Parse the request body
    const body = await req.json();
    const { uid, email, college_id, first_name, last_name } = body;
    
    if (!uid || !email || !college_id || !first_name || !last_name) {
      return NextResponse.json(
        { error: "Invalid request: Missing required fields" },
        { status: 400 }
      );
    }
    
    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Make sure the UID matches the token
    if (decodedToken.uid !== uid) {
      return NextResponse.json(
        { error: "Unauthorized: Token doesn't match user" },
        { status: 401 }
      );
    }
    
    // Check if it's a .edu email
    if (!email.endsWith(".edu")) {
      return NextResponse.json(
        { error: "Only .edu email addresses are allowed." },
        { status: 403 }
      );
    }
    
    // User data for our database
    const userData = {
      id: uid,
      email,
      first_name,
      last_name,
      college_id,
      college_email_verified: false, // Will be verified separately
      profile_image_url: null,
      face_verified: false,
      average_rating: 0.0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    // Add the user to our database (Firestore)
    await adminDb.collection("users").doc(uid).set(userData);
    
    // User is registered, create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    // Set the session cookie
    cookies().set("__session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    
    // Return success response with user data
    return NextResponse.json({ 
      success: true,
      user: {
        uid,
        email,
        first_name,
        last_name,
        college_id,
      }
    });
    
  } catch (error: any) {
    console.error("Error in register API:", error.message);
    
    return NextResponse.json(
      { error: "Registration failed: " + error.message },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 
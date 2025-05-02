import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth as adminAuth } from "@/lib/firebase/admin";
import { adminDb } from "@/lib/firebase/admin";

// GET: Fetch the user's profile data
export async function GET(req: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = cookies().get("__session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Get user data from the database
    const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const userData = userDoc.data();
    
    return NextResponse.json({
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
    console.error("Error fetching user profile:", error.message);
    
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PUT: Update the user's profile data
export async function PUT(req: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = cookies().get("__session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Get user data from request body
    const body = await req.json();
    const { first_name, last_name, profile_image_url } = body;
    
    // Validate the data
    if (first_name === undefined && last_name === undefined && profile_image_url === undefined) {
      return NextResponse.json(
        { error: "No data to update" },
        { status: 400 }
      );
    }
    
    // Prepare update data
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };
    
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (profile_image_url !== undefined) updateData.profile_image_url = profile_image_url;
    
    // Update user in the database
    await adminDb.collection("users").doc(decodedClaims.uid).update(updateData);
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });
    
  } catch (error: any) {
    console.error("Error updating user profile:", error.message);
    
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 
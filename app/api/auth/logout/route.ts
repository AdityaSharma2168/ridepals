import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete("__session");
    
    // Create response with cleared cookie
    const response = NextResponse.json({ 
      success: true,
      message: "Logged out successfully"
    });

    // Also set the cookie in the response to ensure it's cleared
    response.cookies.delete("__session");
    
    return response;
  } catch (error: any) {
    console.error("Error in logout API:", error.message);
    
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 
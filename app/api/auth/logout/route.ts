import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Clear the session cookie
    cookies().delete("__session");
    
    return NextResponse.json({ 
      success: true,
      message: "Logged out successfully"
    });
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
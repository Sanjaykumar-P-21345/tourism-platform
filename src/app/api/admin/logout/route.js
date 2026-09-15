import { NextResponse } from "next/server";

/* =========================================================
   POST - ADMIN LOGOUT
   ========================================================= */

export async function POST(request) {
  try {
    /*
      Authentication is handled on the client using
      sessionStorage.

      The server does not store the JWT in cookies,
      so logout simply confirms the logout request.

      The actual token removal happens in:
      src/utils/api.js
    */

    return NextResponse.json(
      {
        success: true,
        message: "Admin logout successful.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging out.",
      },
      { status: 500 },
    );
  }
}

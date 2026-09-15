import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { Admin } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

/* =========================================================
   GET - CURRENT AUTHENTICATED ADMIN
   ========================================================= */

export async function GET(request) {
  try {
    /* -------------------------------------------------------
       1. VERIFY ADMIN JWT
       ------------------------------------------------------- */

    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login as admin.",
        },
        { status: 401 },
      );
    }

    /* -------------------------------------------------------
       2. CONNECT TO DATABASE
       ------------------------------------------------------- */

    await connectDB();

    /* -------------------------------------------------------
       3. FIND ADMIN
       ------------------------------------------------------- */

    const adminData = await Admin.findById(admin.adminId).select("-password");

    if (!adminData) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin account not found.",
        },
        { status: 404 },
      );
    }

    /* -------------------------------------------------------
       4. CHECK ADMIN STATUS
       ------------------------------------------------------- */

    if (adminData.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Your admin account is inactive.",
        },
        { status: 403 },
      );
    }

    /* -------------------------------------------------------
       5. PREPARE ADMIN DATA
       ------------------------------------------------------- */

    const user = {
      id: adminData._id.toString(),
      name: adminData.name,
      email: adminData.email,
      status: adminData.status,
      lastLogin: adminData.lastLogin,
      createdAt: adminData.createdAt,
      updatedAt: adminData.updatedAt,
    };

    /* -------------------------------------------------------
       6. SUCCESS RESPONSE
       ------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,
        message: "Admin authenticated successfully.",
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin me error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching admin data.",
      },
      { status: 500 },
    );
  }
}

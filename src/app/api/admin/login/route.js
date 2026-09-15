import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/utils/mongodb";
import { Admin } from "@/utils/schema";
import { createToken } from "@/utils/jwt";
import { validateAdminLogin } from "@/utils/validation";

/* =========================================================
   POST - ADMIN LOGIN
   ========================================================= */

export async function POST(request) {
  try {
    /* -------------------------------------------------------
       1. CONNECT TO DATABASE
       ------------------------------------------------------- */

    await connectDB();

    /* -------------------------------------------------------
       2. READ REQUEST BODY
       ------------------------------------------------------- */

    let body;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    /* -------------------------------------------------------
       3. VALIDATE INPUT
       ------------------------------------------------------- */

    const validation = validateAdminLogin(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the login details.",
          errors: validation.errors,
        },
        { status: 400 },
      );
    }

    /* -------------------------------------------------------
       4. NORMALIZE EMAIL
       ------------------------------------------------------- */

    const email = body.email.trim().toLowerCase();

    const password = body.password;

    /* -------------------------------------------------------
       5. FIND ADMIN
       
       Password has select:false in AdminSchema.
       Therefore we explicitly select it.
       ------------------------------------------------------- */

    const admin = await Admin.findOne({ email }).select("+password");

    /* -------------------------------------------------------
       6. CHECK ADMIN EXISTS
       ------------------------------------------------------- */

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    /* -------------------------------------------------------
       7. CHECK ADMIN STATUS
       ------------------------------------------------------- */

    if (admin.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Your admin account is inactive.",
        },
        { status: 403 },
      );
    }

    /* -------------------------------------------------------
       8. COMPARE PASSWORD
       ------------------------------------------------------- */

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    /* -------------------------------------------------------
       9. UPDATE LAST LOGIN
       ------------------------------------------------------- */

    admin.lastLogin = new Date();

    await admin.save();

    /* -------------------------------------------------------
       10. CREATE JWT
       ------------------------------------------------------- */

    const token = await createToken(admin);

    /* -------------------------------------------------------
       11. REMOVE PASSWORD FROM RESPONSE
       ------------------------------------------------------- */

    const adminData = {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      status: admin.status,
      lastLogin: admin.lastLogin,
    };

    /* -------------------------------------------------------
       12. RETURN SUCCESS RESPONSE
       ------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,
        message: "Admin login successful.",
        token,
        user: adminData,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging in.",
      },
      { status: 500 },
    );
  }
}

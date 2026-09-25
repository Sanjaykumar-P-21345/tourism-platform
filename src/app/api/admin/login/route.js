import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/utils/mongodb";
import { Admin } from "@/utils/schema";
import { createToken } from "@/utils/jwt";

export const runtime = "nodejs";

/* =========================================================
   POST - ADMIN LOGIN
   POST /api/admin/login
   ========================================================= */

export async function POST(request) {
  try {
    console.log("========== ADMIN LOGIN START ==========");

    /* =====================================================
       1. CONNECT DATABASE
       ===================================================== */

    console.log("1. Connecting to MongoDB...");

    await connectDB();

    console.log("2. MongoDB connected.");

    /* =====================================================
       2. READ BODY
       ===================================================== */

    let body;

    try {
      body = await request.json();
    } catch (error) {
      console.error("3. Request JSON error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    console.log("3. Login request received.");

    /* =====================================================
       3. VALIDATE BASIC INPUT
       ===================================================== */

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    const password = String(body?.password || "");

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        {
          status: 400,
        },
      );
    }

    console.log("4. Login input validated.");

    /* =====================================================
       4. CHECK ADMIN MODEL
       ===================================================== */

    if (!Admin) {
      console.error("Admin model is undefined.");

      return NextResponse.json(
        {
          success: false,
          message: "Admin model is not configured correctly.",
        },
        {
          status: 500,
        },
      );
    }

    console.log("5. Admin model loaded.");

    /* =====================================================
       5. FIND ADMIN
       ===================================================== */

    const admin = await Admin.findOne({
      email,
    }).select("+password");

    console.log("6. Admin lookup completed.");

    if (!admin) {
      console.log("Admin account not found:", email);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        {
          status: 401,
        },
      );
    }

    /* =====================================================
       6. PASSWORD CHECK
       ===================================================== */

    if (!admin.password) {
      console.error("Admin password was not returned from MongoDB.");

      return NextResponse.json(
        {
          success: false,
          message: "Administrator password is not configured correctly.",
        },
        {
          status: 500,
        },
      );
    }

    console.log("7. Comparing password...");

    const passwordValid = await bcrypt.compare(password, admin.password);

    if (!passwordValid) {
      console.log("Password is incorrect.");

      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        {
          status: 401,
        },
      );
    }

    console.log("8. Password verified.");

    /* =====================================================
       7. ACCOUNT STATUS
       ===================================================== */

    if (admin.status && admin.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Your administrator account is inactive.",
        },
        {
          status: 403,
        },
      );
    }

    console.log("9. Admin account is active.");

    /* =====================================================
       8. CREATE JWT
       ===================================================== */

    console.log("10. Creating JWT...");

    const token = await createToken(admin);

    if (!token) {
      throw new Error("JWT token was not created.");
    }

    console.log("11. JWT created.");

    /* =====================================================
       9. UPDATE LAST LOGIN
       
       This is intentionally non-blocking.
       A lastLogin update must not prevent login.
       ===================================================== */

    try {
      await Admin.updateOne(
        {
          _id: admin._id,
        },
        {
          $set: {
            lastLogin: new Date(),
          },
        },
      );

      console.log("12. Last login updated.");
    } catch (lastLoginError) {
      console.error("Last login update failed:", lastLoginError);
    }

    /* =====================================================
       10. SAFE USER OBJECT
       ===================================================== */

    const user = {
      id: admin._id.toString(),

      adminId: admin._id.toString(),

      name: admin.name || "",

      email: admin.email,

      role: "admin",

      status: admin.status || "active",
    };

    /* =====================================================
       11. SUCCESS
       ===================================================== */

    console.log("13. Admin login successful.");

    console.log("========== ADMIN LOGIN END ==========");

    return NextResponse.json(
      {
        success: true,
        message: "Admin login successful.",
        token,
        user,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    /* =====================================================
       REAL SERVER ERROR
       ===================================================== */

    console.error("========================================");

    console.error("ADMIN LOGIN SERVER ERROR");

    console.error("Message:", error?.message);

    console.error("Name:", error?.name);

    console.error("Stack:", error?.stack);

    console.error("Full error:", error);

    console.error("========================================");

    return NextResponse.json(
      {
        success: false,

        message: error?.message || "Something went wrong while logging in.",

        error:
          process.env.NODE_ENV === "development"
            ? {
                name: error?.name,
                message: error?.message,
              }
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

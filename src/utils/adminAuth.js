import { verifyToken } from "./jwt";

/* =========================================================
   GET AUTHENTICATED ADMIN FROM REQUEST
   ========================================================= */

export async function getAdminFromRequest(request) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get("authorization");

    // Check whether Bearer token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    // Extract JWT token
    const token = authHeader.substring(7).trim();

    if (!token) {
      return null;
    }

    // Verify JWT
    const admin = await verifyToken(token);

    // Validate admin authentication
    if (!admin || admin.role !== "admin" || !admin.adminId) {
      return null;
    }

    return admin;
  } catch (error) {
    console.error("Admin authentication failed:", error);

    return null;
  }
}

/* =========================================================
   REQUIRE ADMIN AUTHENTICATION
   ========================================================= */

export async function requireAdmin(request) {
  const admin = await getAdminFromRequest(request);

  return admin;
}

import { SignJWT, jwtVerify } from "jose";

/* =========================================================
   JWT SECRET
   ========================================================= */

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

/* =========================================================
   CREATE ADMIN JWT
   ========================================================= */

export async function createToken(admin) {
  if (!admin?._id || !admin?.email) {
    throw new Error("Admin ID and email are required to create JWT.");
  }

  const token = await new SignJWT({
    adminId: admin._id.toString(),
    email: admin.email,
    role: "admin",
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secretKey);

  return token;
}

/* =========================================================
   VERIFY ADMIN JWT
   ========================================================= */

export async function verifyToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.adminId || !payload.email || payload.role !== "admin") {
      return null;
    }

    return {
      adminId: payload.adminId,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    return null;
  }
}

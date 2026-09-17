import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Admin } from "../src/utils/schema.js";

/* =========================================================
   LOAD ENVIRONMENT VARIABLES
   ========================================================= */

dotenv.config({
  path: ".env.local",
});

/* =========================================================
   ADMIN CREDENTIALS
   ========================================================= */

const ADMIN_NAME = "SST Travels";
const ADMIN_EMAIL = "mithil@gmail.com";
const ADMIN_PASSWORD = "mithil@123";

/* =========================================================
   CREATE / RESET ADMIN
   ========================================================= */

async function createAdmin() {
  try {
    /* -------------------------------------------------------
       CHECK MONGODB URI
       ------------------------------------------------------- */

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env.local");
    }

    /* -------------------------------------------------------
       CONNECT DATABASE
       ------------------------------------------------------- */

    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected successfully.");

    /* -------------------------------------------------------
       FIND ADMIN
       ------------------------------------------------------- */

    let admin = await Admin.findOne({
      email: ADMIN_EMAIL,
    }).select("+password");

    /* -------------------------------------------------------
       HASH PASSWORD
       ------------------------------------------------------- */

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    /* -------------------------------------------------------
       UPDATE EXISTING ADMIN
       ------------------------------------------------------- */

    if (admin) {
      console.log("Existing admin found.");
      console.log("Resetting admin password...");

      admin.name = ADMIN_NAME;
      admin.email = ADMIN_EMAIL;
      admin.password = hashedPassword;
      admin.status = "active";

      await admin.save();

      console.log("");
      console.log("======================================");
      console.log("ADMIN RESET SUCCESSFULLY");
      console.log("======================================");
      console.log(`Email:    ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      console.log(`Status:   ${admin.status}`);
      console.log("======================================");
      console.log("");

      return;
    }

    /* -------------------------------------------------------
       CREATE NEW ADMIN
       ------------------------------------------------------- */

    console.log("No admin found.");
    console.log("Creating new admin...");

    admin = await Admin.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      status: "active",
    });

    console.log("");
    console.log("======================================");
    console.log("ADMIN CREATED SUCCESSFULLY");
    console.log("======================================");
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Status:   ${admin.status}`);
    console.log("======================================");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("======================================");
    console.error("ADMIN SETUP FAILED");
    console.error("======================================");
    console.error(error);
    console.error("======================================");
    console.error("");

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
  }
}

/* =========================================================
   RUN
   ========================================================= */

createAdmin();
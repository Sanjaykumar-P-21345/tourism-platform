import { NextResponse } from "next/server";

import { requireAdmin } from "@/utils/adminAuth";
import cloudinary from "@/utils/cloudinary";

export const runtime = "nodejs";

export async function DELETE(request) {
  try {
    /* ============================================================
       ADMIN AUTHENTICATION
    ============================================================ */

    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    /* ============================================================
       READ REQUEST BODY
    ============================================================ */

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    const publicId =
      typeof body?.publicId === "string"
        ? body.publicId.trim()
        : "";

    if (!publicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary publicId is required.",
        },
        { status: 400 },
      );
    }

    /* ============================================================
       CLOUDINARY DELETE
    ============================================================ */

    const result = await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
        invalidate: true,
      },
    );

    /*
     * Cloudinary normally returns:
     *
     * { result: "ok" }
     *
     * It can also return:
     *
     * { result: "not found" }
     *
     * A missing image is effectively already deleted,
     * so we can safely treat it as successful.
     */

    if (
      result?.result !== "ok" &&
      result?.result !== "not found"
    ) {
      console.error(
        "Cloudinary delete failed:",
        result,
      );

      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary failed to delete the image.",
          result: result?.result || null,
        },
        { status: 500 },
      );
    }

    /* ============================================================
       SUCCESS
    ============================================================ */

    return NextResponse.json(
      {
        success: true,
        message:
          result?.result === "not found"
            ? "Image was already removed."
            : "Image deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Cloudinary image delete error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to delete image.",
      },
      { status: 500 },
    );
  }
}
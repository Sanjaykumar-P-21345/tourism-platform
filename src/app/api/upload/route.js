import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/adminAuth";
import cloudinary from "@/utils/cloudinary";

export const runtime = "nodejs";

export async function POST(request) {
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
        {
          status: 401,
        }
      );
    }

    /* ============================================================
       READ FORM DATA
    ============================================================ */

    const formData = await request.formData();

    const file = formData.get("file");
    const folder = formData.get("folder") || "tourism/general";

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required",
        },
        {
          status: 400,
        }
      );
    }

    /* ============================================================
       VALIDATE FILE
    ============================================================ */

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image file",
        },
        {
          status: 400,
        }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid image type. Only JPG, PNG, WEBP and GIF are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    /* ============================================================
       FILE SIZE VALIDATION
       Maximum: 10 MB
    ============================================================ */

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size cannot exceed 10 MB",
        },
        {
          status: 400,
        }
      );
    }

    /* ============================================================
       CONVERT FILE TO BUFFER
    ============================================================ */

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    /* ============================================================
       UPLOAD TO CLOUDINARY
    ============================================================ */

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: String(folder),
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    /* ============================================================
       RESPONSE
    ============================================================ */

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        image: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Image upload failed",
      },
      {
        status: 500,
      }
    );
  }
}
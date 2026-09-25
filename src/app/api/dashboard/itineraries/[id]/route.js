import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { requireAdmin } from "@/utils/adminAuth";
import { Itinerary } from "@/utils/schema";
import cloudinary from "@/utils/cloudinary";

function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

/* ================================================================
   CLOUDINARY DELETE
================================================================ */

async function deleteCloudinaryImage(image) {
  if (!image?.publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(image.publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error(
      `Failed to delete Cloudinary image ${image.publicId}:`,
      error,
    );
  }
}

/* ================================================================
   DELETE ALL ITINERARY IMAGES
================================================================ */

async function deleteItineraryImages(itinerary) {
  const images = [];

  if (itinerary?.coverImage?.publicId) {
    images.push(itinerary.coverImage);
  }

  if (Array.isArray(itinerary?.gallery)) {
    for (const image of itinerary.gallery) {
      if (image?.publicId) {
        images.push(image);
      }
    }
  }

  await Promise.all(images.map((image) => deleteCloudinaryImage(image)));
}

/* ================================================================
   GET ONE ITINERARY
================================================================ */

export async function GET(request, { params }) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid itinerary ID.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const itinerary = await Itinerary.findById(id)
      .populate("destination", "name slug")
      .populate("days.activities.place", "name slug category")
      .lean();

    if (!itinerary) {
      return NextResponse.json(
        {
          success: false,
          message: "Itinerary not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    console.error("GET itinerary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch itinerary.",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   PUT
   Used for EDIT + ACTIVATE/DEACTIVATE
================================================================ */

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid itinerary ID.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const body = await request.json();

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return NextResponse.json(
        {
          success: false,
          message: "Itinerary not found.",
        },
        { status: 404 },
      );
    }

    /*
     * IMPORTANT:
     * If this is only a status update, do not replace
     * the rest of the itinerary.
     */

    if (
      Object.prototype.hasOwnProperty.call(body, "isActive") &&
      Object.keys(body).length === 1
    ) {
      itinerary.isActive = Boolean(body.isActive);

      await itinerary.save();

      const updated = await Itinerary.findById(id)
        .populate("destination", "name slug")
        .populate("days.activities.place", "name slug category")
        .lean();

      return NextResponse.json({
        success: true,
        message: itinerary.isActive
          ? "Itinerary activated successfully."
          : "Itinerary deactivated successfully.",
        data: updated,
      });
    }

    /* ============================================================
       NORMAL EDIT
    ============================================================ */

    if (body.destination !== undefined) {
      itinerary.destination = body.destination;
    }

    if (body.title !== undefined) {
      itinerary.title = body.title;
    }

    if (body.slug !== undefined) {
      itinerary.slug = body.slug;
    }

    if (body.description !== undefined) {
      itinerary.description = body.description;
    }

    if (body.duration !== undefined) {
      itinerary.duration = body.duration;
    }

    if (body.days !== undefined) {
      itinerary.days = body.days;
    }

    if (body.estimatedBudget !== undefined) {
      itinerary.estimatedBudget = body.estimatedBudget;
    }

    if (body.coverImage !== undefined) {
      itinerary.coverImage = body.coverImage;
    }

    if (body.gallery !== undefined) {
      itinerary.gallery = body.gallery;
    }

    if (body.isFeatured !== undefined) {
      itinerary.isFeatured = Boolean(body.isFeatured);
    }

    if (body.isActive !== undefined) {
      itinerary.isActive = Boolean(body.isActive);
    }

    await itinerary.save();

    const updated = await Itinerary.findById(id)
      .populate("destination", "name slug")
      .populate("days.activities.place", "name slug category")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Itinerary updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("PUT itinerary error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "An itinerary with this slug already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update itinerary.",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   DELETE
   PERMANENT DATABASE + CLOUDINARY DELETE
================================================================ */

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid itinerary ID.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    /* ============================================================
       FIND FIRST
       We need the Cloudinary publicIds before deleting MongoDB.
    ============================================================ */

    const itinerary = await Itinerary.findById(id).lean();

    if (!itinerary) {
      return NextResponse.json(
        {
          success: false,
          message: "Itinerary not found.",
        },
        { status: 404 },
      );
    }

    /* ============================================================
       DELETE CLOUDINARY IMAGES
    ============================================================ */

    await deleteItineraryImages(itinerary);

    /* ============================================================
       DELETE MONGODB DOCUMENT
    ============================================================ */

    await Itinerary.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message:
        "Itinerary permanently deleted from the database and Cloudinary.",
    });
  } catch (error) {
    console.error("DELETE itinerary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to permanently delete itinerary.",
      },
      { status: 500 },
    );
  }
}

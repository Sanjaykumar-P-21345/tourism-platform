import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Place } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";
import cloudinary from "@/utils/cloudinary";

/* ================================================================
   HELPERS
================================================================ */

function normalizeImage(image) {
  if (!image) return null;

  if (typeof image === "string") {
    return {
      url: image.trim(),
      publicId: "",
    };
  }

  if (
    typeof image === "object" &&
    typeof image.url === "string" &&
    image.url.trim()
  ) {
    return {
      url: image.url.trim(),
      publicId: typeof image.publicId === "string" ? image.publicId.trim() : "",
    };
  }

  return null;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery.map((image) => normalizeImage(image)).filter(Boolean);
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function normalizeEntryFee(entryFee) {
  if (!entryFee || typeof entryFee !== "object") {
    return {
      adult: 0,
      child: 0,
      foreigner: 0,
    };
  }

  const adult = normalizeNumber(entryFee.adult);
  const child = normalizeNumber(entryFee.child);
  const foreigner = normalizeNumber(entryFee.foreigner);

  if (adult === null || child === null || foreigner === null) {
    return null;
  }

  if (
    (adult !== undefined && adult < 0) ||
    (child !== undefined && child < 0) ||
    (foreigner !== undefined && foreigner < 0)
  ) {
    return null;
  }

  return {
    adult: adult ?? 0,
    child: child ?? 0,
    foreigner: foreigner ?? 0,
  };
}

/* ================================================================
   DELETE CLOUDINARY IMAGE
================================================================ */

async function deleteCloudinaryImage(publicId) {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error(`Failed to delete Cloudinary image: ${publicId}`, error);
  }
}

/* ================================================================
   DELETE ALL PLACE IMAGES
================================================================ */

async function deletePlaceImages(place) {
  const publicIds = [];

  if (place?.coverImage?.publicId) {
    publicIds.push(place.coverImage.publicId);
  }

  if (Array.isArray(place?.gallery)) {
    for (const image of place.gallery) {
      if (image?.publicId) {
        publicIds.push(image.publicId);
      }
    }
  }

  /*
   * Remove duplicate public IDs in case the same image
   * accidentally appears more than once.
   */
  const uniquePublicIds = [...new Set(publicIds)];

  if (!uniquePublicIds.length) {
    return;
  }

  await Promise.all(
    uniquePublicIds.map((publicId) => deleteCloudinaryImage(publicId)),
  );
}

/* ================================================================
   GET PLACE BY ID
================================================================ */

export async function GET(request, { params }) {
  try {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid place ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const place = await Place.findById(id)
      .populate("destination", "name slug")
      .lean();

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          message: "Place not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: place,
    });
  } catch (error) {
    console.error("GET place error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch place",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   UPDATE PLACE
================================================================ */

export async function PUT(request, { params }) {
  try {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid place ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const existingPlace = await Place.findById(id);

    if (!existingPlace) {
      return NextResponse.json(
        {
          success: false,
          message: "Place not found",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    /* ------------------------------------------------------------
       ALLOWED FIELDS
    ------------------------------------------------------------ */

    const allowedFields = [
      "destination",
      "name",
      "slug",
      "category",
      "description",
      "shortDescription",
      "entryFee",
      "openingTime",
      "closingTime",
      "closedOn",
      "bestTimeToVisit",
      "visitDuration",
      "address",
      "latitude",
      "longitude",
      "coverImage",
      "gallery",
      "isFeatured",
      "isActive",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    /* ------------------------------------------------------------
       DESTINATION
    ------------------------------------------------------------ */

    if (updateData.destination !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(updateData.destination)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid destination ID",
          },
          { status: 400 },
        );
      }

      const destinationExists = await Destination.exists({
        _id: updateData.destination,
      });

      if (!destinationExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Destination not found",
          },
          { status: 404 },
        );
      }
    }

    /* ------------------------------------------------------------
       NAME
    ------------------------------------------------------------ */

    if (updateData.name !== undefined) {
      updateData.name = String(updateData.name).trim();

      if (!updateData.name) {
        return NextResponse.json(
          {
            success: false,
            message: "Place name is required",
          },
          { status: 400 },
        );
      }
    }

    /* ------------------------------------------------------------
       SLUG
    ------------------------------------------------------------ */

    if (updateData.slug !== undefined) {
      updateData.slug = String(updateData.slug).trim().toLowerCase();

      if (!updateData.slug) {
        return NextResponse.json(
          {
            success: false,
            message: "Place slug is required",
          },
          { status: 400 },
        );
      }

      const duplicate = await Place.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Place slug already exists",
          },
          { status: 409 },
        );
      }
    }

    /* ------------------------------------------------------------
       DESCRIPTION
    ------------------------------------------------------------ */

    if (updateData.description !== undefined) {
      updateData.description = String(updateData.description).trim();

      if (!updateData.description) {
        return NextResponse.json(
          {
            success: false,
            message: "Place description is required",
          },
          { status: 400 },
        );
      }
    }

    /* ------------------------------------------------------------
       STRING FIELDS
    ------------------------------------------------------------ */

    const stringFields = [
      "shortDescription",
      "openingTime",
      "closingTime",
      "closedOn",
      "bestTimeToVisit",
      "visitDuration",
      "address",
    ];

    for (const field of stringFields) {
      if (updateData[field] !== undefined) {
        updateData[field] =
          updateData[field] === null ? "" : String(updateData[field]).trim();
      }
    }

    /* ------------------------------------------------------------
       ENTRY FEE
    ------------------------------------------------------------ */

    if (updateData.entryFee !== undefined) {
      const normalizedEntryFee = normalizeEntryFee(updateData.entryFee);

      if (!normalizedEntryFee) {
        return NextResponse.json(
          {
            success: false,
            message: "Entry fee values must be valid non-negative numbers",
          },
          { status: 400 },
        );
      }

      updateData.entryFee = normalizedEntryFee;
    }

    /* ------------------------------------------------------------
       COVER IMAGE
    ------------------------------------------------------------ */

    if (updateData.coverImage !== undefined) {
      const normalizedCoverImage = normalizeImage(updateData.coverImage);

      if (!normalizedCoverImage?.url) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid cover image is required",
          },
          { status: 400 },
        );
      }

      /*
       * Because the database ImageSchema requires a publicId,
       * prevent replacing the image with a legacy URL-only value.
       */
      if (!normalizedCoverImage.publicId) {
        return NextResponse.json(
          {
            success: false,
            message: "Cover image must contain a valid Cloudinary publicId",
          },
          { status: 400 },
        );
      }

      updateData.coverImage = normalizedCoverImage;
    }

    /* ------------------------------------------------------------
       GALLERY
    ------------------------------------------------------------ */

    if (updateData.gallery !== undefined) {
      updateData.gallery = normalizeGallery(updateData.gallery);

      /*
       * A new/updated gallery should contain valid Cloudinary
       * images. URL-only legacy images are not accepted here.
       */
      const invalidGalleryImage = updateData.gallery.some(
        (image) => !image.publicId,
      );

      if (invalidGalleryImage) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Every gallery image must contain a valid Cloudinary publicId",
          },
          { status: 400 },
        );
      }
    }

    /* ------------------------------------------------------------
       LATITUDE
    ------------------------------------------------------------ */

    if (updateData.latitude !== undefined) {
      const latitude = normalizeNumber(updateData.latitude);

      if (latitude === null) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid latitude",
          },
          { status: 400 },
        );
      }

      updateData.latitude = latitude;
    }

    /* ------------------------------------------------------------
       LONGITUDE
    ------------------------------------------------------------ */

    if (updateData.longitude !== undefined) {
      const longitude = normalizeNumber(updateData.longitude);

      if (longitude === null) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid longitude",
          },
          { status: 400 },
        );
      }

      updateData.longitude = longitude;
    }

    /* ------------------------------------------------------------
       BOOLEAN FIELDS
    ------------------------------------------------------------ */

    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(updateData.isFeatured);
    }

    if (updateData.isActive !== undefined) {
      updateData.isActive = Boolean(updateData.isActive);
    }

    /* ------------------------------------------------------------
       UPDATE
    ------------------------------------------------------------ */

    const place = await Place.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("destination", "name slug");

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          message: "Place not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Place updated successfully",
      data: place,
    });
  } catch (error) {
    console.error("PUT place error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Place slug already exists",
        },
        { status: 409 },
      );
    }

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: Object.values(error.errors)
            .map((item) => item.message)
            .join(", "),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update place",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   ACTIVATE / DEACTIVATE PLACE
================================================================ */

export async function PATCH(request, { params }) {
  try {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid place ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isActive must be a boolean value",
        },
        { status: 400 },
      );
    }

    const place = await Place.findByIdAndUpdate(
      id,
      {
        isActive: body.isActive,
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("destination", "name slug");

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          message: "Place not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: body.isActive
        ? "Place activated successfully"
        : "Place deactivated successfully",
      data: place,
    });
  } catch (error) {
    console.error("PATCH place status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update place status",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   PERMANENT DELETE PLACE
================================================================ */

export async function DELETE(request, { params }) {
  try {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid place ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    /*
     * Fetch the document first so we have the Cloudinary
     * public IDs before deleting the MongoDB record.
     */
    const place = await Place.findById(id).lean();

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          message: "Place not found",
        },
        { status: 404 },
      );
    }

    /*
     * Delete the MongoDB document permanently.
     */
    await Place.deleteOne({
      _id: id,
    });

    /*
     * Delete associated Cloudinary images.
     *
     * Cloudinary cleanup is intentionally performed after the
     * database deletion. If an individual Cloudinary deletion
     * fails, the database record is still permanently removed.
     */
    await deletePlaceImages(place);

    return NextResponse.json({
      success: true,
      message: "Place permanently deleted successfully",
    });
  } catch (error) {
    console.error("DELETE place error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to permanently delete place",
      },
      { status: 500 },
    );
  }
}
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";
import cloudinary from "@/utils/cloudinary";

/*
 * =========================================================
 * GET SINGLE DESTINATION
 * =========================================================
 */

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

    /*
     * -----------------------------------------------
     * VALIDATE ID
     * -----------------------------------------------
     */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const destination = await Destination.findById(id).lean();

    if (!destination) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: destination,
    });
  } catch (error) {
    console.error("GET destination error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch destination",
      },
      { status: 500 },
    );
  }
}

/*
 * =========================================================
 * UPDATE DESTINATION
 * =========================================================
 */

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

    /*
     * -----------------------------------------------
     * VALIDATE ID
     * -----------------------------------------------
     */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const body = await request.json();

    /*
     * -----------------------------------------------
     * ALLOWED FIELDS
     * -----------------------------------------------
     */

    const allowedFields = [
      "name",
      "slug",
      "type",
      "country",
      "state",
      "description",
      "shortDescription",
      "bestTimeToVisit",
      "language",
      "currency",
      "coverImage",
      "gallery",
      "latitude",
      "longitude",
      "address",
      "isFeatured",
      "isActive",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    /*
     * -----------------------------------------------
     * REQUIRED FIELD VALIDATION
     * -----------------------------------------------
     */

    if (updateData.name !== undefined && !String(updateData.name).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination name cannot be empty",
        },
        { status: 400 },
      );
    }

    if (
      updateData.country !== undefined &&
      !String(updateData.country).trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Country cannot be empty",
        },
        { status: 400 },
      );
    }

    if (
      updateData.description !== undefined &&
      !String(updateData.description).trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Description cannot be empty",
        },
        { status: 400 },
      );
    }

    /*
     * -----------------------------------------------
     * NORMALIZE STRING FIELDS
     * -----------------------------------------------
     */

    if (updateData.name !== undefined) {
      updateData.name = String(updateData.name).trim();
    }

    if (updateData.country !== undefined) {
      updateData.country = String(updateData.country).trim();
    }

    if (updateData.state !== undefined) {
      updateData.state = String(updateData.state || "").trim();
    }

    if (updateData.description !== undefined) {
      updateData.description = String(updateData.description).trim();
    }

    if (updateData.shortDescription !== undefined) {
      updateData.shortDescription = String(
        updateData.shortDescription || "",
      ).trim();
    }

    if (updateData.bestTimeToVisit !== undefined) {
      updateData.bestTimeToVisit = String(
        updateData.bestTimeToVisit || "",
      ).trim();
    }

    if (updateData.language !== undefined) {
      updateData.language = String(updateData.language || "").trim();
    }

    if (updateData.currency !== undefined) {
      updateData.currency = String(updateData.currency || "").trim();
    }

    if (updateData.address !== undefined) {
      updateData.address = String(updateData.address || "").trim();
    }

    /*
     * -----------------------------------------------
     * NORMALIZE SLUG
     * -----------------------------------------------
     */

    if (updateData.slug !== undefined) {
      updateData.slug = String(updateData.slug).trim().toLowerCase();

      if (!updateData.slug) {
        return NextResponse.json(
          {
            success: false,
            message: "Slug cannot be empty",
          },
          { status: 400 },
        );
      }

      const duplicate = await Destination.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Destination slug already exists",
          },
          { status: 409 },
        );
      }
    }

    /*
     * -----------------------------------------------
     * COVER IMAGE
     * -----------------------------------------------
     */

    if (updateData.coverImage !== undefined) {
      const image = updateData.coverImage;

      if (
        !image ||
        typeof image !== "object" ||
        !image.url ||
        !image.publicId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cover image must contain a valid Cloudinary URL and public ID",
          },
          { status: 400 },
        );
      }

      updateData.coverImage = {
        url: String(image.url).trim(),
        publicId: String(image.publicId).trim(),
      };
    }

    /*
     * -----------------------------------------------
     * GALLERY
     * -----------------------------------------------
     */

    if (updateData.gallery !== undefined) {
      if (!Array.isArray(updateData.gallery)) {
        return NextResponse.json(
          {
            success: false,
            message: "Gallery must be an array",
          },
          { status: 400 },
        );
      }

      updateData.gallery = updateData.gallery
        .filter(
          (image) =>
            image && typeof image === "object" && image.url && image.publicId,
        )
        .map((image) => ({
          url: String(image.url).trim(),
          publicId: String(image.publicId).trim(),
        }));
    }

    /*
     * -----------------------------------------------
     * COORDINATES
     * -----------------------------------------------
     */

    if (updateData.latitude !== undefined) {
      if (updateData.latitude === "" || updateData.latitude === null) {
        updateData.latitude = undefined;
      } else {
        const latitude = Number(updateData.latitude);

        if (Number.isNaN(latitude)) {
          return NextResponse.json(
            {
              success: false,
              message: "Latitude must be a valid number",
            },
            { status: 400 },
          );
        }

        updateData.latitude = latitude;
      }
    }

    if (updateData.longitude !== undefined) {
      if (updateData.longitude === "" || updateData.longitude === null) {
        updateData.longitude = undefined;
      } else {
        const longitude = Number(updateData.longitude);

        if (Number.isNaN(longitude)) {
          return NextResponse.json(
            {
              success: false,
              message: "Longitude must be a valid number",
            },
            { status: 400 },
          );
        }

        updateData.longitude = longitude;
      }
    }

    /*
     * -----------------------------------------------
     * BOOLEAN FIELDS
     * -----------------------------------------------
     */

    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(updateData.isFeatured);
    }

    if (updateData.isActive !== undefined) {
      updateData.isActive = Boolean(updateData.isActive);
    }

    /*
     * -----------------------------------------------
     * UPDATE
     * -----------------------------------------------
     */

    const destination = await Destination.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!destination) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Destination updated successfully",
      data: destination,
    });
  } catch (error) {
    console.error("PUT destination error:", error);

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: Object.values(error.errors).map((item) => item.message),
        },
        { status: 400 },
      );
    }

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A destination with this slug already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update destination",
      },
      { status: 500 },
    );
  }
}

/*
 * =========================================================
 * PERMANENT DELETE DESTINATION
 * =========================================================
 *
 * Deletes:
 *
 * 1. Destination MongoDB document
 * 2. Cloudinary cover image
 * 3. Cloudinary gallery images
 *
 * IMPORTANT:
 * Every image must have a publicId for Cloudinary deletion.
 */

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

    /*
     * -----------------------------------------------
     * VALIDATE ID
     * -----------------------------------------------
     */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    /*
     * -----------------------------------------------
     * FIND DESTINATION FIRST
     * -----------------------------------------------
     *
     * We need the image public IDs before deleting
     * the MongoDB document.
     */

    const destination = await Destination.findById(id).lean();

    if (!destination) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination not found",
        },
        { status: 404 },
      );
    }

    /*
     * -----------------------------------------------
     * COLLECT CLOUDINARY PUBLIC IDS
     * -----------------------------------------------
     */

    const publicIds = [
      destination.coverImage?.publicId,

      ...(Array.isArray(destination.gallery)
        ? destination.gallery.map((image) => image?.publicId)
        : []),
    ].filter(Boolean);

    /*
     * Remove duplicates just in case.
     */

    const uniquePublicIds = [...new Set(publicIds)];

    /*
     * -----------------------------------------------
     * DELETE MONGODB DOCUMENT
     * -----------------------------------------------
     *
     * This is a REAL permanent delete.
     */

    const deletedDestination = await Destination.findByIdAndDelete(id);

    if (!deletedDestination) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination could not be deleted",
        },
        { status: 404 },
      );
    }

    /*
     * -----------------------------------------------
     * DELETE CLOUDINARY IMAGES
     * -----------------------------------------------
     *
     * MongoDB has already been deleted.
     *
     * We use allSettled so that if one image fails,
     * the remaining images are still attempted.
     */

    const cloudinaryResults = await Promise.allSettled(
      uniquePublicIds.map(async (publicId) => {
        try {
          const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });

          return {
            publicId,
            result: result?.result || null,
          };
        } catch (error) {
          throw {
            publicId,
            message: error?.message || "Cloudinary deletion failed",
          };
        }
      }),
    );

    /*
     * -----------------------------------------------
     * PROCESS CLOUDINARY RESULTS
     * -----------------------------------------------
     */

    const cloudinaryDeleted = [];
    const cloudinaryFailed = [];

    for (const result of cloudinaryResults) {
      if (result.status === "fulfilled") {
        /*
         * Cloudinary returns:
         *
         * result: "ok"
         *
         * or:
         *
         * result: "not found"
         *
         * "not found" is treated as already cleaned.
         */

        cloudinaryDeleted.push({
          publicId: result.value.publicId,
          result: result.value.result,
        });
      } else {
        cloudinaryFailed.push({
          publicId: result.reason?.publicId || null,
          message: result.reason?.message || "Cloudinary deletion failed",
        });
      }
    }

    /*
     * -----------------------------------------------
     * RESPONSE
     * -----------------------------------------------
     */

    if (cloudinaryFailed.length > 0) {
      return NextResponse.json({
        success: true,
        message:
          "Destination deleted, but some Cloudinary images could not be removed.",
        data: {
          deletedDestinationId: id,
          cloudinaryDeleted,
          cloudinaryFailed,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "Destination and associated Cloudinary images deleted successfully",
      data: {
        deletedDestinationId: id,
        cloudinaryDeleted,
        cloudinaryFailed: [],
      },
    });
  } catch (error) {
    console.error("DELETE destination error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete destination",
      },
      { status: 500 },
    );
  }
}
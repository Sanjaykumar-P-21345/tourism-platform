import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/utils/mongodb";
import { Destination, Place } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

function normalizeImage(image) {
  if (!image) return null;

  if (typeof image === "string") {
    return {
      url: image,
      publicId: "",
    };
  }

  if (typeof image === "object" && image.url) {
    return {
      url: image.url,
      publicId: image.publicId || "",
    };
  }

  return null;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) return [];

  return gallery
    .map((image) => normalizeImage(image))
    .filter(Boolean);
}

export async function GET(request, { params }) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid place ID",
        },
        { status: 400 }
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
        { status: 404 }
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
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid place ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

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

    if (updateData.destination) {
      if (
        !mongoose.Types.ObjectId.isValid(
          updateData.destination
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid destination ID",
          },
          { status: 400 }
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
          { status: 404 }
        );
      }
    }

    if (updateData.name !== undefined) {
      updateData.name = updateData.name.trim();
    }

    if (updateData.slug !== undefined) {
      updateData.slug = updateData.slug
        .trim()
        .toLowerCase();

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
          { status: 409 }
        );
      }
    }

    if (updateData.description !== undefined) {
      updateData.description =
        updateData.description.trim();
    }

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
          updateData[field]?.trim() || "";
      }
    }

    if (updateData.coverImage !== undefined) {
      const normalizedCoverImage = normalizeImage(
        updateData.coverImage
      );

      if (!normalizedCoverImage) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid cover image is required",
          },
          { status: 400 }
        );
      }

      updateData.coverImage = normalizedCoverImage;
    }

    if (updateData.gallery !== undefined) {
      updateData.gallery = normalizeGallery(
        updateData.gallery
      );
    }

    if (
      updateData.latitude !== undefined &&
      updateData.latitude !== null &&
      updateData.latitude !== ""
    ) {
      updateData.latitude = Number(updateData.latitude);
    }

    if (
      updateData.longitude !== undefined &&
      updateData.longitude !== null &&
      updateData.longitude !== ""
    ) {
      updateData.longitude = Number(updateData.longitude);
    }

    const place = await Place.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("destination", "name slug");

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          message: "Place not found",
        },
        { status: 404 }
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
        { status: 409 }
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
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update place",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid place ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const place = await Place.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          message: "Place not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Place deactivated successfully",
      data: place,
    });
  } catch (error) {
    console.error("DELETE place error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate place",
      },
      { status: 500 }
    );
  }
}
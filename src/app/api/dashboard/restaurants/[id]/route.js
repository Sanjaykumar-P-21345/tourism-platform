import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/utils/mongodb";
import { Destination, Restaurant } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

function normalizeImage(image) {
  if (!image) return null;

  if (typeof image === "string") {
    const url = image.trim();

    if (!url) return null;

    return {
      url,
      publicId: "",
    };
  }

  if (typeof image === "object" && image.url) {
    return {
      url: String(image.url).trim(),
      publicId: String(image.publicId || "").trim(),
    };
  }

  return null;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) return [];

  return gallery.map(normalizeImage).filter(Boolean);
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
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const restaurant = await Restaurant.findById(id)
      .populate("destination", "name slug")
      .lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("GET restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch restaurant",
      },
      { status: 500 },
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
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const body = await request.json();

    const allowedFields = [
      "destination",
      "name",
      "slug",
      "description",
      "cuisines",
      "foodType",
      "priceRange",
      "popularDishes",
      "openingTime",
      "closingTime",
      "address",
      "latitude",
      "longitude",
      "contactPhone",
      "website",
      "coverImage",
      "gallery",
      "rating",
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

    if (updateData.name !== undefined) {
      updateData.name = updateData.name.trim();
    }

    if (updateData.slug !== undefined) {
      updateData.slug = updateData.slug.trim().toLowerCase();

      const duplicate = await Restaurant.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Restaurant slug already exists",
          },
          { status: 409 },
        );
      }
    }

    if (updateData.description !== undefined) {
      updateData.description = updateData.description.trim();
    }

    if (updateData.cuisines !== undefined) {
      updateData.cuisines = Array.isArray(updateData.cuisines)
        ? updateData.cuisines.filter(Boolean).map((item) => String(item).trim())
        : [];
    }

    if (updateData.popularDishes !== undefined) {
      updateData.popularDishes = Array.isArray(updateData.popularDishes)
        ? updateData.popularDishes
            .filter(Boolean)
            .map((item) => String(item).trim())
        : [];
    }

    if (updateData.coverImage !== undefined) {
      const image = normalizeImage(updateData.coverImage);

      if (!image?.url) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid cover image is required",
          },
          { status: 400 },
        );
      }

      updateData.coverImage = image;
    }

    if (updateData.gallery !== undefined) {
      updateData.gallery = normalizeGallery(updateData.gallery);
    }

    if (updateData.rating !== undefined) {
      const rating = Number(updateData.rating);

      if (Number.isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json(
          {
            success: false,
            message: "Rating must be between 0 and 5",
          },
          { status: 400 },
        );
      }

      updateData.rating = rating;
    }

    if (updateData.latitude === "") {
      updateData.latitude = undefined;
    } else if (updateData.latitude !== undefined) {
      updateData.latitude = Number(updateData.latitude);
    }

    if (updateData.longitude === "") {
      updateData.longitude = undefined;
    } else if (updateData.longitude !== undefined) {
      updateData.longitude = Number(updateData.longitude);
    }

    const restaurant = await Restaurant.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error("PUT restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update restaurant",
      },
      { status: 500 },
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
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid restaurant ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Restaurant deactivated successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error("DELETE restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate restaurant",
      },
      { status: 500 },
    );
  }
}

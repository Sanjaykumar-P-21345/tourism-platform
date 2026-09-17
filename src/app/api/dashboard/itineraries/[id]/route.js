import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Itinerary, Place } from "@/utils/schema";
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

  return gallery.map(normalizeImage).filter(Boolean);
}

async function validateDays(days) {
  if (!Array.isArray(days)) {
    return {
      valid: false,
      message: "Days must be an array.",
    };
  }

  for (const day of days) {
    if (!day.title?.trim()) {
      return {
        valid: false,
        message: "Every day must have a title.",
      };
    }

    if (!Array.isArray(day.activities)) {
      continue;
    }

    for (const activity of day.activities) {
      if (!activity.title?.trim()) {
        return {
          valid: false,
          message: "Every activity must have a title.",
        };
      }

      if (activity.place) {
        if (!mongoose.Types.ObjectId.isValid(activity.place)) {
          return {
            valid: false,
            message: `Invalid place ID: ${activity.place}`,
          };
        }

        const placeExists = await Place.exists({
          _id: activity.place,
        });

        if (!placeExists) {
          return {
            valid: false,
            message: `Place not found: ${activity.place}`,
          };
        }
      }
    }
  }

  return {
    valid: true,
  };
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
          message: "Invalid itinerary ID.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const body = await request.json();

    const allowedFields = [
      "destination",
      "title",
      "slug",
      "duration",
      "description",
      "days",
      "estimatedBudget",
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

    if (updateData.destination !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(updateData.destination)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid destination ID.",
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
            message: "Destination not found.",
          },
          { status: 404 },
        );
      }
    }

    if (updateData.title !== undefined) {
      if (!updateData.title?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Title cannot be empty.",
          },
          { status: 400 },
        );
      }

      updateData.title = updateData.title.trim();
    }

    if (updateData.slug !== undefined) {
      if (!updateData.slug?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Slug cannot be empty.",
          },
          { status: 400 },
        );
      }

      updateData.slug = updateData.slug.trim().toLowerCase();

      const duplicate = await Itinerary.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Itinerary slug already exists.",
          },
          { status: 409 },
        );
      }
    }

    if (updateData.duration) {
      const days = Number(updateData.duration.days);

      const nights = Number(updateData.duration.nights);

      if (!Number.isInteger(days) || days < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Duration days must be at least 1.",
          },
          { status: 400 },
        );
      }

      if (!Number.isInteger(nights) || nights < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Duration nights must be 0 or greater.",
          },
          { status: 400 },
        );
      }

      updateData.duration = {
        days,
        nights,
      };
    }

    if (updateData.description !== undefined) {
      updateData.description = updateData.description?.trim() || "";
    }

    if (updateData.days !== undefined) {
      const daysValidation = await validateDays(updateData.days);

      if (!daysValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            message: daysValidation.message,
          },
          { status: 400 },
        );
      }

      updateData.days = updateData.days.map((day, dayIndex) => ({
        dayNumber: Number(day.dayNumber) || dayIndex + 1,

        title: day.title.trim(),

        activities: Array.isArray(day.activities)
          ? day.activities.map((activity) => {
              const item = {
                title: activity.title.trim(),
              };

              if (activity.time?.trim()) {
                item.time = activity.time.trim();
              }

              if (activity.description?.trim()) {
                item.description = activity.description.trim();
              }

              if (activity.place) {
                item.place = activity.place;
              }

              return item;
            })
          : [],
      }));
    }

    if (updateData.coverImage !== undefined) {
      updateData.coverImage = normalizeImage(updateData.coverImage);
    }

    if (updateData.gallery !== undefined) {
      updateData.gallery = normalizeGallery(updateData.gallery);
    }

    const itinerary = await Itinerary.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

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
      message: "Itinerary updated successfully.",
      data: itinerary,
    });
  } catch (error) {
    console.error("PUT itinerary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update itinerary.",
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
          message: "Invalid itinerary ID.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const itinerary = await Itinerary.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      },
    );

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
      message: "Itinerary deactivated successfully.",
      data: itinerary,
    });
  } catch (error) {
    console.error("DELETE itinerary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate itinerary.",
      },
      { status: 500 },
    );
  }
}
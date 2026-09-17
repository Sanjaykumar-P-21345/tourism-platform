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

export async function GET(request) {
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

    await connectDB();

    const itineraries = await Itinerary.find({})
      .populate("destination", "name slug")
      .populate("days.activities.place", "name slug category")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: itineraries,
    });
  } catch (error) {
    console.error("GET itineraries error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch itineraries",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
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

    await connectDB();

    const body = await request.json();

    const {
      destination,
      title,
      slug,
      duration,
      description,
      days,
      estimatedBudget,
      coverImage,
      gallery,
      isFeatured,
      isActive,
    } = body;

    if (
      !destination ||
      !title?.trim() ||
      !slug?.trim() ||
      !duration ||
      !Array.isArray(days)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination, title, slug, duration and days are required.",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(destination)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination ID.",
        },
        { status: 400 },
      );
    }

    const destinationExists = await Destination.exists({
      _id: destination,
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

    const daysCount = Number(duration.days);
    const nightsCount = Number(duration.nights);

    if (!Number.isInteger(daysCount) || daysCount < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration days must be at least 1.",
        },
        { status: 400 },
      );
    }

    if (!Number.isInteger(nightsCount) || nightsCount < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration nights must be 0 or greater.",
        },
        { status: 400 },
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();

    const existingItinerary = await Itinerary.findOne({
      slug: normalizedSlug,
    });

    if (existingItinerary) {
      return NextResponse.json(
        {
          success: false,
          message: "Itinerary slug already exists.",
        },
        { status: 409 },
      );
    }

    const daysValidation = await validateDays(days);

    if (!daysValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: daysValidation.message,
        },
        { status: 400 },
      );
    }

    const normalizedCoverImage = normalizeImage(coverImage);

    const normalizedGallery = normalizeGallery(gallery);

    const itinerary = await Itinerary.create({
      destination,

      title: title.trim(),

      slug: normalizedSlug,

      duration: {
        days: daysCount,
        nights: nightsCount,
      },

      description: description?.trim() || "",

      days: days.map((day, dayIndex) => ({
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
      })),

      estimatedBudget,

      coverImage: normalizedCoverImage,

      gallery: normalizedGallery,

      isFeatured: Boolean(isFeatured),

      isActive: isActive ?? true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Itinerary created successfully.",
        data: itinerary,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST itinerary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create itinerary.",
      },
      { status: 500 },
    );
  }
}
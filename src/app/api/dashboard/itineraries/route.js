import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Itinerary, Place } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

/* ================================================================
   IMAGE HELPERS
================================================================ */

function normalizeImage(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "object" && image.url && image.publicId) {
    return {
      url: image.url.trim(),
      publicId: image.publicId.trim(),
    };
  }

  return null;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery.map(normalizeImage).filter(Boolean);
}

/* ================================================================
   DAYS VALIDATION
================================================================ */

async function validateDays(days, destinationId = null) {
  if (!Array.isArray(days)) {
    return {
      valid: false,
      message: "Days must be an array.",
    };
  }

  for (const [dayIndex, day] of days.entries()) {
    if (!day?.title?.trim()) {
      return {
        valid: false,
        message: `Day ${dayIndex + 1} must have a title.`,
      };
    }

    if (!Array.isArray(day.activities)) {
      continue;
    }

    for (const [activityIndex, activity] of day.activities.entries()) {
      if (!activity?.title?.trim()) {
        return {
          valid: false,
          message: `Activity ${activityIndex + 1} in Day ${
            dayIndex + 1
          } must have a title.`,
        };
      }

      if (activity.place) {
        if (!mongoose.Types.ObjectId.isValid(activity.place)) {
          return {
            valid: false,
            message: `Invalid place ID: ${activity.place}`,
          };
        }

        const place = await Place.findById(activity.place)
          .select("destination")
          .lean();

        if (!place) {
          return {
            valid: false,
            message: `Place not found: ${activity.place}`,
          };
        }

        /*
         * Make sure selected places belong to the
         * same destination as the itinerary.
         */
        if (
          destinationId &&
          place.destination &&
          place.destination.toString() !== destinationId.toString()
        ) {
          return {
            valid: false,
            message: `Selected place does not belong to the itinerary destination.`,
          };
        }
      }
    }
  }

  return {
    valid: true,
  };
}

/* ================================================================
   NORMALIZE DAYS
================================================================ */

function normalizeDays(days) {
  return days.map((day, dayIndex) => ({
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

/* ================================================================
   GET ALL ITINERARIES
================================================================ */

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
      .sort({
        createdAt: -1,
      })
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
        message: "Failed to fetch itineraries.",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   CREATE ITINERARY
================================================================ */

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

    /* ------------------------------------------------------------
       REQUIRED FIELDS
    ------------------------------------------------------------ */

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

    /* ------------------------------------------------------------
       DESTINATION
    ------------------------------------------------------------ */

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

    /* ------------------------------------------------------------
       DURATION
    ------------------------------------------------------------ */

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

    /* ------------------------------------------------------------
       SLUG
    ------------------------------------------------------------ */

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

    /* ------------------------------------------------------------
       DAYS
    ------------------------------------------------------------ */

    const daysValidation = await validateDays(days, destination);

    if (!daysValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: daysValidation.message,
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       IMAGES
    ------------------------------------------------------------ */

    const normalizedCoverImage = normalizeImage(coverImage);

    const normalizedGallery = normalizeGallery(gallery);

    /* ------------------------------------------------------------
       BUDGET
    ------------------------------------------------------------ */

    let normalizedBudget = undefined;

    if (estimatedBudget) {
      const min = Number(estimatedBudget.min);

      const max = Number(estimatedBudget.max);

      if (Number.isFinite(min) && Number.isFinite(max)) {
        if (min < 0 || max < 0) {
          return NextResponse.json(
            {
              success: false,
              message: "Estimated budget cannot be negative.",
            },
            { status: 400 },
          );
        }

        if (max < min) {
          return NextResponse.json(
            {
              success: false,
              message: "Maximum budget cannot be less than minimum budget.",
            },
            { status: 400 },
          );
        }

        normalizedBudget = {
          min,
          max,
        };
      }
    }

    /* ------------------------------------------------------------
       CREATE
    ------------------------------------------------------------ */

    const itinerary = await Itinerary.create({
      destination,

      title: title.trim(),

      slug: normalizedSlug,

      duration: {
        days: daysCount,
        nights: nightsCount,
      },

      description: description?.trim() || "",

      days: normalizeDays(days),

      estimatedBudget: normalizedBudget,

      coverImage: normalizedCoverImage,

      gallery: normalizedGallery,

      isFeatured: Boolean(isFeatured),

      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    /* ------------------------------------------------------------
       RETURN POPULATED DOCUMENT
    ------------------------------------------------------------ */

    const populatedItinerary = await Itinerary.findById(itinerary._id)
      .populate("destination", "name slug")
      .populate("days.activities.place", "name slug category")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Itinerary created successfully.",
        data: populatedItinerary,
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

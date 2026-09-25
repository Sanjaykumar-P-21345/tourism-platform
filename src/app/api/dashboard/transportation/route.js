import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { requireAdmin } from "@/utils/adminAuth";
import { Transportation, Destination } from "@/utils/schema";

const TRANSPORTATION_TYPES = [
  "flight",
  "train",
  "bus",
  "taxi",
  "car-rental",
  "bike-rental",
];

function cleanString(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value).trim();
}

function normalizeImage(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    const url = image.trim();

    if (!url) {
      return null;
    }

    return {
      url,
      publicId: "",
    };
  }

  if (typeof image === "object" && image.url) {
    const url = String(image.url).trim();

    if (!url) {
      return null;
    }

    return {
      url,
      publicId: image.publicId ? String(image.publicId).trim() : "",
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

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : NaN;
}

function parseBoolean(value, defaultValue = true) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
}

function validateCost(min, max) {
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return "Estimated cost must contain valid numbers";
  }

  if (min !== undefined && min < 0) {
    return "Minimum estimated cost cannot be negative";
  }

  if (max !== undefined && max < 0) {
    return "Maximum estimated cost cannot be negative";
  }

  if (min !== undefined && max !== undefined && min > max) {
    return "Minimum cost cannot be greater than maximum cost";
  }

  return null;
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

    const transportation = await Transportation.find({})
      .populate("destination", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: transportation,
    });
  } catch (error) {
    console.error("Transportation GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transportation",
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

    const destination = cleanString(body.destination);

    const type = cleanString(body.type);

    const providerName = cleanString(body.providerName);

    const from = cleanString(body.from);

    const to = cleanString(body.to);

    if (!destination || !type || !providerName || !from || !to) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination, type, provider name, from and to are required",
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(destination)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination",
        },
        { status: 400 },
      );
    }

    if (!TRANSPORTATION_TYPES.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid transportation type",
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
          message: "Selected destination was not found",
        },
        { status: 400 },
      );
    }

    const estimatedMin = parseOptionalNumber(body.estimatedCost?.min);

    const estimatedMax = parseOptionalNumber(body.estimatedCost?.max);

    const costError = validateCost(estimatedMin, estimatedMax);

    if (costError) {
      return NextResponse.json(
        {
          success: false,
          message: costError,
        },
        { status: 400 },
      );
    }

    const coverImage = normalizeImage(body.coverImage);

    const gallery = normalizeGallery(body.gallery);

    const transportation = await Transportation.create({
      destination,
      type,
      providerName,
      from,
      to,

      description: cleanString(body.description),

      estimatedCost: {
        ...(estimatedMin !== undefined ? { min: estimatedMin } : {}),
        ...(estimatedMax !== undefined ? { max: estimatedMax } : {}),
      },

      estimatedDuration: cleanString(body.estimatedDuration),

      schedule: cleanString(body.schedule),

      bookingUrl: cleanString(body.bookingUrl),

      contactPhone: cleanString(body.contactPhone),

      coverImage,
      gallery,

      isActive: parseBoolean(body.isActive, true),
    });

    const populated = await Transportation.findById(transportation._id)
      .populate("destination", "name slug")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Transportation created successfully",
        data: populated,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Transportation POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create transportation",
      },
      { status: 500 },
    );
  }
}

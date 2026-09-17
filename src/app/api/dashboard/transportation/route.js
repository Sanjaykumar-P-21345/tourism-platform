import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/utils/mongodb";
import { Destination, Transportation } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

function normalizeImage(image) {
  if (!image) return null;

  if (typeof image === "string") {
    return {
      url: image.trim(),
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

  return gallery.map(normalizeImage).filter((image) => image?.url);
}

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
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
    console.error("GET transportation error:", error);

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

    const {
      destination,
      type,
      providerName,
      from,
      to,
      description,
      estimatedCost,
      estimatedDuration,
      schedule,
      bookingUrl,
      contactPhone,
      coverImage,
      gallery,
      isActive,
    } = body;

    if (!destination || !type || !providerName || !from || !to) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Destination, transportation type, provider name, from and to are required",
        },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "flight",
      "train",
      "bus",
      "taxi",
      "car-rental",
      "bike-rental",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid transportation type. Allowed values: ${allowedTypes.join(
            ", ",
          )}`,
        },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(destination)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination ID",
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
          message: "Destination not found",
        },
        { status: 404 },
      );
    }

    const normalizedCoverImage = normalizeImage(coverImage);
    const normalizedGallery = normalizeGallery(gallery);

    const minCost = normalizeNumber(estimatedCost?.min);
    const maxCost = normalizeNumber(estimatedCost?.max);

    if (minCost !== undefined && maxCost !== undefined && minCost > maxCost) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum estimated cost cannot be greater than maximum cost",
        },
        { status: 400 },
      );
    }

    const transportation = await Transportation.create({
      destination,
      type,
      providerName: providerName.trim(),
      from: from.trim(),
      to: to.trim(),
      description: description?.trim() || undefined,

      estimatedCost: {
        min: minCost,
        max: maxCost,
      },

      estimatedDuration: estimatedDuration?.trim() || undefined,
      schedule: schedule?.trim() || undefined,
      bookingUrl: bookingUrl?.trim() || undefined,
      contactPhone: contactPhone?.trim() || undefined,

      coverImage: normalizedCoverImage,
      gallery: normalizedGallery,

      isActive: isActive ?? true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transportation created successfully",
        data: transportation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST transportation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create transportation",
      },
      { status: 500 },
    );
  }
}
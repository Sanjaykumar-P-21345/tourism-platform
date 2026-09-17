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

export async function GET(request) {
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

    await connectDB();

    const places = await Place.find({})
      .populate("destination", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.error("GET places error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch places",
      },
      { status: 500 }
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
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      destination,
      name,
      slug,
      category,
      description,
      shortDescription,
      entryFee,
      openingTime,
      closingTime,
      closedOn,
      bestTimeToVisit,
      visitDuration,
      address,
      latitude,
      longitude,
      coverImage,
      gallery,
      isFeatured,
      isActive,
    } = body;

    if (
      !destination ||
      !name ||
      !slug ||
      !category ||
      !description ||
      !coverImage
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Destination, name, slug, category, description and cover image are required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(destination)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination ID",
        },
        { status: 400 }
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
        { status: 404 }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();

    const existingPlace = await Place.findOne({
      slug: normalizedSlug,
    });

    if (existingPlace) {
      return NextResponse.json(
        {
          success: false,
          message: "Place slug already exists",
        },
        { status: 409 }
      );
    }

    const normalizedCoverImage = normalizeImage(coverImage);

    if (!normalizedCoverImage) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid cover image is required",
        },
        { status: 400 }
      );
    }

    const normalizedGallery = normalizeGallery(gallery);

    const place = await Place.create({
      destination,
      name: name.trim(),
      slug: normalizedSlug,
      category,
      description: description.trim(),
      shortDescription: shortDescription?.trim() || "",
      entryFee: entryFee || {},
      openingTime: openingTime?.trim() || "",
      closingTime: closingTime?.trim() || "",
      closedOn: closedOn?.trim() || "",
      bestTimeToVisit: bestTimeToVisit?.trim() || "",
      visitDuration: visitDuration?.trim() || "",
      address: address?.trim() || "",
      latitude:
        latitude !== undefined &&
        latitude !== null &&
        latitude !== ""
          ? Number(latitude)
          : undefined,
      longitude:
        longitude !== undefined &&
        longitude !== null &&
        longitude !== ""
          ? Number(longitude)
          : undefined,
      coverImage: normalizedCoverImage,
      gallery: normalizedGallery,
      isFeatured: isFeatured ?? false,
      isActive: isActive ?? true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Place created successfully",
        data: place,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST place error:", error);

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
        message: "Failed to create place",
      },
      { status: 500 }
    );
  }
}
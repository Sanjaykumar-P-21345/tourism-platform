import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Package, Place } from "@/utils/schema";
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

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value.map((item) => String(item).trim()).filter(Boolean);
}

async function validateItinerary(itinerary) {
  if (!Array.isArray(itinerary)) {
    return {
      valid: true,
      itinerary: [],
    };
  }

  const normalized = [];

  for (let index = 0; index < itinerary.length; index += 1) {
    const item = itinerary[index];

    if (!item || typeof item !== "object") {
      return {
        valid: false,
        message: `Invalid itinerary item at position ${index + 1}`,
      };
    }

    const day = Number(item.day);

    if (!Number.isInteger(day) || day < 1) {
      return {
        valid: false,
        message: `Invalid itinerary day at position ${index + 1}`,
      };
    }

    const title = String(item.title || "").trim();

    if (!title) {
      return {
        valid: false,
        message: `Itinerary title is required for Day ${day}`,
      };
    }

    const places = Array.isArray(item.places) ? item.places : [];

    for (const placeId of places) {
      if (!mongoose.Types.ObjectId.isValid(placeId)) {
        return {
          valid: false,
          message: `Invalid place ID: ${placeId}`,
        };
      }

      const placeExists = await Place.exists({
        _id: placeId,
      });

      if (!placeExists) {
        return {
          valid: false,
          message: `Place not found: ${placeId}`,
        };
      }
    }

    normalized.push({
      day,
      title,
      description: String(item.description || "").trim(),
      places,
    });
  }

  return {
    valid: true,
    itinerary: normalized,
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

    const packages = await Package.find({})
      .populate("destination", "name slug")
      .populate("itinerary.places", "name slug category")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("GET packages error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch packages",
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
      name,
      slug,
      shortDescription,
      description,
      duration,
      price,
      priceType,
      inclusions,
      exclusions,
      itinerary,
      coverImage,
      gallery,
      isFeatured,
      isActive,
    } = body;

    if (
      !destination ||
      !name ||
      !slug ||
      !description ||
      !duration ||
      price === undefined ||
      price === null ||
      !coverImage
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Destination, name, slug, description, duration, price and cover image are required",
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

    const normalizedName = String(name).trim();
    const normalizedSlug = String(slug).trim().toLowerCase();
    const normalizedDescription = String(description).trim();

    if (!normalizedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Package name is required",
        },
        { status: 400 },
      );
    }

    if (!normalizedSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Package slug is required",
        },
        { status: 400 },
      );
    }

    if (!normalizedDescription) {
      return NextResponse.json(
        {
          success: false,
          message: "Package description is required",
        },
        { status: 400 },
      );
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid non-negative number",
        },
        { status: 400 },
      );
    }

    if (
      !duration ||
      duration.days === undefined ||
      duration.nights === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration days and nights are required",
        },
        { status: 400 },
      );
    }

    const days = Number(duration.days);
    const nights = Number(duration.nights);

    if (
      !Number.isInteger(days) ||
      days < 1 ||
      !Number.isInteger(nights) ||
      nights < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration values are invalid",
        },
        { status: 400 },
      );
    }

    const allowedPriceTypes = ["per-person", "per-couple", "per-group"];

    const normalizedPriceType = priceType || "per-person";

    if (!allowedPriceTypes.includes(normalizedPriceType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid price type",
        },
        { status: 400 },
      );
    }

    const normalizedCoverImage = normalizeImage(coverImage);

    if (!normalizedCoverImage?.url) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid cover image is required",
        },
        { status: 400 },
      );
    }

    const normalizedGallery = normalizeGallery(gallery);

    const existingPackage = await Package.findOne({
      slug: normalizedSlug,
    });

    if (existingPackage) {
      return NextResponse.json(
        {
          success: false,
          message: "Package slug already exists",
        },
        { status: 409 },
      );
    }

    const itineraryValidation = await validateItinerary(itinerary);

    if (!itineraryValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: itineraryValidation.message,
        },
        { status: 400 },
      );
    }

    const packageData = await Package.create({
      destination,
      name: normalizedName,
      slug: normalizedSlug,
      shortDescription: String(shortDescription || "").trim(),
      description: normalizedDescription,

      duration: {
        days,
        nights,
      },

      price: numericPrice,

      priceType: normalizedPriceType,

      inclusions: normalizeStringArray(inclusions),

      exclusions: normalizeStringArray(exclusions),

      itinerary: itineraryValidation.itinerary,

      coverImage: normalizedCoverImage,

      gallery: normalizedGallery,

      isFeatured: Boolean(isFeatured),

      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Package created successfully",
        data: packageData,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST package error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Package slug already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create package",
      },
      { status: 500 },
    );
  }
}

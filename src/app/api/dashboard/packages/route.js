import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Package, Place } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

const ALLOWED_PRICE_TYPES = ["per-person", "per-couple", "per-group"];

function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return Boolean(value);
}

function normalizeImage(image) {
  if (!image || typeof image !== "object") {
    return null;
  }

  const url = String(image.url || "").trim();
  const publicId = String(image.publicId || "").trim();

  if (!url || !publicId) {
    return null;
  }

  return {
    url,
    publicId,
  };
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery.map(normalizeImage).filter(Boolean);
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

async function validateItinerary(itinerary, destinationId) {
  if (itinerary === undefined || itinerary === null) {
    return {
      valid: true,
      itinerary: [],
    };
  }

  if (!Array.isArray(itinerary)) {
    return {
      valid: false,
      message: "Itinerary must be an array",
    };
  }

  const normalized = [];
  const usedDays = new Set();
  const allPlaceIds = new Set();

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

    if (usedDays.has(day)) {
      return {
        valid: false,
        message: `Duplicate itinerary day: Day ${day}`,
      };
    }

    usedDays.add(day);

    const title = String(item.title || "").trim();

    if (!title) {
      return {
        valid: false,
        message: `Itinerary title is required for Day ${day}`,
      };
    }

    const description = String(item.description || "").trim();

    const rawPlaces = Array.isArray(item.places) ? item.places : [];

    const places = [];

    for (const placeId of rawPlaces) {
      if (!mongoose.Types.ObjectId.isValid(placeId)) {
        return {
          valid: false,
          message: `Invalid place ID: ${placeId}`,
        };
      }

      const normalizedPlaceId = String(placeId);

      if (!allPlaceIds.has(normalizedPlaceId)) {
        allPlaceIds.add(normalizedPlaceId);
        places.push(normalizedPlaceId);
      }
    }

    normalized.push({
      day,
      title,
      description,
      places,
    });
  }

  if (allPlaceIds.size > 0) {
    const placeIds = Array.from(allPlaceIds);

    const places = await Place.find({
      _id: {
        $in: placeIds,
      },
    })
      .select("_id destination")
      .lean();

    if (places.length !== placeIds.length) {
      const existingIds = new Set(places.map((place) => String(place._id)));

      const missingPlaceId = placeIds.find(
        (placeId) => !existingIds.has(placeId),
      );

      return {
        valid: false,
        message: `Place not found: ${missingPlaceId}`,
      };
    }

    const invalidDestinationPlace = places.find(
      (place) => String(place.destination) !== String(destinationId),
    );

    if (invalidDestinationPlace) {
      return {
        valid: false,
        message: "All itinerary places must belong to the selected destination",
      };
    }
  }

  normalized.sort((a, b) => a.day - b.day);

  return {
    valid: true,
    itinerary: normalized,
  };
}

async function populatePackage(packageId) {
  return Package.findById(packageId)
    .populate("destination", "name slug")
    .populate("itinerary.places", "name slug category")
    .lean();
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

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 },
      );
    }

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

    /*
     * Required fields
     */
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

    /*
     * Destination validation
     */
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

    /*
     * Basic string normalization
     */
    const normalizedName = String(name).trim();

    const normalizedSlug = normalizeSlug(slug);

    const normalizedDescription = String(description).trim();

    const normalizedShortDescription = String(shortDescription || "").trim();

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

    /*
     * Price validation
     */
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid non-negative number",
        },
        { status: 400 },
      );
    }

    /*
     * Duration validation
     */
    if (
      !duration ||
      typeof duration !== "object" ||
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

    /*
     * Price type validation
     */
    const normalizedPriceType = String(priceType || "per-person").trim();

    if (!ALLOWED_PRICE_TYPES.includes(normalizedPriceType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid price type",
        },
        { status: 400 },
      );
    }

    /*
     * Cover image validation
     *
     * ImageSchema requires both url and publicId.
     */
    const normalizedCoverImage = normalizeImage(coverImage);

    if (!normalizedCoverImage) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid cover image with URL and public ID is required",
        },
        { status: 400 },
      );
    }

    /*
     * Gallery validation
     */
    const normalizedGallery = normalizeGallery(gallery);

    /*
     * Slug uniqueness
     */
    const existingPackage = await Package.exists({
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

    /*
     * Itinerary validation
     */
    const itineraryValidation = await validateItinerary(itinerary, destination);

    if (!itineraryValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: itineraryValidation.message,
        },
        { status: 400 },
      );
    }

    /*
     * Create package
     */
    const createdPackage = await Package.create({
      destination,
      name: normalizedName,
      slug: normalizedSlug,

      shortDescription: normalizedShortDescription,

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

      isFeatured: parseBoolean(isFeatured, false),

      isActive: parseBoolean(isActive, true),
    });

    /*
     * Return populated package
     */
    const packageData = await populatePackage(createdPackage._id);

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
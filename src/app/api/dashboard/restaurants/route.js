import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Restaurant } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

/* ================================================================
   HELPERS
================================================================ */

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

function parseOptionalCoordinate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return {
      value: undefined,
      error: null,
    };
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return {
      value: undefined,
      error: `${fieldName} must be a valid number`,
    };
  }

  return {
    value: number,
    error: null,
  };
}

/* ================================================================
   GET ALL RESTAURANTS
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

    const restaurants = await Restaurant.find({})
      .populate("destination", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    console.error("GET restaurants error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch restaurants",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   CREATE RESTAURANT
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
      name,
      slug,
      description,
      cuisines,
      foodType,
      priceRange,
      popularDishes,
      openingTime,
      closingTime,
      address,
      latitude,
      longitude,
      contactPhone,
      website,
      coverImage,
      gallery,
      rating,
      isFeatured,
      isActive,
    } = body;

    /* ------------------------------------------------------------
       REQUIRED FIELDS
    ------------------------------------------------------------ */

    if (!destination) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination is required",
        },
        { status: 400 },
      );
    }

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant name is required",
        },
        { status: 400 },
      );
    }

    if (!slug || !String(slug).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant slug is required",
        },
        { status: 400 },
      );
    }

    if (!description || !String(description).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant description is required",
        },
        { status: 400 },
      );
    }

    if (!priceRange) {
      return NextResponse.json(
        {
          success: false,
          message: "Price range is required",
        },
        { status: 400 },
      );
    }

    if (!coverImage) {
      return NextResponse.json(
        {
          success: false,
          message: "Cover image is required",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       DESTINATION VALIDATION
    ------------------------------------------------------------ */

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

    /* ------------------------------------------------------------
       NORMALIZE BASIC VALUES
    ------------------------------------------------------------ */

    const normalizedName = String(name).trim();

    const normalizedSlug = String(slug).trim().toLowerCase();

    const normalizedDescription = String(description).trim();

    /* ------------------------------------------------------------
       PRICE RANGE VALIDATION
    ------------------------------------------------------------ */

    const allowedPriceRanges = ["budget", "moderate", "expensive"];

    if (!allowedPriceRanges.includes(priceRange)) {
      return NextResponse.json(
        {
          success: false,
          message: "Price range must be budget, moderate or expensive",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       FOOD TYPE VALIDATION
    ------------------------------------------------------------ */

    const normalizedFoodType = foodType || "both";

    const allowedFoodTypes = ["veg", "non-veg", "both"];

    if (!allowedFoodTypes.includes(normalizedFoodType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Food type must be veg, non-veg or both",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       SLUG DUPLICATE CHECK
    ------------------------------------------------------------ */

    const existingRestaurant = await Restaurant.findOne({
      slug: normalizedSlug,
    }).lean();

    if (existingRestaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant slug already exists",
        },
        { status: 409 },
      );
    }

    /* ------------------------------------------------------------
       COVER IMAGE
    ------------------------------------------------------------ */

    const normalizedCoverImage = normalizeImage(coverImage);

    if (!normalizedCoverImage) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid cover image with Cloudinary publicId is required",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       GALLERY
    ------------------------------------------------------------ */

    const normalizedGallery = normalizeGallery(gallery);

    /* ------------------------------------------------------------
       RATING
    ------------------------------------------------------------ */

    const normalizedRating =
      rating === undefined || rating === null || rating === ""
        ? 0
        : Number(rating);

    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 0 ||
      normalizedRating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 0 and 5",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       COORDINATES
    ------------------------------------------------------------ */

    const latitudeResult = parseOptionalCoordinate(latitude, "Latitude");

    if (latitudeResult.error) {
      return NextResponse.json(
        {
          success: false,
          message: latitudeResult.error,
        },
        { status: 400 },
      );
    }

    const longitudeResult = parseOptionalCoordinate(longitude, "Longitude");

    if (longitudeResult.error) {
      return NextResponse.json(
        {
          success: false,
          message: longitudeResult.error,
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       CREATE
    ------------------------------------------------------------ */

    const restaurant = await Restaurant.create({
      destination,

      name: normalizedName,

      slug: normalizedSlug,

      description: normalizedDescription,

      cuisines: normalizeStringArray(cuisines),

      foodType: normalizedFoodType,

      priceRange,

      popularDishes: normalizeStringArray(popularDishes),

      openingTime: openingTime ? String(openingTime).trim() : "",

      closingTime: closingTime ? String(closingTime).trim() : "",

      address: address ? String(address).trim() : "",

      latitude: latitudeResult.value,

      longitude: longitudeResult.value,

      contactPhone: contactPhone ? String(contactPhone).trim() : "",

      website: website ? String(website).trim() : "",

      coverImage: normalizedCoverImage,

      gallery: normalizedGallery,

      rating: normalizedRating,

      isFeatured: Boolean(isFeatured),

      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Restaurant created successfully",
        data: restaurant,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST restaurant error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant slug already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create restaurant",
      },
      { status: 500 },
    );
  }
}
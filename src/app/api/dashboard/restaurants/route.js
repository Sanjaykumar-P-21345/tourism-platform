import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/utils/mongodb";
import { Destination, Restaurant } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

function normalizeImage(image) {
  if (!image) return null;

  // Support old URL-string data
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

    if (
      !destination ||
      !name?.trim() ||
      !slug?.trim() ||
      !description?.trim() ||
      !priceRange ||
      !coverImage
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Destination, name, slug, description, price range and cover image are required",
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

    const normalizedSlug = slug.trim().toLowerCase();

    const existingRestaurant = await Restaurant.findOne({
      slug: normalizedSlug,
    });

    if (existingRestaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant slug already exists",
        },
        { status: 409 },
      );
    }

    const normalizedCoverImage = normalizeImage(coverImage);

    if (!normalizedCoverImage?.url) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid cover image is required",
        },
        { status: 400 },
      );
    }

    const normalizedRating =
      rating === undefined || rating === null || rating === ""
        ? 0
        : Number(rating);

    if (
      Number.isNaN(normalizedRating) ||
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

    const restaurant = await Restaurant.create({
      destination,
      name: name.trim(),
      slug: normalizedSlug,
      description: description.trim(),

      cuisines: Array.isArray(cuisines)
        ? cuisines.filter(Boolean).map((item) => String(item).trim())
        : [],

      foodType: foodType || "both",

      priceRange,

      popularDishes: Array.isArray(popularDishes)
        ? popularDishes.filter(Boolean).map((item) => String(item).trim())
        : [],

      openingTime: openingTime?.trim() || "",
      closingTime: closingTime?.trim() || "",
      address: address?.trim() || "",
      latitude:
        latitude === "" || latitude === undefined
          ? undefined
          : Number(latitude),
      longitude:
        longitude === "" || longitude === undefined
          ? undefined
          : Number(longitude),
      contactPhone: contactPhone?.trim() || "",
      website: website?.trim() || "",

      coverImage: normalizedCoverImage,
      gallery: normalizeGallery(gallery),

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

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create restaurant",
      },
      { status: 500 },
    );
  }
}

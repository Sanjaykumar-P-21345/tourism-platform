import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/utils/mongodb";
import {
  Destination,
  Hotel,
} from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

function normalizeImage(image) {
  if (!image) return null;

  if (typeof image === "string") {
    return {
      url: image.trim(),
      publicId: "",
    };
  }

  if (
    typeof image === "object" &&
    image.url
  ) {
    return {
      url: String(image.url).trim(),
      publicId: String(
        image.publicId || ""
      ).trim(),
    };
  }

  return null;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery
    .map(normalizeImage)
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

    const hotels = await Hotel.find({})
      .populate(
        "destination",
        "name slug"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: hotels,
    });
  } catch (error) {
    console.error(
      "GET hotels error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch hotels",
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
      description,
      category,
      pricePerNight,
      amenities,
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
      !name ||
      !slug ||
      !description ||
      !category ||
      pricePerNight === undefined ||
      !coverImage
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Destination, name, slug, description, category, price and cover image are required",
        },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        destination
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid destination ID",
        },
        { status: 400 }
      );
    }

    const destinationExists =
      await Destination.exists({
        _id: destination,
      });

    if (!destinationExists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Destination not found",
        },
        { status: 404 }
      );
    }

    const normalizedCoverImage =
      normalizeImage(coverImage);

    if (!normalizedCoverImage?.url) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid cover image is required",
        },
        { status: 400 }
      );
    }

    const normalizedGallery =
      normalizeGallery(gallery);

    const normalizedSlug = String(slug)
      .trim()
      .toLowerCase();

    const existingHotel =
      await Hotel.findOne({
        slug: normalizedSlug,
      });

    if (existingHotel) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hotel slug already exists",
        },
        { status: 409 }
      );
    }

    const minPrice = Number(
      pricePerNight?.min
    );

    const maxPrice = Number(
      pricePerNight?.max
    );

    if (
      Number.isNaN(minPrice) ||
      Number.isNaN(maxPrice)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid price values",
        },
        { status: 400 }
      );
    }

    if (minPrice < 0 || maxPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Price cannot be negative",
        },
        { status: 400 }
      );
    }

    if (minPrice > maxPrice) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Minimum price cannot be greater than maximum price",
        },
        { status: 400 }
      );
    }

    const normalizedRating =
      rating === undefined ||
      rating === null ||
      rating === ""
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
          message:
            "Rating must be between 0 and 5",
        },
        { status: 400 }
      );
    }

    const hotel = await Hotel.create({
      destination,

      name: String(name).trim(),

      slug: normalizedSlug,

      description:
        String(description).trim(),

      category,

      pricePerNight: {
        min: minPrice,
        max: maxPrice,
      },

      amenities: Array.isArray(amenities)
        ? amenities
            .map((item) =>
              String(item).trim()
            )
            .filter(Boolean)
        : [],

      address: address
        ? String(address).trim()
        : undefined,

      latitude,

      longitude,

      contactPhone: contactPhone
        ? String(contactPhone).trim()
        : undefined,

      website: website
        ? String(website).trim()
        : undefined,

      coverImage:
        normalizedCoverImage,

      gallery:
        normalizedGallery,

      rating:
        normalizedRating,

      isFeatured:
        isFeatured ?? false,

      isActive:
        isActive ?? true,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Hotel created successfully",
        data: hotel,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST hotel error:",
      error
    );

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hotel slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create hotel",
      },
      { status: 500 }
    );
  }
}
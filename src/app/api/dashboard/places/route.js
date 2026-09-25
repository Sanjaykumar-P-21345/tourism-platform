import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Place } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

/* ================================================================
   HELPERS
================================================================ */

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
    typeof image.url === "string" &&
    image.url.trim()
  ) {
    return {
      url: image.url.trim(),
      publicId: typeof image.publicId === "string" ? image.publicId.trim() : "",
    };
  }

  return null;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery.map((image) => normalizeImage(image)).filter(Boolean);
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function normalizeEntryFee(entryFee) {
  if (!entryFee || typeof entryFee !== "object") {
    return {
      adult: 0,
      child: 0,
      foreigner: 0,
    };
  }

  const adult = normalizeNumber(entryFee.adult);
  const child = normalizeNumber(entryFee.child);
  const foreigner = normalizeNumber(entryFee.foreigner);

  if (adult === null || child === null || foreigner === null) {
    return null;
  }

  if (
    (adult !== undefined && adult < 0) ||
    (child !== undefined && child < 0) ||
    (foreigner !== undefined && foreigner < 0)
  ) {
    return null;
  }

  return {
    adult: adult ?? 0,
    child: child ?? 0,
    foreigner: foreigner ?? 0,
  };
}

/* ================================================================
   GET ALL PLACES
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
      { status: 500 },
    );
  }
}

/* ================================================================
   CREATE PLACE
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

    /* ------------------------------------------------------------
       REQUIRED FIELDS
    ------------------------------------------------------------ */

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
       NAME
    ------------------------------------------------------------ */

    const normalizedName = String(name).trim();

    if (!normalizedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Place name is required",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       SLUG
    ------------------------------------------------------------ */

    const normalizedSlug = String(slug).trim().toLowerCase();

    if (!normalizedSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Place slug is required",
        },
        { status: 400 },
      );
    }

    const existingPlace = await Place.findOne({
      slug: normalizedSlug,
    });

    if (existingPlace) {
      return NextResponse.json(
        {
          success: false,
          message: "Place slug already exists",
        },
        { status: 409 },
      );
    }

    /* ------------------------------------------------------------
       DESCRIPTION
    ------------------------------------------------------------ */

    const normalizedDescription = String(description).trim();

    if (!normalizedDescription) {
      return NextResponse.json(
        {
          success: false,
          message: "Place description is required",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       COVER IMAGE
    ------------------------------------------------------------ */

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

    /*
     * New uploads should always contain a Cloudinary publicId.
     * We allow an empty publicId for legacy records, but newly
     * created records should have one.
     */
    if (!normalizedCoverImage.publicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cover image must be uploaded through Cloudinary",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       GALLERY
    ------------------------------------------------------------ */

    const normalizedGallery = normalizeGallery(gallery);

    /* ------------------------------------------------------------
       ENTRY FEE
    ------------------------------------------------------------ */

    const normalizedEntryFee = normalizeEntryFee(entryFee);

    if (!normalizedEntryFee) {
      return NextResponse.json(
        {
          success: false,
          message: "Entry fee values must be valid non-negative numbers",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       COORDINATES
    ------------------------------------------------------------ */

    const normalizedLatitude = normalizeNumber(latitude);

    const normalizedLongitude = normalizeNumber(longitude);

    if (normalizedLatitude === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid latitude",
        },
        { status: 400 },
      );
    }

    if (normalizedLongitude === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid longitude",
        },
        { status: 400 },
      );
    }

    /* ------------------------------------------------------------
       CREATE
    ------------------------------------------------------------ */

    const place = await Place.create({
      destination,

      name: normalizedName,

      slug: normalizedSlug,

      category,

      description: normalizedDescription,

      shortDescription: shortDescription?.trim() || "",

      entryFee: normalizedEntryFee,

      openingTime: openingTime?.trim() || "",

      closingTime: closingTime?.trim() || "",

      closedOn: closedOn?.trim() || "",

      bestTimeToVisit: bestTimeToVisit?.trim() || "",

      visitDuration: visitDuration?.trim() || "",

      address: address?.trim() || "",

      latitude: normalizedLatitude,

      longitude: normalizedLongitude,

      coverImage: normalizedCoverImage,

      gallery: normalizedGallery,

      isFeatured: typeof isFeatured === "boolean" ? isFeatured : false,

      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    const populatedPlace = await Place.findById(place._id)
      .populate("destination", "name slug")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Place created successfully",
        data: populatedPlace,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST place error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Place slug already exists",
        },
        { status: 409 },
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
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create place",
      },
      { status: 500 },
    );
  }
}
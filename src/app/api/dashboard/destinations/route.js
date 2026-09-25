import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { Destination } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

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

    const destinations = await Destination.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: destinations,
    });
  } catch (error) {
    console.error("GET destinations error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch destinations",
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
      name,
      slug,
      type,
      country,
      state,
      description,
      shortDescription,
      bestTimeToVisit,
      language,
      currency,
      coverImage,
      gallery,
      latitude,
      longitude,
      address,
      isFeatured,
      isActive,
    } = body;

    /*
     * -----------------------------------------------
     * REQUIRED FIELDS
     * -----------------------------------------------
     */

    if (!name || !slug || !type || !country || !description || !coverImage) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, slug, type, country, description and cover image are required",
        },
        { status: 400 },
      );
    }

    /*
     * -----------------------------------------------
     * NORMALIZE BASIC VALUES
     * -----------------------------------------------
     */

    const normalizedName = String(name).trim();
    const normalizedSlug = String(slug).trim().toLowerCase();
    const normalizedType = String(type).trim();
    const normalizedCountry = String(country).trim();
    const normalizedDescription = String(description).trim();

    if (!normalizedName) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination name cannot be empty",
        },
        { status: 400 },
      );
    }

    if (!normalizedSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug cannot be empty",
        },
        { status: 400 },
      );
    }

    if (!normalizedCountry) {
      return NextResponse.json(
        {
          success: false,
          message: "Country cannot be empty",
        },
        { status: 400 },
      );
    }

    if (!normalizedDescription) {
      return NextResponse.json(
        {
          success: false,
          message: "Description cannot be empty",
        },
        { status: 400 },
      );
    }

    /*
     * -----------------------------------------------
     * COVER IMAGE
     * -----------------------------------------------
     */

    if (
      typeof coverImage !== "object" ||
      !coverImage.url ||
      !coverImage.publicId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cover image must contain a valid Cloudinary URL and public ID",
        },
        { status: 400 },
      );
    }

    const normalizedCoverImage = {
      url: String(coverImage.url).trim(),
      publicId: String(coverImage.publicId).trim(),
    };

    /*
     * -----------------------------------------------
     * GALLERY
     * -----------------------------------------------
     */

    if (gallery !== undefined && !Array.isArray(gallery)) {
      return NextResponse.json(
        {
          success: false,
          message: "Gallery must be an array",
        },
        { status: 400 },
      );
    }

    const normalizedGallery = Array.isArray(gallery)
      ? gallery
          .filter(
            (image) =>
              image && typeof image === "object" && image.url && image.publicId,
          )
          .map((image) => ({
            url: String(image.url).trim(),
            publicId: String(image.publicId).trim(),
          }))
      : [];

    /*
     * -----------------------------------------------
     * CHECK DUPLICATE SLUG
     * -----------------------------------------------
     */

    const existingDestination = await Destination.findOne({
      slug: normalizedSlug,
    });

    if (existingDestination) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination slug already exists",
        },
        { status: 409 },
      );
    }

    /*
     * -----------------------------------------------
     * COORDINATES
     * -----------------------------------------------
     */

    let normalizedLatitude;
    let normalizedLongitude;

    if (latitude !== undefined && latitude !== null && latitude !== "") {
      normalizedLatitude = Number(latitude);

      if (Number.isNaN(normalizedLatitude)) {
        return NextResponse.json(
          {
            success: false,
            message: "Latitude must be a valid number",
          },
          { status: 400 },
        );
      }
    }

    if (longitude !== undefined && longitude !== null && longitude !== "") {
      normalizedLongitude = Number(longitude);

      if (Number.isNaN(normalizedLongitude)) {
        return NextResponse.json(
          {
            success: false,
            message: "Longitude must be a valid number",
          },
          { status: 400 },
        );
      }
    }

    /*
     * -----------------------------------------------
     * CREATE
     * -----------------------------------------------
     */

    const destination = await Destination.create({
      name: normalizedName,

      slug: normalizedSlug,

      type: normalizedType,

      country: normalizedCountry,

      state: typeof state === "string" ? state.trim() : "",

      description: normalizedDescription,

      shortDescription:
        typeof shortDescription === "string" ? shortDescription.trim() : "",

      bestTimeToVisit:
        typeof bestTimeToVisit === "string" ? bestTimeToVisit.trim() : "",

      language: typeof language === "string" ? language.trim() : "",

      currency: typeof currency === "string" ? currency.trim() : "",

      coverImage: normalizedCoverImage,

      gallery: normalizedGallery,

      latitude: normalizedLatitude,

      longitude: normalizedLongitude,

      address: typeof address === "string" ? address.trim() : "",

      isFeatured: typeof isFeatured === "boolean" ? isFeatured : false,

      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Destination created successfully",
        data: destination,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST destination error:", error);

    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: Object.values(error.errors).map((item) => item.message),
        },
        { status: 400 },
      );
    }

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A destination with this slug already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create destination",
      },
      { status: 500 },
    );
  }
}
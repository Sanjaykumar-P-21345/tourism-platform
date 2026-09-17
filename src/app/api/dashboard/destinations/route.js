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
        { status: 401 }
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
     * REQUIRED FIELD VALIDATION
     * -----------------------------------------------
     */

    if (
      !name ||
      !slug ||
      !type ||
      !country ||
      !description ||
      !coverImage
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, slug, type, country, description and cover image are required",
        },
        { status: 400 }
      );
    }

    /*
     * -----------------------------------------------
     * COVER IMAGE VALIDATION
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
        { status: 400 }
      );
    }

    /*
     * -----------------------------------------------
     * GALLERY VALIDATION
     * -----------------------------------------------
     */

    if (gallery !== undefined && !Array.isArray(gallery)) {
      return NextResponse.json(
        {
          success: false,
          message: "Gallery must be an array",
        },
        { status: 400 }
      );
    }

    const normalizedGallery = Array.isArray(gallery)
      ? gallery
          .filter(
            (image) =>
              image &&
              typeof image === "object" &&
              image.url &&
              image.publicId
          )
          .map((image) => ({
            url: image.url.trim(),
            publicId: image.publicId.trim(),
          }))
      : [];

    /*
     * -----------------------------------------------
     * NORMALIZE SLUG
     * -----------------------------------------------
     */

    const normalizedSlug = slug.trim().toLowerCase();

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
        { status: 409 }
      );
    }

    /*
     * -----------------------------------------------
     * CREATE DESTINATION
     * -----------------------------------------------
     */

    const destination = await Destination.create({
      name: name.trim(),

      slug: normalizedSlug,

      type,

      country: country.trim(),

      state:
        typeof state === "string"
          ? state.trim()
          : "",

      description: description.trim(),

      shortDescription:
        typeof shortDescription === "string"
          ? shortDescription.trim()
          : "",

      bestTimeToVisit:
        typeof bestTimeToVisit === "string"
          ? bestTimeToVisit.trim()
          : "",

      language:
        typeof language === "string"
          ? language.trim()
          : "",

      currency:
        typeof currency === "string"
          ? currency.trim()
          : "",

      /*
       * Cloudinary image object
       */
      coverImage: {
        url: coverImage.url.trim(),
        publicId: coverImage.publicId.trim(),
      },

      /*
       * Cloudinary gallery
       */
      gallery: normalizedGallery,

      /*
       * Convert coordinates to numbers
       */
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

      address:
        typeof address === "string"
          ? address.trim()
          : "",

      isFeatured:
        typeof isFeatured === "boolean"
          ? isFeatured
          : false,

      isActive:
        typeof isActive === "boolean"
          ? isActive
          : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Destination created successfully",
        data: destination,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST destination error:", error);

    /*
     * Handle Mongoose validation errors
     */
    if (error?.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: Object.values(error.errors).map(
            (item) => item.message
          ),
        },
        { status: 400 }
      );
    }

    /*
     * Handle duplicate key errors
     */
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A destination with this slug already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create destination",
      },
      { status: 500 }
    );
  }
}
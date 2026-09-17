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
    const title = String(item.title || "").trim();

    if (!Number.isInteger(day) || day < 1) {
      return {
        valid: false,
        message: `Invalid itinerary day at position ${index + 1}`,
      };
    }

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

export async function GET(request, { params }) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid package ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const packageData = await Package.findById(id)
      .populate("destination", "name slug")
      .populate("itinerary.places", "name slug category")
      .lean();

    if (!packageData) {
      return NextResponse.json(
        {
          success: false,
          message: "Package not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: packageData,
    });
  } catch (error) {
    console.error("GET package error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch package",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid package ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const body = await request.json();

    const allowedFields = [
      "destination",
      "name",
      "slug",
      "shortDescription",
      "description",
      "duration",
      "price",
      "priceType",
      "inclusions",
      "exclusions",
      "itinerary",
      "coverImage",
      "gallery",
      "isFeatured",
      "isActive",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "destination")) {
      if (!mongoose.Types.ObjectId.isValid(updateData.destination)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid destination ID",
          },
          { status: 400 },
        );
      }

      const destinationExists = await Destination.exists({
        _id: updateData.destination,
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
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "name")) {
      updateData.name = String(updateData.name || "").trim();

      if (!updateData.name) {
        return NextResponse.json(
          {
            success: false,
            message: "Package name is required",
          },
          { status: 400 },
        );
      }
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "slug")) {
      updateData.slug = String(updateData.slug || "")
        .trim()
        .toLowerCase();

      if (!updateData.slug) {
        return NextResponse.json(
          {
            success: false,
            message: "Package slug is required",
          },
          { status: 400 },
        );
      }

      const duplicate = await Package.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Package slug already exists",
          },
          { status: 409 },
        );
      }
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "shortDescription")) {
      updateData.shortDescription = String(
        updateData.shortDescription || "",
      ).trim();
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "description")) {
      updateData.description = String(updateData.description || "").trim();

      if (!updateData.description) {
        return NextResponse.json(
          {
            success: false,
            message: "Package description is required",
          },
          { status: 400 },
        );
      }
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "duration")) {
      const days = Number(updateData.duration?.days);

      const nights = Number(updateData.duration?.nights);

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

      updateData.duration = {
        days,
        nights,
      };
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "price")) {
      const price = Number(updateData.price);

      if (Number.isNaN(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Price must be a valid non-negative number",
          },
          { status: 400 },
        );
      }

      updateData.price = price;
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "priceType")) {
      const allowedPriceTypes = ["per-person", "per-couple", "per-group"];

      if (!allowedPriceTypes.includes(updateData.priceType)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid price type",
          },
          { status: 400 },
        );
      }
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "inclusions")) {
      updateData.inclusions = normalizeStringArray(updateData.inclusions);
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "exclusions")) {
      updateData.exclusions = normalizeStringArray(updateData.exclusions);
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "itinerary")) {
      const itineraryValidation = await validateItinerary(updateData.itinerary);

      if (!itineraryValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            message: itineraryValidation.message,
          },
          { status: 400 },
        );
      }

      updateData.itinerary = itineraryValidation.itinerary;
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "coverImage")) {
      const normalizedCoverImage = normalizeImage(updateData.coverImage);

      if (!normalizedCoverImage?.url) {
        return NextResponse.json(
          {
            success: false,
            message: "A valid cover image is required",
          },
          { status: 400 },
        );
      }

      updateData.coverImage = normalizedCoverImage;
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "gallery")) {
      updateData.gallery = normalizeGallery(updateData.gallery);
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "isFeatured")) {
      updateData.isFeatured = Boolean(updateData.isFeatured);
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "isActive")) {
      updateData.isActive = Boolean(updateData.isActive);
    }

    const packageData = await Package.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!packageData) {
      return NextResponse.json(
        {
          success: false,
          message: "Package not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Package updated successfully",
      data: packageData,
    });
  } catch (error) {
    console.error("PUT package error:", error);

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
        message: error?.message || "Failed to update package",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid package ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const packageData = await Package.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!packageData) {
      return NextResponse.json(
        {
          success: false,
          message: "Package not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Package deactivated successfully",
      data: packageData,
    });
  } catch (error) {
    console.error("DELETE package error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate package",
      },
      { status: 500 },
    );
  }
}
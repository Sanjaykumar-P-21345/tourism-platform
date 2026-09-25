import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Package, Place } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";
import cloudinary from "@/utils/cloudinary";

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

function getPackageImagePublicIds(packageData) {
  const publicIds = [];

  if (packageData?.coverImage?.publicId) {
    publicIds.push(packageData.coverImage.publicId);
  }

  if (Array.isArray(packageData?.gallery)) {
    for (const image of packageData.gallery) {
      if (image?.publicId) {
        publicIds.push(image.publicId);
      }
    }
  }

  return [...new Set(publicIds.filter(Boolean))];
}

async function deleteCloudinaryImages(publicIds) {
  if (!Array.isArray(publicIds)) {
    return;
  }

  for (const publicId of publicIds) {
    if (!publicId) {
      continue;
    }

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
    } catch (error) {
      console.error(`Failed to delete Cloudinary image ${publicId}:`, error);
    }
  }
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

  /*
   * Verify all itinerary places.
   */
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

    /*
     * Every itinerary place must belong
     * to the selected package destination.
     */
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

async function populatePackage(id) {
  return Package.findById(id)
    .populate("destination", "name slug")
    .populate("itinerary.places", "name slug category")
    .lean();
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

    const packageData = await populatePackage(id);

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

    /*
     * Load the existing package first.
     * We need the old images for Cloudinary
     * cleanup after a successful update.
     */
    const existingPackage = await Package.findById(id);

    if (!existingPackage) {
      return NextResponse.json(
        {
          success: false,
          message: "Package not found",
        },
        { status: 404 },
      );
    }

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

    /*
     * Nothing to update.
     */
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields provided for update",
        },
        { status: 400 },
      );
    }

    /*
     * Destination
     */
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

    const destinationId = updateData.destination || existingPackage.destination;

    /*
     * Name
     */
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

    /*
     * Slug
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "slug")) {
      updateData.slug = normalizeSlug(updateData.slug);

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
        _id: {
          $ne: id,
        },
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

    /*
     * Short description
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "shortDescription")) {
      updateData.shortDescription = String(
        updateData.shortDescription || "",
      ).trim();
    }

    /*
     * Description
     */
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

    /*
     * Duration
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "duration")) {
      if (!updateData.duration || typeof updateData.duration !== "object") {
        return NextResponse.json(
          {
            success: false,
            message: "Duration days and nights are required",
          },
          { status: 400 },
        );
      }

      const days = Number(updateData.duration.days);

      const nights = Number(updateData.duration.nights);

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

    /*
     * Price
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "price")) {
      const price = Number(updateData.price);

      if (!Number.isFinite(price) || price < 0) {
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

    /*
     * Price type
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "priceType")) {
      const priceType = String(updateData.priceType || "").trim();

      if (!ALLOWED_PRICE_TYPES.includes(priceType)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid price type",
          },
          { status: 400 },
        );
      }

      updateData.priceType = priceType;
    }

    /*
     * Inclusions
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "inclusions")) {
      updateData.inclusions = normalizeStringArray(updateData.inclusions);
    }

    /*
     * Exclusions
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "exclusions")) {
      updateData.exclusions = normalizeStringArray(updateData.exclusions);
    }

    /*
     * Itinerary
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "itinerary")) {
      const itineraryValidation = await validateItinerary(
        updateData.itinerary,
        destinationId,
      );

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

    /*
     * Cover image
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "coverImage")) {
      const normalizedCoverImage = normalizeImage(updateData.coverImage);

      if (!normalizedCoverImage) {
        return NextResponse.json(
          {
            success: false,
            message: "A valid cover image with URL and public ID is required",
          },
          { status: 400 },
        );
      }

      updateData.coverImage = normalizedCoverImage;
    }

    /*
     * Gallery
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "gallery")) {
      updateData.gallery = normalizeGallery(updateData.gallery);
    }

    /*
     * Featured
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "isFeatured")) {
      updateData.isFeatured = parseBoolean(
        updateData.isFeatured,
        existingPackage.isFeatured,
      );
    }

    /*
     * Active
     */
    if (Object.prototype.hasOwnProperty.call(updateData, "isActive")) {
      updateData.isActive = parseBoolean(
        updateData.isActive,
        existingPackage.isActive,
      );
    }

    /*
     * Keep track of old Cloudinary images
     * before changing the database.
     */
    const oldCoverPublicId = existingPackage.coverImage?.publicId || "";

    const oldGalleryPublicIds = Array.isArray(existingPackage.gallery)
      ? existingPackage.gallery.map((image) => image?.publicId).filter(Boolean)
      : [];

    const oldPublicIds = [oldCoverPublicId, ...oldGalleryPublicIds].filter(
      Boolean,
    );

    /*
     * Update MongoDB.
     */
    const updatedPackage = await Package.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPackage) {
      return NextResponse.json(
        {
          success: false,
          message: "Package not found",
        },
        { status: 404 },
      );
    }

    /*
     * Find images that are no longer referenced
     * by the updated package.
     */
    const newPublicIds = getPackageImagePublicIds(updatedPackage);

    const removedPublicIds = oldPublicIds.filter(
      (publicId) => !newPublicIds.includes(publicId),
    );

    /*
     * Cloudinary cleanup is best effort.
     * MongoDB update has already succeeded.
     */
    if (removedPublicIds.length > 0) {
      await deleteCloudinaryImages(removedPublicIds);
    }

    /*
     * Return populated package.
     */
    const packageData = await populatePackage(id);

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

    /*
     * Load package before deleting so we
     * can collect Cloudinary public IDs.
     */
    const packageData = await Package.findById(id);

    if (!packageData) {
      return NextResponse.json(
        {
          success: false,
          message: "Package not found",
        },
        { status: 404 },
      );
    }

    const publicIds = getPackageImagePublicIds(packageData);

    /*
     * Permanently delete from MongoDB.
     */
    await Package.findByIdAndDelete(id);

    /*
     * Permanently remove associated
     * Cloudinary images.
     */
    if (publicIds.length > 0) {
      await deleteCloudinaryImages(publicIds);
    }

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("DELETE package error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to delete package",
      },
      { status: 500 },
    );
  }
}
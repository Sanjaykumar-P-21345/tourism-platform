import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Restaurant } from "@/utils/schema";

import { requireAdmin } from "@/utils/adminAuth";
import cloudinary from "@/utils/cloudinary";

/* ================================================================
   CONSTANTS
================================================================ */

const ALLOWED_PRICE_RANGES = ["budget", "moderate", "expensive"];

const ALLOWED_FOOD_TYPES = ["veg", "non-veg", "both"];

/* ================================================================
   IMAGE HELPERS
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

/* ================================================================
   STRING ARRAY HELPER
================================================================ */

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

/* ================================================================
   COORDINATE HELPER
================================================================ */

function parseCoordinate(value, fieldName) {
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
   CLOUDINARY PUBLIC IDS
================================================================ */

function getImagePublicIds(restaurant) {
  const publicIds = [];

  if (restaurant?.coverImage?.publicId) {
    publicIds.push(restaurant.coverImage.publicId);
  }

  if (Array.isArray(restaurant?.gallery)) {
    for (const image of restaurant.gallery) {
      if (image?.publicId) {
        publicIds.push(image.publicId);
      }
    }
  }

  return [...new Set(publicIds)];
}

/* ================================================================
   CLOUDINARY CLEANUP
================================================================ */

async function deleteCloudinaryImages(publicIds) {
  if (!publicIds.length) {
    return;
  }

  for (const publicId of publicIds) {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
    } catch (error) {
      console.error(`Failed to delete Cloudinary image ${publicId}:`, error);
    }
  }
}

/* ================================================================
   GET SINGLE RESTAURANT
================================================================ */

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
          message: "Invalid restaurant ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const restaurant = await Restaurant.findById(id)
      .populate("destination", "name slug")
      .lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("GET restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch restaurant",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   UPDATE RESTAURANT
================================================================ */

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
          message: "Invalid restaurant ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    /* ------------------------------------------------------------
       LOAD EXISTING RESTAURANT
    ------------------------------------------------------------ */

    const existingRestaurant = await Restaurant.findById(id);

    if (!existingRestaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    /* ------------------------------------------------------------
       ALLOWED FIELDS
    ------------------------------------------------------------ */

    const allowedFields = [
      "destination",
      "name",
      "slug",
      "description",
      "cuisines",
      "foodType",
      "priceRange",
      "popularDishes",
      "openingTime",
      "closingTime",
      "address",
      "latitude",
      "longitude",
      "contactPhone",
      "website",
      "coverImage",
      "gallery",
      "rating",
      "isFeatured",
      "isActive",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    /* ------------------------------------------------------------
       DESTINATION
    ------------------------------------------------------------ */

    if (updateData.destination !== undefined) {
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

    /* ------------------------------------------------------------
       NAME
    ------------------------------------------------------------ */

    if (updateData.name !== undefined) {
      updateData.name = String(updateData.name).trim();

      if (!updateData.name) {
        return NextResponse.json(
          {
            success: false,
            message: "Restaurant name is required",
          },
          { status: 400 },
        );
      }
    }

    /* ------------------------------------------------------------
       SLUG
    ------------------------------------------------------------ */

    if (updateData.slug !== undefined) {
      updateData.slug = String(updateData.slug).trim().toLowerCase();

      if (!updateData.slug) {
        return NextResponse.json(
          {
            success: false,
            message: "Restaurant slug is required",
          },
          { status: 400 },
        );
      }

      const duplicate = await Restaurant.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      }).lean();

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Restaurant slug already exists",
          },
          { status: 409 },
        );
      }
    }

    /* ------------------------------------------------------------
       DESCRIPTION
    ------------------------------------------------------------ */

    if (updateData.description !== undefined) {
      updateData.description = String(updateData.description).trim();

      if (!updateData.description) {
        return NextResponse.json(
          {
            success: false,
            message: "Restaurant description is required",
          },
          { status: 400 },
        );
      }
    }

    /* ------------------------------------------------------------
       CUISINES
    ------------------------------------------------------------ */

    if (updateData.cuisines !== undefined) {
      updateData.cuisines = normalizeStringArray(updateData.cuisines);
    }

    /* ------------------------------------------------------------
       FOOD TYPE
    ------------------------------------------------------------ */

    if (updateData.foodType !== undefined) {
      if (!ALLOWED_FOOD_TYPES.includes(updateData.foodType)) {
        return NextResponse.json(
          {
            success: false,
            message: "Food type must be veg, non-veg or both",
          },
          { status: 400 },
        );
      }
    }

    /* ------------------------------------------------------------
       PRICE RANGE
    ------------------------------------------------------------ */

    if (updateData.priceRange !== undefined) {
      if (!ALLOWED_PRICE_RANGES.includes(updateData.priceRange)) {
        return NextResponse.json(
          {
            success: false,
            message: "Price range must be budget, moderate or expensive",
          },
          { status: 400 },
        );
      }
    }

    /* ------------------------------------------------------------
       POPULAR DISHES
    ------------------------------------------------------------ */

    if (updateData.popularDishes !== undefined) {
      updateData.popularDishes = normalizeStringArray(updateData.popularDishes);
    }

    /* ------------------------------------------------------------
       TEXT FIELDS
    ------------------------------------------------------------ */

    const textFields = [
      "openingTime",
      "closingTime",
      "address",
      "contactPhone",
      "website",
    ];

    for (const field of textFields) {
      if (updateData[field] !== undefined) {
        updateData[field] = String(updateData[field] || "").trim();
      }
    }

    /* ------------------------------------------------------------
       COVER IMAGE
    ------------------------------------------------------------ */

    if (updateData.coverImage !== undefined) {
      const image = normalizeImage(updateData.coverImage);

      if (!image) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid cover image with Cloudinary publicId is required",
          },
          { status: 400 },
        );
      }

      updateData.coverImage = image;
    }

    /* ------------------------------------------------------------
       GALLERY
    ------------------------------------------------------------ */

    if (updateData.gallery !== undefined) {
      updateData.gallery = normalizeGallery(updateData.gallery);
    }

    /* ------------------------------------------------------------
       RATING
    ------------------------------------------------------------ */

    if (updateData.rating !== undefined) {
      const rating = Number(updateData.rating);

      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        return NextResponse.json(
          {
            success: false,
            message: "Rating must be between 0 and 5",
          },
          { status: 400 },
        );
      }

      updateData.rating = rating;
    }

    /* ------------------------------------------------------------
       LATITUDE
    ------------------------------------------------------------ */

    if (updateData.latitude !== undefined) {
      const result = parseCoordinate(updateData.latitude, "Latitude");

      if (result.error) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
          },
          { status: 400 },
        );
      }

      updateData.latitude = result.value;
    }

    /* ------------------------------------------------------------
       LONGITUDE
    ------------------------------------------------------------ */

    if (updateData.longitude !== undefined) {
      const result = parseCoordinate(updateData.longitude, "Longitude");

      if (result.error) {
        return NextResponse.json(
          {
            success: false,
            message: result.error,
          },
          { status: 400 },
        );
      }

      updateData.longitude = result.value;
    }

    /* ------------------------------------------------------------
       BOOLEAN VALUES
    ------------------------------------------------------------ */

    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(updateData.isFeatured);
    }

    if (updateData.isActive !== undefined) {
      updateData.isActive = Boolean(updateData.isActive);
    }

    /* ------------------------------------------------------------
       UPDATE DATABASE
    ------------------------------------------------------------ */

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedRestaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    /* ------------------------------------------------------------
       FIND REMOVED CLOUDINARY IMAGES
    ------------------------------------------------------------ */

    const oldPublicIds = getImagePublicIds(existingRestaurant);

    const newPublicIds = getImagePublicIds(updatedRestaurant);

    const newPublicIdSet = new Set(newPublicIds);

    const removedPublicIds = oldPublicIds.filter(
      (publicId) => !newPublicIdSet.has(publicId),
    );

    /* ------------------------------------------------------------
       CLEAN UP OLD CLOUDINARY IMAGES
    ------------------------------------------------------------ */

    await deleteCloudinaryImages(removedPublicIds);

    /* ------------------------------------------------------------
       RESPONSE
    ------------------------------------------------------------ */

    return NextResponse.json({
      success: true,
      message: "Restaurant updated successfully",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error("PUT restaurant error:", error);

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
        message: error?.message || "Failed to update restaurant",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   PERMANENT DELETE RESTAURANT
================================================================ */

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
          message: "Invalid restaurant ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    /* ------------------------------------------------------------
       FIND RESTAURANT FIRST
    ------------------------------------------------------------ */

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message: "Restaurant not found",
        },
        { status: 404 },
      );
    }

    /* ------------------------------------------------------------
       COLLECT CLOUDINARY IMAGES
    ------------------------------------------------------------ */

    const publicIds = getImagePublicIds(restaurant);

    /* ------------------------------------------------------------
       PERMANENT DATABASE DELETE
    ------------------------------------------------------------ */

    await Restaurant.findByIdAndDelete(id);

    /* ------------------------------------------------------------
       DELETE CLOUDINARY FILES
    ------------------------------------------------------------ */

    await deleteCloudinaryImages(publicIds);

    return NextResponse.json({
      success: true,
      message: "Restaurant deleted permanently",
    });
  } catch (error) {
    console.error("DELETE restaurant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete restaurant",
      },
      { status: 500 },
    );
  }
}
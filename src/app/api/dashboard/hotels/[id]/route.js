import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Destination, Hotel } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";
import cloudinary from "@/utils/cloudinary";

function normalizeImage(image) {
  if (!image) return null;

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
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery.map(normalizeImage).filter(Boolean);
}

function getImagePublicIds(hotel) {
  const ids = [];

  if (hotel?.coverImage?.publicId) {
    ids.push(hotel.coverImage.publicId);
  }

  if (Array.isArray(hotel?.gallery)) {
    for (const image of hotel.gallery) {
      if (image?.publicId) {
        ids.push(image.publicId);
      }
    }
  }

  return [...new Set(ids)];
}

async function deleteCloudinaryImages(publicIds) {
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
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
   GET SINGLE HOTEL
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
          message: "Invalid hotel ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const hotel = await Hotel.findById(id)
      .populate("destination", "name slug")
      .lean();

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error("GET hotel error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch hotel",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   PUT / UPDATE HOTEL
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
          message: "Invalid hotel ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const existingHotel = await Hotel.findById(id).lean();

    if (!existingHotel) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel not found",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const allowedFields = [
      "destination",
      "name",
      "slug",
      "description",
      "category",
      "pricePerNight",
      "amenities",
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
            message: "Hotel name is required",
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
            message: "Hotel slug is required",
          },
          { status: 400 },
        );
      }

      const duplicate = await Hotel.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message: "Hotel slug already exists",
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
            message: "Description is required",
          },
          { status: 400 },
        );
      }
    }

    /* ------------------------------------------------------------
       PRICE
    ------------------------------------------------------------ */

    if (updateData.pricePerNight !== undefined) {
      const minPrice = Number(updateData.pricePerNight?.min);

      const maxPrice = Number(updateData.pricePerNight?.max);

      if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid price values",
          },
          { status: 400 },
        );
      }

      if (minPrice < 0 || maxPrice < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Price cannot be negative",
          },
          { status: 400 },
        );
      }

      if (minPrice > maxPrice) {
        return NextResponse.json(
          {
            success: false,
            message: "Minimum price cannot be greater than maximum price",
          },
          { status: 400 },
        );
      }

      updateData.pricePerNight = {
        min: minPrice,
        max: maxPrice,
      };
    }

    /* ------------------------------------------------------------
       AMENITIES
    ------------------------------------------------------------ */

    if (updateData.amenities !== undefined) {
      updateData.amenities = Array.isArray(updateData.amenities)
        ? updateData.amenities
            .map((item) => String(item).trim())
            .filter(Boolean)
        : [];
    }

    /* ------------------------------------------------------------
       TEXT FIELDS
    ------------------------------------------------------------ */

    if (updateData.address !== undefined && updateData.address !== null) {
      updateData.address = String(updateData.address).trim();
    }

    if (
      updateData.contactPhone !== undefined &&
      updateData.contactPhone !== null
    ) {
      updateData.contactPhone = String(updateData.contactPhone).trim();
    }

    if (updateData.website !== undefined && updateData.website !== null) {
      updateData.website = String(updateData.website).trim();
    }

    /* ------------------------------------------------------------
       COORDINATES
    ------------------------------------------------------------ */

    if (updateData.latitude !== undefined) {
      if (updateData.latitude === "" || updateData.latitude === null) {
        updateData.latitude = undefined;
      } else {
        const latitude = Number(updateData.latitude);

        if (Number.isNaN(latitude)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid latitude",
            },
            { status: 400 },
          );
        }

        updateData.latitude = latitude;
      }
    }

    if (updateData.longitude !== undefined) {
      if (updateData.longitude === "" || updateData.longitude === null) {
        updateData.longitude = undefined;
      } else {
        const longitude = Number(updateData.longitude);

        if (Number.isNaN(longitude)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid longitude",
            },
            { status: 400 },
          );
        }

        updateData.longitude = longitude;
      }
    }

    /* ------------------------------------------------------------
       COVER IMAGE
    ------------------------------------------------------------ */

    if (updateData.coverImage !== undefined) {
      const normalizedCover = normalizeImage(updateData.coverImage);

      if (!normalizedCover?.url) {
        return NextResponse.json(
          {
            success: false,
            message: "Valid cover image is required",
          },
          { status: 400 },
        );
      }

      updateData.coverImage = normalizedCover;
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

    if (
      updateData.rating !== undefined &&
      updateData.rating !== null &&
      updateData.rating !== ""
    ) {
      const rating = Number(updateData.rating);

      if (Number.isNaN(rating) || rating < 0 || rating > 5) {
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
       BOOLEAN VALUES
    ------------------------------------------------------------ */

    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = Boolean(updateData.isFeatured);
    }

    if (updateData.isActive !== undefined) {
      updateData.isActive = Boolean(updateData.isActive);
    }

    /* ------------------------------------------------------------
       UPDATE
    ------------------------------------------------------------ */

    const hotel = await Hotel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel not found",
        },
        { status: 404 },
      );
    }

    /* ------------------------------------------------------------
       CLEAN UP REMOVED CLOUDINARY IMAGES
    ------------------------------------------------------------ */

    const oldImageIds = getImagePublicIds(existingHotel);

    const newImageIds = getImagePublicIds(hotel);

    const removedImageIds = oldImageIds.filter(
      (publicId) => !newImageIds.includes(publicId),
    );

    if (removedImageIds.length > 0) {
      await deleteCloudinaryImages(removedImageIds);
    }

    return NextResponse.json({
      success: true,
      message: "Hotel updated successfully",
      data: hotel,
    });
  } catch (error) {
    console.error("PUT hotel error:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel slug already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update hotel",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   DELETE / PERMANENT DELETE
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
          message: "Invalid hotel ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel not found",
        },
        { status: 404 },
      );
    }

    const imagePublicIds = getImagePublicIds(hotel);

    await Hotel.findByIdAndDelete(id);

    await deleteCloudinaryImages(imagePublicIds);

    return NextResponse.json({
      success: true,
      message: "Hotel deleted permanently",
    });
  } catch (error) {
    console.error("DELETE hotel error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete hotel",
      },
      { status: 500 },
    );
  }
}
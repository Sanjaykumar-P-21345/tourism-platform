import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { requireAdmin } from "@/utils/adminAuth";
import { Transportation, Destination } from "@/utils/schema";
import cloudinary from "@/utils/cloudinary";

const TRANSPORTATION_TYPES = [
  "flight",
  "train",
  "bus",
  "taxi",
  "car-rental",
  "bike-rental",
];

function cleanString(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value).trim();
}

function normalizeImage(image) {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    const url = image.trim();

    if (!url) {
      return null;
    }

    return {
      url,
      publicId: "",
    };
  }

  if (typeof image === "object" && image.url) {
    const url = String(image.url).trim();

    if (!url) {
      return null;
    }

    return {
      url,
      publicId: image.publicId ? String(image.publicId).trim() : "",
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

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : NaN;
}

function parseBoolean(value, defaultValue = true) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
}

function getPublicIds(item) {
  const ids = [];

  if (item?.coverImage?.publicId) {
    ids.push(item.coverImage.publicId);
  }

  if (Array.isArray(item?.gallery)) {
    item.gallery.forEach((image) => {
      if (image?.publicId) {
        ids.push(image.publicId);
      }
    });
  }

  return [...new Set(ids)];
}

async function deleteCloudinaryImages(publicIds) {
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

function validateCost(min, max) {
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return "Estimated cost must contain valid numbers";
  }

  if (min !== undefined && min < 0) {
    return "Minimum estimated cost cannot be negative";
  }

  if (max !== undefined && max < 0) {
    return "Maximum estimated cost cannot be negative";
  }

  if (min !== undefined && max !== undefined && min > max) {
    return "Minimum cost cannot be greater than maximum cost";
  }

  return null;
}

/* ================================================================
   GET ONE TRANSPORTATION
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
          message: "Invalid transportation ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const transportation = await Transportation.findById(id)
      .populate("destination", "name slug")
      .lean();

    if (!transportation) {
      return NextResponse.json(
        {
          success: false,
          message: "Transportation not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: transportation,
    });
  } catch (error) {
    console.error("Transportation GET by ID error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transportation",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   UPDATE TRANSPORTATION
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
          message: "Invalid transportation ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await Transportation.findById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Transportation not found",
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const update = {};

    /* Destination */
    if (body.destination !== undefined) {
      const destination = cleanString(body.destination);

      if (!destination) {
        return NextResponse.json(
          {
            success: false,
            message: "Destination is required",
          },
          { status: 400 },
        );
      }

      if (!mongoose.Types.ObjectId.isValid(destination)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid destination",
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
            message: "Selected destination was not found",
          },
          { status: 400 },
        );
      }

      update.destination = destination;
    }

    /* Type */
    if (body.type !== undefined) {
      const type = cleanString(body.type);

      if (!TRANSPORTATION_TYPES.includes(type)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid transportation type",
          },
          { status: 400 },
        );
      }

      update.type = type;
    }

    /* Required text fields */
    const requiredTextFields = ["providerName", "from", "to"];

    for (const field of requiredTextFields) {
      if (body[field] !== undefined) {
        const value = cleanString(body[field]);

        if (!value) {
          return NextResponse.json(
            {
              success: false,
              message: `${field} cannot be empty`,
            },
            { status: 400 },
          );
        }

        update[field] = value;
      }
    }

    /* Optional text fields */
    const optionalTextFields = [
      "description",
      "estimatedDuration",
      "schedule",
      "bookingUrl",
      "contactPhone",
    ];

    for (const field of optionalTextFields) {
      if (body[field] !== undefined) {
        update[field] = cleanString(body[field]) || "";
      }
    }

    /* Estimated cost */
    if (body.estimatedCost !== undefined) {
      const min = parseOptionalNumber(body.estimatedCost?.min);

      const max = parseOptionalNumber(body.estimatedCost?.max);

      const costError = validateCost(min, max);

      if (costError) {
        return NextResponse.json(
          {
            success: false,
            message: costError,
          },
          { status: 400 },
        );
      }

      update.estimatedCost = {
        ...(min !== undefined ? { min } : {}),
        ...(max !== undefined ? { max } : {}),
      };
    }

    /* Cover image */
    if (body.coverImage !== undefined) {
      update.coverImage = normalizeImage(body.coverImage);
    }

    /* Gallery */
    if (body.gallery !== undefined) {
      update.gallery = normalizeGallery(body.gallery);
    }

    /* Active status */
    if (body.isActive !== undefined) {
      update.isActive = parseBoolean(body.isActive);
    }

    const oldPublicIds = getPublicIds(existing);

    const updated = await Transportation.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("destination", "name slug")
      .lean();

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: "Transportation not found",
        },
        { status: 404 },
      );
    }

    /*
      Delete only images that were actually removed
      after MongoDB has successfully updated.
    */
    if (body.coverImage !== undefined || body.gallery !== undefined) {
      const newPublicIds = getPublicIds(updated);

      const removedPublicIds = oldPublicIds.filter(
        (publicId) => !newPublicIds.includes(publicId),
      );

      if (removedPublicIds.length > 0) {
        await deleteCloudinaryImages(removedPublicIds);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Transportation updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Transportation PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update transportation",
      },
      { status: 500 },
    );
  }
}

/* ================================================================
   PERMANENT DELETE
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
          message: "Invalid transportation ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const transportation = await Transportation.findById(id);

    if (!transportation) {
      return NextResponse.json(
        {
          success: false,
          message: "Transportation not found",
        },
        { status: 404 },
      );
    }

    const publicIds = getPublicIds(transportation);

    /*
      Delete MongoDB record first.
      Cloudinary cleanup is best-effort.
    */
    await Transportation.findByIdAndDelete(id);

    if (publicIds.length > 0) {
      await deleteCloudinaryImages(publicIds);
    }

    return NextResponse.json({
      success: true,
      message: "Transportation permanently deleted",
    });
  } catch (error) {
    console.error("Transportation DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete transportation",
      },
      { status: 500 },
    );
  }
}

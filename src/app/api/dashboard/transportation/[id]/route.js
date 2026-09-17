import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/utils/mongodb";
import { Destination, Transportation } from "@/utils/schema";
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

function normalizeNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
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
    console.error("GET transportation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transportation",
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
          message: "Invalid transportation ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const body = await request.json();

    const allowedTypes = [
      "flight",
      "train",
      "bus",
      "taxi",
      "car-rental",
      "bike-rental",
    ];

    const updateData = {};

    const allowedFields = [
      "destination",
      "type",
      "providerName",
      "from",
      "to",
      "description",
      "estimatedDuration",
      "schedule",
      "bookingUrl",
      "contactPhone",
      "isActive",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.type !== undefined) {
      if (!allowedTypes.includes(updateData.type)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid transportation type. Allowed values: ${allowedTypes.join(
              ", ",
            )}`,
          },
          { status: 400 },
        );
      }
    }

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

    if (updateData.providerName !== undefined) {
      updateData.providerName = updateData.providerName.trim();
    }

    if (updateData.from !== undefined) {
      updateData.from = updateData.from.trim();
    }

    if (updateData.to !== undefined) {
      updateData.to = updateData.to.trim();
    }

    if (updateData.description !== undefined) {
      updateData.description = updateData.description.trim();
    }

    if (updateData.estimatedDuration !== undefined) {
      updateData.estimatedDuration =
        updateData.estimatedDuration?.trim() || undefined;
    }

    if (updateData.schedule !== undefined) {
      updateData.schedule = updateData.schedule?.trim() || undefined;
    }

    if (updateData.bookingUrl !== undefined) {
      updateData.bookingUrl = updateData.bookingUrl?.trim() || undefined;
    }

    if (updateData.contactPhone !== undefined) {
      updateData.contactPhone = updateData.contactPhone?.trim() || undefined;
    }

    if (body.estimatedCost !== undefined) {
      const minCost = normalizeNumber(body.estimatedCost?.min);
      const maxCost = normalizeNumber(body.estimatedCost?.max);

      if (minCost !== undefined && maxCost !== undefined && minCost > maxCost) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Minimum estimated cost cannot be greater than maximum cost",
          },
          { status: 400 },
        );
      }

      updateData.estimatedCost = {
        min: minCost,
        max: maxCost,
      };
    }

    if (body.coverImage !== undefined) {
      updateData.coverImage = normalizeImage(body.coverImage);
    }

    if (body.gallery !== undefined) {
      updateData.gallery = normalizeGallery(body.gallery);
    }

    const transportation = await Transportation.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

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
      message: "Transportation updated successfully",
      data: transportation,
    });
  } catch (error) {
    console.error("PUT transportation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update transportation",
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
          message: "Invalid transportation ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const transportation = await Transportation.findByIdAndUpdate(
      id,
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: true,
      },
    );

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
      message: "Transportation deactivated successfully",
      data: transportation,
    });
  } catch (error) {
    console.error("DELETE transportation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to deactivate transportation",
      },
      { status: 500 },
    );
  }
}
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

export async function GET(
  request,
  { params }
) {
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

    const { id } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid hotel ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const hotel = await Hotel.findById(id)
      .populate(
        "destination",
        "name slug"
      )
      .lean();

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error(
      "GET hotel error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch hotel",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request,
  { params }
) {
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

    const { id } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid hotel ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

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
        updateData[field] =
          body[field];
      }
    }

    if (
      updateData.destination !==
      undefined
    ) {
      if (
        !mongoose.Types.ObjectId.isValid(
          updateData.destination
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

      const exists =
        await Destination.exists({
          _id: updateData.destination,
        });

      if (!exists) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Destination not found",
          },
          { status: 404 }
        );
      }
    }

    if (
      updateData.name !== undefined
    ) {
      updateData.name = String(
        updateData.name
      ).trim();
    }

    if (
      updateData.slug !== undefined
    ) {
      updateData.slug = String(
        updateData.slug
      )
        .trim()
        .toLowerCase();

      const duplicate =
        await Hotel.findOne({
          slug: updateData.slug,
          _id: { $ne: id },
        });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Hotel slug already exists",
          },
          { status: 409 }
        );
      }
    }

    if (
      updateData.description !==
      undefined
    ) {
      updateData.description =
        String(
          updateData.description
        ).trim();
    }

    if (
      updateData.pricePerNight !==
      undefined
    ) {
      const minPrice = Number(
        updateData.pricePerNight?.min
      );

      const maxPrice = Number(
        updateData.pricePerNight?.max
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

      if (
        minPrice < 0 ||
        maxPrice < 0
      ) {
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

      updateData.pricePerNight = {
        min: minPrice,
        max: maxPrice,
      };
    }

    if (
      updateData.amenities !==
      undefined
    ) {
      updateData.amenities =
        Array.isArray(
          updateData.amenities
        )
          ? updateData.amenities
              .map((item) =>
                String(item).trim()
              )
              .filter(Boolean)
          : [];
    }

    if (
      updateData.address !==
      undefined &&
      updateData.address !== null
    ) {
      updateData.address =
        String(
          updateData.address
        ).trim();
    }

    if (
      updateData.contactPhone !==
        undefined &&
      updateData.contactPhone !==
        null
    ) {
      updateData.contactPhone =
        String(
          updateData.contactPhone
        ).trim();
    }

    if (
      updateData.website !==
        undefined &&
      updateData.website !==
        null
    ) {
      updateData.website =
        String(
          updateData.website
        ).trim();
    }

    if (
      updateData.coverImage !==
      undefined
    ) {
      const normalizedCover =
        normalizeImage(
          updateData.coverImage
        );

      if (!normalizedCover?.url) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Valid cover image is required",
          },
          { status: 400 }
        );
      }

      updateData.coverImage =
        normalizedCover;
    }

    if (
      updateData.gallery !==
      undefined
    ) {
      updateData.gallery =
        normalizeGallery(
          updateData.gallery
        );
    }

    if (
      updateData.rating !==
        undefined &&
      updateData.rating !==
        null &&
      updateData.rating !== ""
    ) {
      const rating = Number(
        updateData.rating
      );

      if (
        Number.isNaN(rating) ||
        rating < 0 ||
        rating > 5
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

      updateData.rating =
        rating;
    }

    const hotel =
      await Hotel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Hotel updated successfully",
      data: hotel,
    });
  } catch (error) {
    console.error(
      "PUT hotel error:",
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
          "Failed to update hotel",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request,
  { params }
) {
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

    const { id } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid hotel ID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const hotel =
      await Hotel.findByIdAndUpdate(
        id,
        {
          isActive: false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Hotel deactivated successfully",
      data: hotel,
    });
  } catch (error) {
    console.error(
      "DELETE hotel error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to deactivate hotel",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Place } from "@/utils/schema";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Place identifier is required.",
        },
        { status: 400 },
      );
    }

    const query = mongoose.isValidObjectId(slug)
      ? {
          _id: slug,
          status: "active",
        }
      : {
          slug,
          status: "active",
        };

    const place = await Place.findOne(query)
      .populate("destinationId", "name slug description")
      .lean();

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          message: "Place not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: place,
    });
  } catch (error) {
    console.error("Public Place Details API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch place details.",
      },
      { status: 500 },
    );
  }
}
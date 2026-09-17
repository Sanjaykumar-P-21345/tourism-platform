
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Hotel } from "@/utils/schema";

/* =========================================================
   GET - PUBLIC HOTEL DETAILS
   ========================================================= */

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel identifier is required.",
        },
        {
          status: 400,
        },
      );
    }

    const query = mongoose.isValidObjectId(slug)
      ? {
          _id: slug,
          isActive: true,
        }
      : {
          slug: slug.toLowerCase(),
          isActive: true,
        };

    const hotel = await Hotel.findOne(query)
      .populate(
        "destination",
        "name slug description state country",
      )
      .lean();

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          message: "Hotel not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error("Public Hotel Details API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch hotel details.",
      },
      {
        status: 500,
      },
    );
  }
}
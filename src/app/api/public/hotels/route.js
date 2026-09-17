
import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { Hotel } from "@/utils/schema";

/* =========================================================
   GET - PUBLIC HOTELS
   ========================================================= */

export async function GET() {
  try {
    await connectDB();

    const hotels = await Hotel.find({
      isActive: true,
    })
      .populate("destination", "name slug")
      .sort({
        isFeatured: -1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      data: hotels,
    });
  } catch (error) {
    console.error("Public Hotels API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch hotels.",
      },
      {
        status: 500,
      },
    );
  }
}
import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { Place } from "@/utils/schema";

export async function GET() {
  try {
    await connectDB();

    const places = await Place.find({
      status: "active",
    })
      .populate("destinationId", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.error("Public Places API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch places.",
      },
      { status: 500 },
    );
  }
}
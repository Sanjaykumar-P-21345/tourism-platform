
import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { Package } from "@/utils/schema";

export async function GET() {
  try {
    await connectDB();

    const packages = await Package.find({
      isActive: true,
    })
      .populate("destination", "name slug")
      .select(
        "_id name title slug description duration price estimatedCost coverImage gallery destination"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: packages.length,
        data: packages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Public packages API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load packages.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { Destination } from "@/utils/schema";

export async function GET() {
  try {
    await connectDB();

    const destinations = await Destination.find({
      isActive: true,
    })
      .select(
        "_id name slug description state country coverImage gallery"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: destinations.length,
        data: destinations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Public destinations API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load destinations.",
      },
      { status: 500 }
    );
  }
}
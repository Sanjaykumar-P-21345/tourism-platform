
import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { Destination } from "@/utils/schema";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    const destination = await Destination.findOne({
      slug,
      isActive: true,
    }).lean();

    if (!destination) {
      return NextResponse.json(
        {
          success: false,
          message: "Destination not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: destination,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Destination detail API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load destination.",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { Package } from "@/utils/schema";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    const packageData = await Package.findOne({
      slug,
      isActive: true,
    })
      .populate("destination", "name slug state country")
      .lean();

    if (!packageData) {
      return NextResponse.json(
        {
          success: false,
          message: "Package not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: packageData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Package detail API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load package.",
      },
      { status: 500 }
    );
  }
}
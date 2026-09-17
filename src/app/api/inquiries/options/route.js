
import { NextResponse } from "next/server";
import connectDB from "@/utils/mongodb";
import { Destination, Package } from "@/utils/schema";

export async function GET() {
  try {
    await connectDB();

    const [destinations, packages] = await Promise.all([
      Destination.find({})
        .select("_id name")
        .sort({ name: 1 })
        .lean(),

      Package.find({})
        .select("_id name title")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          destinations,
          packages,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Inquiry options error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load inquiry options.",
      },
      { status: 500 },
    );
  }
}
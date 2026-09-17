
import { NextResponse } from "next/server";
import connectDB from "@/utils/mongodb";
import { Inquiry } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

// GET — Fetch all inquiries
export async function GET(request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin access required.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const inquiries = await Inquiry.find(filter)
      .populate("packageId", "name title")
      .populate("destinationId", "name title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: inquiries.length,
        data: inquiries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Inquiries Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch inquiries.",
      },
      { status: 500 }
    );
  }
}
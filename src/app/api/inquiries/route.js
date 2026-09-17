import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Inquiry } from "@/utils/schema";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, email, phone, subject, message, packageId, destinationId } =
      body;

    // Required field validation
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, phone, and message are required.",
        },
        { status: 400 },
      );
    }

    // Validate ObjectId values
    if (packageId && !mongoose.isValidObjectId(packageId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid package ID.",
        },
        { status: 400 },
      );
    }

    if (destinationId && !mongoose.isValidObjectId(destinationId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination ID.",
        },
        { status: 400 },
      );
    }

    // Create inquiry
    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject?.trim() || "",
      message: message.trim(),
      packageId: packageId || null,
      destinationId: destinationId || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry submitted successfully.",
        data: inquiry,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Inquiry Error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: Object.values(error.errors)
            .map((item) => item.message)
            .join(", "),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit inquiry.",
      },
      { status: 500 },
    );
  }
}

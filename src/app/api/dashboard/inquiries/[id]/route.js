import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/utils/mongodb";
import { Inquiry } from "@/utils/schema";
import { requireAdmin } from "@/utils/adminAuth";

/* =========================================================
   PATCH - UPDATE INQUIRY
========================================================= */

export async function PATCH(request, { params }) {
  try {
    // 1. Verify admin authentication
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Admin access required.",
        },
        { status: 401 },
      );
    }

    // 2. Connect to database
    await connectDB();

    // 3. Get inquiry ID
    const { id } = await params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid inquiry ID.",
        },
        { status: 400 },
      );
    }

    // 4. Read request body
    const body = await request.json();

    const allowedFields = [
      "status",
      "isRead",
      "adminNote",
    ];

    const updateData = {};

    // 5. Accept only permitted fields
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updateData[field] = body[field];
      }
    }

    // 6. Validate status
    const allowedStatuses = [
      "new",
      "contacted",
      "resolved",
      "archived",
    ];

    if (
      updateData.status &&
      !allowedStatuses.includes(updateData.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid inquiry status.",
        },
        { status: 400 },
      );
    }

    // 7. Validate isRead
    if (
      Object.prototype.hasOwnProperty.call(updateData, "isRead") &&
      typeof updateData.isRead !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "isRead must be a boolean value.",
        },
        { status: 400 },
      );
    }

    // 8. Validate adminNote
    if (
      Object.prototype.hasOwnProperty.call(updateData, "adminNote")
    ) {
      if (typeof updateData.adminNote !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Admin note must be a string.",
          },
          { status: 400 },
        );
      }

      updateData.adminNote = updateData.adminNote.trim();
    }

    // 9. Check update data
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields provided for update.",
        },
        { status: 400 },
      );
    }

    // 10. Update inquiry
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("packageId", "name title slug")
      .populate("destinationId", "name slug")
      .lean();

    // 11. Check inquiry existence
    if (!updatedInquiry) {
      return NextResponse.json(
        {
          success: false,
          message: "Inquiry not found.",
        },
        { status: 404 },
      );
    }

    // 12. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Inquiry updated successfully.",
        data: updatedInquiry,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update Inquiry Error:", error);

    // Mongoose validation error
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
        message: "Failed to update inquiry.",
      },
      { status: 500 },
    );
  }
}
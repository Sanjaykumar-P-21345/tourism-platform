import { NextResponse } from "next/server";

import connectDB from "@/utils/mongodb";
import { Review } from "@/utils/schema";
import { sendEmail } from "@/utils/email";
import { reviewEmailTemplate } from "@/utils/emailTemplates";

/* =========================================================
   HELPER: ESCAPE HTML
========================================================= */

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   POST - SUBMIT REVIEW
========================================================= */

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      email,
      rating,
      review,
      destinationId,
      packageId,
    } = body;

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!name || !email || !rating || !review) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, rating, and review are required.",
        },
        { status: 400 },
      );
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be a whole number between 1 and 5.",
        },
        { status: 400 },
      );
    }

    if (String(review).trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Review must contain at least 10 characters.",
        },
        { status: 400 },
      );
    }

    /* -------------------------------------------------------
       CREATE REVIEW
    ------------------------------------------------------- */

    const newReview = await Review.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      rating: numericRating,
      review: String(review).trim(),
      destinationId: destinationId || null,
      packageId: packageId || null,
      status: "pending",
    });

    /* -------------------------------------------------------
       PREPARE SAFE EMAIL DATA
    ------------------------------------------------------- */

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeReview = escapeHtml(review);

    /* -------------------------------------------------------
       SEND ADMIN EMAIL
    ------------------------------------------------------- */

    const emailResult = await sendEmail({
      to: process.env.ADMIN_EMAIL,

      subject: `New Review Submitted by ${name}`,

      text: `
New Review Submitted

Visitor Name: ${name}
Visitor Email: ${email}
Rating: ${numericRating}/5

Review:
${review}

Review Status: Pending
      `,

      html: reviewEmailTemplate({
        name: safeName,
        email: safeEmail,
        rating: numericRating,
        review: safeReview,
        targetName: "Tourism Destination / Package",
      }),
    });

    if (!emailResult.success) {
      console.error(
        "Review email notification failed:",
        emailResult.error,
      );
    }

    /* -------------------------------------------------------
       RESPONSE
    ------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,
        message:
          "Review submitted successfully. It will be published after approval.",
        emailSent: emailResult.success,
        data: newReview,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Review Error:", error);

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
        message: "Failed to submit review.",
      },
      { status: 500 },
    );
  }
}
/* =========================================================
   REVIEW EMAIL TEMPLATE
========================================================= */

export function reviewEmailTemplate({
  name,
  email,
  rating,
  review,
  targetName,
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>New Review Submitted</title>
      </head>

      <body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial,sans-serif;">
        <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:12px; overflow:hidden;">

          <div style="background:#4f46e5; padding:24px; color:#ffffff;">
            <h2 style="margin:0;">New Review Submitted</h2>
            <p style="margin:8px 0 0;">
              Explore India Admin Notification
            </p>
          </div>

          <div style="padding:24px;">
            <h3>Visitor Details</h3>

            <p>
              <strong>Name:</strong> ${name}
            </p>

            <p>
              <strong>Email:</strong> ${email}
            </p>

            <p>
              <strong>Destination/Package:</strong> ${targetName}
            </p>

            <p>
              <strong>Rating:</strong> ${rating}/5 ⭐
            </p>

            <h3>Review Message</h3>

            <div style="background:#f9fafb; padding:16px; border-radius:8px;">
              ${review}
            </div>

            <p style="margin-top:24px; color:#6b7280;">
              Review Status: Pending Approval
            </p>

            <p style="color:#6b7280;">
              Please check your admin dashboard.
            </p>
          </div>

          <div style="background:#f9fafb; padding:16px; text-align:center; color:#6b7280;">
            Explore India Tourism Management System
          </div>

        </div>
      </body>
    </html>
  `;
}
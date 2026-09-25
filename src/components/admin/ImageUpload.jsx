"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload, X } from "lucide-react";

import { getToken } from "@/utils/api";

export default function ImageUpload({
  label = "Image",
  required = false,
  value = null,
  onChange,
  folder = "tourism/uploads",
  disabled = false,
  className = "",
}) {
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const imageUrl = typeof value === "string" ? value : value?.url || "";

  const publicId = typeof value === "object" ? value?.publicId || "" : "";

  /* ============================================================
     ERROR MESSAGE HELPER
  ============================================================ */

  function getErrorMessage(data, fallback) {
    if (!data) {
      return fallback;
    }

    if (typeof data === "string") {
      return data.trim() || fallback;
    }

    return data?.message || data?.error || data?.details || fallback;
  }

  /* ============================================================
     SAFE RESPONSE READER
  ============================================================ */

  async function readResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    const text = await response.text();

    /*
     * Empty response body.
     */
    if (!text.trim()) {
      return null;
    }

    /*
     * JSON response.
     */
    if (contentType.toLowerCase().includes("application/json")) {
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON response:", error);

        throw new Error(`Server returned invalid JSON (${response.status}).`);
      }
    }

    /*
     * Sometimes APIs return JSON without the
     * correct content-type.
     */
    try {
      return JSON.parse(text);
    } catch {
      /*
       * Could be HTML/text from Next.js or another
       * server error.
       */
      return text;
    }
  }

  /* ============================================================
     UPLOAD
  ============================================================ */

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    /*
     * Allow selecting the same image again later.
     */
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");

    /* ------------------------------------------------------------
       FILE TYPE
    ------------------------------------------------------------ */

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, WEBP and GIF images are allowed.");
      return;
    }

    /* ------------------------------------------------------------
       FILE SIZE
    ------------------------------------------------------------ */

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image size cannot exceed 10 MB.");
      return;
    }

    /* ------------------------------------------------------------
       AUTH
    ------------------------------------------------------------ */

    const token = getToken();

    if (!token) {
      setError("Admin session is missing. Please log in again.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, `Image upload failed (${response.status}).`),
        );
      }

      if (!data?.success) {
        throw new Error(getErrorMessage(data, "Image upload failed."));
      }

      if (!data?.image?.url) {
        throw new Error("Upload completed but no image URL was returned.");
      }

      onChange?.({
        url: data.image.url,
        publicId: data.image.publicId || "",
      });
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);

      setError(uploadError?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  /* ============================================================
     REMOVE
  ============================================================ */

  async function handleRemove() {
    if (removing || uploading || disabled) {
      return;
    }

    setError("");

    /*
     * If there is no publicId, there is nothing to
     * delete from Cloudinary.
     *
     * Just remove the image from the form.
     */
    if (!publicId) {
      onChange?.(null);
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Admin session is missing. Please log in again.");
      return;
    }

    setRemoving(true);

    try {
      const response = await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId,
        }),
      });

      /*
       * IMPORTANT:
       *
       * Never use response.json() directly.
       *
       * The endpoint may return:
       * - JSON
       * - empty body
       * - plain text
       * - HTML error response
       */
      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, `Failed to delete image (${response.status}).`),
        );
      }

      /*
       * If the server returned JSON and explicitly
       * says success:false, treat it as an error.
       *
       * Empty 2xx response is accepted.
       */
      if (data && typeof data === "object" && data.success === false) {
        throw new Error(getErrorMessage(data, "Failed to delete image."));
      }

      /*
       * Cloudinary deletion succeeded.
       *
       * Now remove the image from the form state.
       */
      onChange?.(null);
    } catch (removeError) {
      console.error("Image delete error:", removeError);

      setError(removeError?.message || "Failed to delete image.");
    } finally {
      setRemoving(false);
    }
  }

  /* ============================================================
     FILE PICKER
  ============================================================ */

  function openFilePicker() {
    if (disabled || uploading || removing) {
      return;
    }

    inputRef.current?.click();
  }

  return (
    <div className={className}>
      {/* ========================================================
          LABEL
      ======================================================== */}

      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-slate-700">
          {label}

          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>

        {imageUrl ? (
          <span className="text-xs font-medium text-emerald-600">
            Image selected
          </span>
        ) : null}
      </div>

      {/* ========================================================
          FILE INPUT
      ======================================================== */}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        disabled={disabled || uploading || removing}
        className="hidden"
      />

      {/* ========================================================
          IMAGE PREVIEW
      ======================================================== */}

      {imageUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-slate-50">
          <img
            src={imageUrl}
            alt={label}
            className="h-64 w-full object-cover sm:h-72"
          />

          {/* IMAGE ACTIONS */}

          <div className="absolute right-3 top-3 flex items-center gap-2">
            {/* REPLACE */}

            <button
              type="button"
              onClick={openFilePicker}
              disabled={disabled || uploading || removing}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/70 bg-white/95 px-3 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              Replace
            </button>

            {/* REMOVE */}

            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading || removing}
              title="Remove image"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white/95 text-red-600 shadow-sm backdrop-blur transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {removing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>

          {/* UPLOAD OVERLAY */}

          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg">
                <Loader2 size={17} className="animate-spin text-emerald-600" />
                Uploading...
              </div>
            </div>
          ) : null}

          {/* REMOVE OVERLAY */}

          {removing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg">
                <Loader2 size={17} className="animate-spin text-red-600" />
                Removing...
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* ======================================================
           EMPTY UPLOAD AREA
        ====================================================== */

        <button
          type="button"
          onClick={openFilePicker}
          disabled={disabled || uploading || removing}
          className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-emerald-600" />

              <span className="mt-3 text-sm font-semibold text-slate-700">
                Uploading image...
              </span>

              <span className="mt-1 text-xs text-slate-400">Please wait</span>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ImagePlus size={24} />
              </div>

              <span className="mt-3 text-sm font-semibold text-slate-700">
                Upload {label}
              </span>

              <span className="mt-1 text-xs text-slate-400">
                JPG, PNG, WEBP or GIF · Max 10 MB
              </span>
            </>
          )}
        </button>
      )}

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
          <X size={15} className="mt-0.5 shrink-0 text-red-500" />

          <p className="text-xs leading-5 text-red-700">{error}</p>
        </div>
      ) : null}
    </div>
  );
}

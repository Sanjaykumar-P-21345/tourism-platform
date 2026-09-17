"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { getToken } from "@/utils/api";

export default function ImageUpload({
  value = null,
  onChange,
  folder = "tourism/general",
  label = "Cover Image",
  required = false,
}) {
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const imageUrl = value?.url || "";

  const handleSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setUploading(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin session not found. Please log in again."
        );
      }

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

      const data = await response.json();

      if (response.status === 401) {
        throw new Error(
          "Your admin session has expired. Please log in again."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Image upload failed");
      }

      onChange?.(data.image);
    } catch (err) {
      console.error("Image upload error:", err);

      setError(
        err?.message || "Image upload failed"
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!value?.publicId) {
      onChange?.(null);
      return;
    }

    try {
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin session not found. Please log in again."
        );
      }

      const response = await fetch("/api/upload/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          publicId: value.publicId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to delete image"
        );
      }

      onChange?.(null);
    } catch (err) {
      console.error("Image delete error:", err);

      setError(
        err?.message || "Failed to delete image"
      );
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {imageUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <img
            src={imageUrl}
            alt={label}
            className="h-64 w-full object-cover"
          />

          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
            title="Delete image"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-64 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2
                className="mb-3 animate-spin"
                size={32}
              />

              <span className="text-sm text-gray-600">
                Uploading image...
              </span>
            </>
          ) : (
            <>
              <ImagePlus
                className="mb-3"
                size={36}
              />

              <span className="text-sm font-medium text-gray-700">
                Upload Image
              </span>

              <span className="mt-1 text-xs text-gray-500">
                JPG, PNG, WEBP or GIF • Max 10MB
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
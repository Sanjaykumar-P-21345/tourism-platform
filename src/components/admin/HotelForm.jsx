"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/utils/adminApi";
import ImageUpload from "@/components/admin/ImageUpload";

export default function HotelForm({
  initialData = null,
  initialValues = null,
  hotelId = null,
  destinations = [],
  mode = "create",
  readOnly = false,
}) {
  const router = useRouter();

  const hotel = initialData || initialValues || null;

  const id = hotelId || hotel?._id || hotel?.id || null;

  const isReadOnly = readOnly || mode === "view";

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    destination: "",
    name: "",
    slug: "",
    description: "",
    category: "budget",
    priceMin: "",
    priceMax: "",
    amenities: "",
    address: "",
    latitude: "",
    longitude: "",
    contactPhone: "",
    website: "",
    coverImage: null,
    gallery: [],
    rating: "",
    isFeatured: false,
    isActive: true,
  });

  /*
   * Populate form when editing/viewing
   */
  useEffect(() => {
    if (!hotel) return;

    let normalizedCoverImage = null;

    if (hotel.coverImage) {
      if (typeof hotel.coverImage === "string") {
        normalizedCoverImage = {
          url: hotel.coverImage,
          publicId: "",
        };
      } else if (hotel.coverImage.url) {
        normalizedCoverImage = {
          url: hotel.coverImage.url,
          publicId: hotel.coverImage.publicId || "",
        };
      }
    }

    const normalizedGallery = Array.isArray(hotel.gallery)
      ? hotel.gallery
          .map((image) => {
            if (!image) return null;

            if (typeof image === "string") {
              return {
                url: image,
                publicId: "",
              };
            }

            if (image.url) {
              return {
                url: image.url,
                publicId: image.publicId || "",
              };
            }

            return null;
          })
          .filter(Boolean)
      : [];

    setFormData({
      destination: hotel.destination?._id || hotel.destination || "",

      name: hotel.name || "",

      slug: hotel.slug || "",

      description: hotel.description || "",

      category: hotel.category || "budget",

      priceMin: hotel.pricePerNight?.min ?? "",

      priceMax: hotel.pricePerNight?.max ?? "",

      amenities: Array.isArray(hotel.amenities)
        ? hotel.amenities.join("\n")
        : "",

      address: hotel.address || "",

      latitude: hotel.latitude ?? "",

      longitude: hotel.longitude ?? "",

      contactPhone: hotel.contactPhone || "",

      website: hotel.website || "",

      coverImage: normalizedCoverImage,

      gallery: normalizedGallery,

      rating: hotel.rating ?? "",

      isFeatured: Boolean(hotel.isFeatured),

      isActive: hotel.isActive !== undefined ? Boolean(hotel.isActive) : true,
    });
  }, [hotel]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function generateSlug() {
    if (isReadOnly) return;

    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData((previous) => ({
      ...previous,
      slug,
    }));
  }

  function handleCoverUpload(image) {
    if (isReadOnly) return;

    setFormData((previous) => ({
      ...previous,
      coverImage: image,
    }));
  }

  function handleGalleryChange(images) {
    if (isReadOnly) return;

    setFormData((previous) => ({
      ...previous,
      gallery: Array.isArray(images) ? images : [],
    }));
  }

  function buildPayload() {
    const payload = {
      destination: formData.destination,

      name: formData.name.trim(),

      slug: formData.slug.trim().toLowerCase(),

      description: formData.description.trim(),

      category: formData.category,

      pricePerNight: {
        min: Number(formData.priceMin),
        max: Number(formData.priceMax),
      },

      amenities: formData.amenities
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),

      coverImage: formData.coverImage,

      gallery: Array.isArray(formData.gallery) ? formData.gallery : [],

      isFeatured: Boolean(formData.isFeatured),

      isActive: Boolean(formData.isActive),
    };

    if (formData.address.trim()) {
      payload.address = formData.address.trim();
    }

    if (formData.contactPhone.trim()) {
      payload.contactPhone = formData.contactPhone.trim();
    }

    if (formData.website.trim()) {
      payload.website = formData.website.trim();
    }

    if (formData.latitude !== "") {
      const value = Number(formData.latitude);

      if (!Number.isNaN(value)) {
        payload.latitude = value;
      }
    }

    if (formData.longitude !== "") {
      const value = Number(formData.longitude);

      if (!Number.isNaN(value)) {
        payload.longitude = value;
      }
    }

    if (formData.rating !== "") {
      const value = Number(formData.rating);

      if (!Number.isNaN(value)) {
        payload.rating = value;
      }
    }

    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isReadOnly) return;

    setError("");

    if (!formData.destination) {
      setError("Destination is required.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Hotel name is required.");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Hotel slug is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (formData.priceMin === "" || formData.priceMax === "") {
      setError("Minimum and maximum price are required.");
      return;
    }

    const minPrice = Number(formData.priceMin);

    const maxPrice = Number(formData.priceMax);

    if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
      setError("Price must be a valid number.");
      return;
    }

    if (minPrice < 0 || maxPrice < 0) {
      setError("Price cannot be negative.");
      return;
    }

    if (minPrice > maxPrice) {
      setError("Minimum price cannot be greater than maximum price.");
      return;
    }

    if (!formData.coverImage || !formData.coverImage.url) {
      setError("Cover image is required.");
      return;
    }

    if (formData.rating !== "") {
      const rating = Number(formData.rating);

      if (Number.isNaN(rating) || rating < 0 || rating > 5) {
        setError("Rating must be between 0 and 5.");
        return;
      }
    }

    if (mode === "edit" && !id) {
      setError("Hotel ID is missing. Cannot update hotel.");
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      let response;

      if (mode === "create") {
        response = await adminApi.post("/api/dashboard/hotels", payload);
      } else {
        response = await adminApi.put(`/api/dashboard/hotels/${id}`, payload);
      }

      if (!response?.success) {
        throw new Error(
          response?.message ||
            `Failed to ${mode === "edit" ? "update" : "create"} hotel.`,
        );
      }

      router.push("/admin/dashboard/hotels");

      router.refresh();
    } catch (error) {
      console.error("Hotel save error:", error);

      setError(
        error?.data?.message || error?.message || "Failed to save hotel.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* BASIC INFORMATION */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">Basic Information</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Destination *
            </label>

            <select
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              disabled={loading || isReadOnly}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="">Select destination</option>

              {destinations.map((destination) => (
                <option
                  key={destination._id || destination.id}
                  value={destination._id || destination.id}
                >
                  {destination.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Hotel Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading || isReadOnly}
              placeholder="Example: Taj Hotel"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Slug *</label>

            <div className="flex gap-2">
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                disabled={loading || isReadOnly}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3"
              />

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={generateSlug}
                  disabled={loading}
                  className="rounded-lg bg-slate-100 px-4"
                >
                  Generate
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Category *</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading || isReadOnly}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option value="budget">Budget</option>

              <option value="standard">Standard</option>

              <option value="premium">Premium</option>

              <option value="luxury">Luxury</option>

              <option value="resort">Resort</option>

              <option value="homestay">Homestay</option>

              <option value="hostel">Hostel</option>
            </select>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">Description</h2>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={7}
          disabled={loading || isReadOnly}
          placeholder="Hotel description..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      {/* PRICING */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">Pricing</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Minimum Price *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              name="priceMin"
              value={formData.priceMin}
              onChange={handleChange}
              placeholder="Minimum price"
              disabled={loading || isReadOnly}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Maximum Price *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              name="priceMax"
              value={formData.priceMax}
              onChange={handleChange}
              placeholder="Maximum price"
              disabled={loading || isReadOnly}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Rating</label>

            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="Rating 0 - 5"
              disabled={loading || isReadOnly}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>
        </div>
      </div>

      {/* AMENITIES */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">Amenities</h2>

        <textarea
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          rows={5}
          disabled={loading || isReadOnly}
          placeholder={`WiFi
Swimming Pool
Parking
Restaurant`}
          className="w-full rounded-lg border border-slate-300 px-4 py-3"
        />

        <p className="mt-2 text-xs text-slate-500">
          Enter one amenity per line.
        </p>
      </div>

      {/* LOCATION & CONTACT */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">Location & Contact</h2>

        <div className="space-y-5">
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            disabled={loading || isReadOnly}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              disabled={loading || isReadOnly}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />

            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              disabled={loading || isReadOnly}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <input
            type="text"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="Contact phone"
            disabled={loading || isReadOnly}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />

          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Website URL"
            disabled={loading || isReadOnly}
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>
      </div>

      {/* IMAGES */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold">Images</h2>

        <div className="space-y-6">
          <ImageUpload
            value={formData.coverImage}
            onChange={handleCoverUpload}
            folder="tourism/hotels/cover"
            label="Cover Image"
            disabled={loading || isReadOnly}
          />

          <ImageUpload
            value={formData.gallery}
            onChange={handleGalleryChange}
            folder="tourism/hotels/gallery"
            label="Gallery Images"
            multiple
            disabled={loading || isReadOnly}
          />
        </div>
      </div>

      {/* STATUS */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            disabled={loading || isReadOnly}
          />

          <span>Featured hotel</span>
        </label>

        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            disabled={loading || isReadOnly}
          />

          <span>Active hotel</span>
        </label>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard/hotels")}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-5 py-3"
        >
          Back
        </button>

        {!isReadOnly && (
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
          >
            {loading
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
                ? "Update Hotel"
                : "Create Hotel"}
          </button>
        )}
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/utils/adminApi";
import HotelForm from "@/components/admin/HotelForm";

export default function CreateHotelPage() {
  const router = useRouter();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDestinations() {
      try {
        const response = await adminApi.get(
          "/api/dashboard/destinations"
        );

        if (!mounted) return;

        setDestinations(response?.data || []);
      } catch (error) {
        console.error("Failed to load destinations:", error);
        setDestinations([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDestinations();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading destinations...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <HotelForm
        mode="create"
        destinations={destinations}
        onSuccess={() => {
          router.push("/admin/dashboard/hotels");
        }}
      />
    </div>
  );
}
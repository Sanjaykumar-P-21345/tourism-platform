import PlaceForm from "@/components/admin/PlaceForm";

export default function CreatePlacePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Create Place
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a new tourist place.
        </p>
      </div>

      <PlaceForm />
    </div>
  );
}
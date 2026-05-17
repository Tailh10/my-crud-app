"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Item = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

export default function EditItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/items/${params.id}`)
      .then((res) => {
        if (res.status === 404) throw new Error("not_found");
        if (!res.ok) throw new Error("Failed to fetch item");
        return res.json();
      })
      .then((data: Item) => {
        setItem(data);
        setName(data.name);
        setDescription(data.description ?? "");
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Name is required.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/items/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update item");
      }

      router.push(`/items/${params.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update item");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="h-4 bg-gray-100 rounded w-48 mb-6 animate-pulse" />
        <div className="h-7 bg-gray-100 rounded w-32 mb-6 animate-pulse" />
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fetchError === "not_found" || !item) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <p className="text-gray-500 text-sm mb-4">Item not found.</p>
        <Link href="/items" className="text-blue-600 hover:underline text-sm">
          ← Back to Items
        </Link>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <p className="text-red-500 text-sm mb-4">{fetchError}</p>
        <Link href="/items" className="text-blue-600 hover:underline text-sm">
          ← Back to Items
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/items" className="hover:text-gray-700 transition-colors">
          Items
        </Link>
        <span>/</span>
        <Link href={`/items/${item.id}`} className="hover:text-gray-700 transition-colors">
          {item.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Edit</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
        <p className="text-sm text-gray-500 mt-1">Update the details below.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white border border-gray-200 rounded-lg p-6 space-y-5"
      >
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }}
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              nameError ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Link
            href={`/items/${item.id}`}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

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

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/items/${params.id}`)
      .then((res) => {
        if (res.status === 404) throw new Error("not_found");
        if (!res.ok) throw new Error("Failed to fetch item");
        return res.json();
      })
      .then(setItem)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/items/${params.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete item");
      }
      router.push("/items");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete item");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="h-4 bg-gray-100 rounded w-32 mb-6 animate-pulse" />
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error === "not_found" || !item) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <p className="text-gray-500 text-sm mb-4">Item not found.</p>
        <Link href="/items" className="text-blue-600 hover:underline text-sm">
          ← Back to Items
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <Link href="/items" className="text-blue-600 hover:underline text-sm">
          ← Back to Items
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/items" className="hover:text-gray-700 transition-colors">
            Items
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{item.name}</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Name</p>
            <p className="text-gray-900 font-medium">{item.name}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {item.description || <span className="text-gray-400 italic">No description</span>}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Created</p>
            <p className="text-gray-700 text-sm">{formattedDate}</p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowConfirm(true)}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Delete
            </button>
            <Link
              href={`/items/${item.id}/edit`}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Delete item?</h2>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium text-gray-700">{item.name}</span> will be permanently
              removed. This cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-red-500 mb-4">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

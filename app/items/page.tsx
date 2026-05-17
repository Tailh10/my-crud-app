"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

type SortBy = "name" | "created_at";
type Order = "asc" | "desc";

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [order, setOrder] = useState<Order>("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  // Debounce search input by 300 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Re-fetch whenever any filter changes
  useEffect(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateError("'From' date must be on or before 'To' date.");
      return;
    }
    setDateError(null);

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("sortBy", sortBy);
    params.set("order", order);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    setLoading(true);
    setError(null);

    fetch(`/api/items?${params}`)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error ?? "Failed to fetch items"); });
        return res.json();
      })
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [debouncedSearch, sortBy, order, dateFrom, dateTo]);

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setSortBy("created_at");
    setOrder("desc");
    setDateFrom("");
    setDateTo("");
    setDateError(null);
  }

  const hasActiveFilters =
    search || dateFrom || dateTo || sortBy !== "created_at" || order !== "desc";

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        <Link
          href="/items/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add New
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Sort: Date</option>
            <option value="name">Sort: Name</option>
          </select>

          <button
            onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50 transition-colors w-24"
          >
            {order === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-gray-500">Date range:</span>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {dateError && <p className="text-xs text-red-500">{dateError}</p>}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-6" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-28" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-52" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-16 ml-auto" /></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-red-500">
                  {error}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                  {hasActiveFilters ? "No items match your filters." : "No items yet."}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <Link href={`/items/${item.id}`} className="hover:underline">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/items/${item.id}/edit`}
                      className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deletingId === item.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && (
        <p className="mt-3 text-xs text-gray-400">{items.length} item(s)</p>
      )}
    </div>
  );
}

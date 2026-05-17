import Link from "next/link";

export default function About() {
  return (
    <div className="flex flex-col items-center text-center gap-8 py-24">
      <div className="flex flex-col gap-4 max-w-xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          About This App
        </h1>
        <p className="text-gray-500 leading-relaxed">
          CRUD App is a modern product management application built with
          Next.js 14, TypeScript, and Tailwind CSS. It uses the App Router for
          fast, server-first rendering and demonstrates full Create, Read,
          Update, and Delete operations in a clean, minimal interface.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-50 transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

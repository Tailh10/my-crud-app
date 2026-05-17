import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SORT_COLUMNS = { name: "name", created_at: "created_at" } as const;
const SORT_ORDERS = { asc: "ASC", desc: "DESC" } as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const search = searchParams.get("search")?.trim() || null;
    const dateFrom = searchParams.get("dateFrom") || null;
    const dateTo = searchParams.get("dateTo") || null;
    const sortCol = SORT_COLUMNS[searchParams.get("sortBy") as keyof typeof SORT_COLUMNS] ?? "created_at";
    const sortOrder = SORT_ORDERS[searchParams.get("order") as keyof typeof SORT_ORDERS] ?? "DESC";

    if (dateFrom && dateTo && dateFrom > dateTo) {
      return NextResponse.json(
        { error: "dateFrom must not be later than dateTo" },
        { status: 400 }
      );
    }

    const items = await sql.query(
      `SELECT id, name, description, created_at
       FROM items
       WHERE
         ($1::text IS NULL OR name ILIKE '%' || $1 || '%')
         AND ($2::date IS NULL OR DATE(created_at) >= $2::date)
         AND ($3::date IS NULL OR DATE(created_at) <= $3::date)
       ORDER BY ${sortCol} ${sortOrder}`,
      [search, dateFrom, dateTo]
    );

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/items:", err);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();
    const description = body?.description?.trim() ?? null;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [item] = await sql`
      INSERT INTO items (name, description)
      VALUES (${name}, ${description})
      RETURNING id, name, description, created_at
    `;
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("POST /api/items:", err);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

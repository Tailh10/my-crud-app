import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const [item] = await sql`
      SELECT id, name, description, created_at
      FROM items
      WHERE id = ${id}
    `;
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err) {
    console.error("GET /api/items/[id]:", err);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const name = body?.name?.trim();
    const description = body?.description?.trim() ?? null;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [item] = await sql`
      UPDATE items
      SET name = ${name}, description = ${description}
      WHERE id = ${id}
      RETURNING id, name, description, created_at
    `;

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (err) {
    console.error("PUT /api/items/[id]:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    const [item] = await sql`
      DELETE FROM items
      WHERE id = ${id}
      RETURNING id
    `;

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/items/[id]:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
